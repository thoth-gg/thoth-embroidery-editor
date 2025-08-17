import { Boundary, Point, type Path } from '@/models/point'
import type { Step } from '@/models/step'
import { EditorMode, useStore } from '@/store/store'
import { bezier } from '@/utils/bezier'
import { rescalePathXY } from '@/utils/transform'
import type p5 from 'p5'

const { Process, ProcessSetStartPoint, ProcessSetEndPoint, ProcessSetControlPoints } = EditorMode

export function drawStep(p: p5) {
  const store = useStore()
  const step = store.selectedStep
  if (!step) return

  const stepBoundary = Boundary.fromPath(step.sourcePath)
  const drawBoundary = stepBoundary.padding(30)

  const sourcePath = rescalePathXY(step.sourcePath, p.width, p.height, drawBoundary)
  const debugPath = store.debugPath
    ? rescalePathXY(store.debugPath, p.width, p.height, drawBoundary)
    : []

  const color = p.color(step.color)
  if (store.editor.mode.is(ProcessSetStartPoint, ProcessSetEndPoint, ProcessSetControlPoints)) {
    color.setAlpha(50)
  }
  p.fill(color)
  p.noStroke()

  p.beginShape()
  sourcePath.forEach((point) => p.vertex(point.x, point.y))
  p.endShape()

  p.noFill()
  p.stroke(0, 0, 255)
  p.strokeWeight(1)
  p.beginShape()
  debugPath.forEach((point) => p.vertex(point.x, point.y))
  p.endShape()

  if (store.selectedStep.embroideryProcess.key === 'Satin2Points') {
    drawStartEndPoints(p, store.editor.mode, step, sourcePath)
  }

  if (store.editor.mode.is(ProcessSetStartPoint, ProcessSetEndPoint)) {
    drawSetStartEndPointUI(p, step, sourcePath)
  }

  if (store.editor.mode.is(ProcessSetControlPoints)) {
    drawSetControlPointsUI(p)
  }

  if (store.selectedStep.embroideryProcess.key === 'SatinBezier') {
    drawBezierCurve(p)
  }
}

function drawStartEndPoints(p: p5, editorMode: EditorMode, step: any, rescaledPath: any[]) {
  p.strokeWeight(5)
  rescaledPath.forEach((point) => {
    if (point.id == step.satin?.satinStartPointId) {
      p.stroke(255, 0, 0, editorMode === ProcessSetStartPoint ? 100 : 255)
      p.point(point.x, point.y)
    }
    if (point.id == step.satin?.satinEndPointId) {
      p.stroke(0, 170, 0, editorMode === ProcessSetEndPoint ? 100 : 255)
      p.point(point.x, point.y)
    }
  })
}

function drawBezierCurve(p: p5) {
  p.stroke(0, 170, 0)
  p.strokeWeight(2)
  p.noFill()
  p.beginShape()
  const b = bezier(controlPoints, 100)
  b.forEach((point) => {
    p.vertex(point.x, point.y)
  })
  p.endShape()

  p.stroke(0, 0, 255)
  p.strokeWeight(1)
  for (let i = 0; i < b.length - 1; i++) {
    const p1 = b[i]
    const p2 = b[i + 1]
    const rad = p.atan2(p1.x - p2.x, p1.y - p2.y)
    // p1からp2への直線に垂直な線を引く
    p.line(p1.x, p1.y, p1.x + 300 * p.sin(rad + p.HALF_PI), p1.y + 300 * p.cos(rad + p.HALF_PI))
  }
}

const isMouseInBounds = (x: number, y: number, p: p5) => {
  return 0 <= x && x <= p.width && 0 <= y && y <= p.height
}

function drawSetStartEndPointUI(p: p5, step: Step, sourcePath: Path) {
  const store = useStore()

  const mouseX = p.mouseX
  const mouseY = p.mouseY
  const min = sourcePath.reduce(
    (min, current) => {
      return p.dist(current.x, current.y, mouseX, mouseY) < p.dist(min.x, min.y, mouseX, mouseY)
        ? current
        : min
    },
    new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
  )

  p.stroke(0)
  p.strokeWeight(1)
  sourcePath.forEach((point) => p.point(point.x, point.y))

  if (isMouseInBounds(mouseX, mouseY, p)) {
    p.stroke(0)
    p.strokeWeight(5)
    p.point(min.x, min.y)

    if (p.mouseIsPressed) {
      if (!step.satin) {
        step.satin = {
          satinStartPointId: null,
          satinEndPointId: null,
        }
      }
      if (store.editor.mode.is(ProcessSetStartPoint)) {
        if (step.satin.satinStartPointId === min.id) {
          step.satin.satinStartPointId = null
        } else if (step.satin.satinEndPointId === min.id) {
          step.satin.satinEndPointId = null
          step.satin.satinStartPointId = min.id
        } else {
          step.satin.satinStartPointId = min.id
        }
      }
      if (store.editor.mode.is(ProcessSetEndPoint)) {
        if (step.satin.satinEndPointId === min.id) {
          step.satin.satinEndPointId = null
        } else if (step.satin.satinStartPointId === min.id) {
          step.satin.satinStartPointId = null
          step.satin.satinEndPointId = min.id
        } else {
          step.satin.satinEndPointId = min.id
        }
      }
      store.editor.mode = Process
    }
  }
}

