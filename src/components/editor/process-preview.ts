import p5 from "p5";
import { EditorView } from "./p5interface";
import { useStore } from "@/store/store";
import { rescalePathXY } from "@/utils/transform";
import { Boundary, Path } from "@/models/point";
import { StepPreview } from "./step-preview";
import { calcDistance, dividePath } from "@/utils/curve";

const stepPreview = new StepPreview()

export class ProcessPreview extends EditorView {
  draw(p: p5): void {
    const store = useStore()
    const step = store.selectedStep
    if (!step) {
      stepPreview.draw(p)
      return
    }

    const stepBoundary = Boundary.fromPath(step.sourcePath)
    const drawBoundary = stepBoundary.padding(store.previewMargin)
    const sourcePath = rescalePathXY(step.sourcePath, p.width, p.height, drawBoundary)

    store.stepList.forEach((s) => {
      if (s.id === step.id) return
      const color = p.color(s.color)
      color.setAlpha(10)
      p.fill(color)
      p.noStroke()
      drawPath(p, rescalePathXY(s.sourcePath, p.width, p.height, drawBoundary))
    })

    p.fill(step.color)
    p.noStroke()
    drawPath(p, rescalePathXY(step.sourcePath, p.width, p.height, drawBoundary))

    p.noFill()
    p.stroke(0, 0, 255)
    p.strokeWeight(1)
    drawPath(p, rescalePathXY(store.debugPath || new Path(), p.width, p.height, drawBoundary))

    p.strokeWeight(5)
    const drawPoint = (pointId: string | null, color: any, alpha: number) => {
      const point = sourcePath.find((p) => p.id === pointId)
      if (point) {
        p.stroke(color[0], color[1], color[2], alpha)
        p.point(point.x, point.y)
      }
      return point
    }

    step.satin?.startPoints && drawPoint(step.satin.startPoints.firstPointId, [255, 0, 0], 255)
    step.satin?.startPoints && drawPoint(step.satin.startPoints.secondPointId, [255, 0, 0], 255)
    step.satin?.endPoints && drawPoint(step.satin.endPoints.firstPointId, [0, 170, 0], 255)
    step.satin?.endPoints && drawPoint(step.satin.endPoints.secondPointId, [0, 170, 0], 255)

    step.satin?.controlPointPairList.forEach((pair) => {
      const p1 = drawPoint(pair.positivePathPointId, [255, 100, 255], 200)
      const p2 = drawPoint(pair.negativePathPointId, [255, 100, 255], 200)
      p.line(
        p1 ? p1.x : 0,
        p1 ? p1.y : 0,
        p2 ? p2.x : 0,
        p2 ? p2.y : 0
      )
    })

    if (step.satin?.startPoints && step.satin?.endPoints) {
      const path = store.selectedStep.sourcePath
      const { positivePath, negativePath } = path.analyzePath(step.satin.startPoints, step.satin.endPoints)

      const n = Math.ceil(Math.max(calcDistance(positivePath), calcDistance(negativePath)))
      const posiPath = dividePath(positivePath, n + 1)
      const negaPath = dividePath(negativePath, n).reverse()

      const result = new Path()
      for (let i = 0; i < n; i++) {
        result.push(posiPath[i])
        result.push(negaPath[i])
      }
      p.stroke(255, 0, 255, 100)
      p.strokeWeight(1)
      drawPath(p, rescalePathXY(result, p.width, p.height, drawBoundary))
    }
  }

  mouseClicked(p: p5): void { }
  doubleClicked(p: p5): void { }
}

function drawPath(p: p5, path: Path) {
  p.beginShape()
  path.forEach((point) => p.vertex(point.x, point.y))
  p.endShape()
}