let controlPoints: Point[] = []
let draggingPointId: string | null = null
/* クリック検出用 */
let wasMousePressed = false
let lastClickTime = 0
let lastClickPos: { x: number; y: number } | null = null

/* 点と線分の距離 */
const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const vx = x2 - x1
  const vy = y2 - y1
  const wx = px - x1
  const wy = py - y1

  const c1 = vx * wx + vy * wy
  if (c1 <= 0) return Math.hypot(px - x1, py - y1)

  const c2 = vx * vx + vy * vy
  if (c2 <= c1) return Math.hypot(px - x2, py - y2)

  const b = c1 / c2
  const bx = x1 + b * vx
  const by = y1 + b * vy
  return Math.hypot(px - bx, py - by)
}

function drawSetControlPointsUI(p: p5) {
  const { mouseX, mouseY } = p

  /* 初期 3 点 */
  if (controlPoints.length === 0)
    controlPoints = [
      { id: crypto.randomUUID(), x: 100, y: p.height / 2 },
      { id: crypto.randomUUID(), x: p.width / 2, y: 100 },
      { id: crypto.randomUUID(), x: p.width - 100, y: p.height / 2 },
    ]

  /* ────────── マウス押下中 ────────── */
  if (p.mouseIsPressed) {
    /* 押した最初のフレームだけ判定 */
    if (!wasMousePressed) {
      /* 既存点のドラッグ判定 */
      const closest = controlPoints.reduce((a, b) =>
        p.dist(mouseX, mouseY, a.x, a.y) < p.dist(mouseX, mouseY, b.x, b.y) ? a : b,
      )

      if (p.dist(mouseX, mouseY, closest.x, closest.y) < 15) {
        draggingPointId = closest.id
      } else {
        /* TODO① クリック地点が線分から10px以内なら新規点を挿入 */
        for (let i = 0; i < controlPoints.length - 1; i++) {
          const a = controlPoints[i]
          const b = controlPoints[i + 1]
          if (distToSegment(mouseX, mouseY, a.x, a.y, b.x, b.y) < 10) {
            const newPt: Point = {
              id: crypto.randomUUID(),
              x: mouseX,
              y: mouseY,
            }
            controlPoints.splice(i + 1, 0, newPt)
            draggingPointId = newPt.id // そのままドラッグ開始
            break
          }
        }
      }
    }

    /* ドラッグ中は座標を更新 */
    if (draggingPointId) {
      const pt = controlPoints.find((p) => p.id === draggingPointId)
      if (pt) {
        pt.x = mouseX
        pt.y = mouseY
      }
    }
  } else {
    /* ────────── マウスを離した瞬間 ────────── */
    draggingPointId = null

    const now = p.millis()
    if (wasMousePressed) {
      /* ダブルクリック判定: 300 ms 以内 & 位置がほぼ同じ */
      if (
        lastClickPos &&
        now - lastClickTime < 300 &&
        p.dist(mouseX, mouseY, lastClickPos.x, lastClickPos.y) < 5
      ) {
        /* TODO② ダブルクリックされた点を削除 */
        const idx = controlPoints.findIndex((pt) => p.dist(mouseX, mouseY, pt.x, pt.y) < 15)
        if (idx !== -1) controlPoints.splice(idx, 1)
        lastClickPos = null
      } else {
        lastClickPos = { x: mouseX, y: mouseY }
        lastClickTime = now
      }
    }
  }
  wasMousePressed = p.mouseIsPressed

  /* ────────── 描画 ────────── */
  p.noFill()
  p.strokeWeight(1)
  p.stroke(0)
  p.beginShape()
  controlPoints.forEach((pt) => {
    p.vertex(pt.x, pt.y)
    p.stroke(0)
    p.ellipse(pt.x, pt.y, 30)
    p.stroke(255)
    p.ellipse(pt.x, pt.y, 29)
  })
  p.stroke(255, 0, 0)
  p.endShape()
}
