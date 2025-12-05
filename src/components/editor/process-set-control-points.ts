import p5 from "p5";
import { EditorView } from "./p5interface";
import { useStore } from "@/store/store";
import { rescalePathXY } from "@/utils/transform";
import { Boundary, Path, Point } from "@/models/point";
import { StepPreview } from "./step-preview";
import { ProcessPreview } from "./process-preview";

const stepPreview = new StepPreview()

export enum ControlPointsType {
  StartPoints,
  EndPoints,
  ControlPoints,
}

export class ProcessSetControlPoints extends EditorView {
  controlPointsType: ControlPointsType;
  firstPointId: string | null = null;
  store
  step

  constructor(controlPointsType: ControlPointsType) {
    super()
    this.controlPointsType = controlPointsType
    this.store = useStore()
    const step = this.store.selectedStep
    if (!step) {
      this.store.editorView = new ProcessPreview()
      return
    }
    this.step = step
  }

  private isMouseInBounds(x: number, y: number, p: p5) {
    return 0 <= x && x <= p.width && 0 <= y && y <= p.height
  }

  private getNearbyPointOnPath(p: p5, x: number, y: number, path: Path) {
    return path.reduce(
      (m, c) => p.dist(c.x, c.y, x, y) < p.dist(m.x, m.y, x, y) ? c : m,
      new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
    )
  }

  private drawPath(p: p5, path: Path) {
    p.beginShape()
    path.forEach((point) => p.vertex(point.x, point.y))
    p.endShape()
  }

  draw(p: p5): void {
    if (!this.step) return
    const stepBoundary = Boundary.fromPath(this.step.sourcePath)
    const drawBoundary = stepBoundary.padding(this.store.previewMargin)
    const sourcePath = rescalePathXY(this.step.sourcePath, p.width, p.height, drawBoundary)

    const mouseX = p.mouseX
    const mouseY = p.mouseY

    this.store.stepList.forEach((s) => {
      const color = p.color(s.color)
      color.setAlpha(s.id === this.step?.id ? 70 : 10)
      p.fill(color)
      p.noStroke()
      this.drawPath(p, rescalePathXY(s.sourcePath, p.width, p.height, drawBoundary))
    })

    p.stroke(0)
    p.strokeWeight(1)
    sourcePath.forEach((point) => p.point(point.x, point.y))

    p.stroke(0)
    p.strokeWeight(5)

    const point = sourcePath.find(p => p.id == this.firstPointId)
    if (point) {
      p.point(point.x, point.y)
    }

    if (this.isMouseInBounds(mouseX, mouseY, p)) {
      const nearbyPoint = this.getNearbyPointOnPath(p, mouseX, mouseY, sourcePath)
      p.point(nearbyPoint.x, nearbyPoint.y)
    }
  }

  mouseClicked(p: p5): void {
    if (!this.isMouseInBounds(p.mouseX, p.mouseY, p)) {
      return
    }
    if (!this.step) return
    const stepBoundary = Boundary.fromPath(this.step.sourcePath)
    const drawBoundary = stepBoundary.padding(this.store.previewMargin)
    const sourcePath = rescalePathXY(this.step.sourcePath, p.width, p.height, drawBoundary)
    const nearbyPoint = this.getNearbyPointOnPath(p, p.mouseX, p.mouseY, sourcePath)
    if (!this.step.satin) {
      this.step.satin = { startPoints: null, endPoints: null, controlPointPairList: [] }
    }
    if (this.firstPointId === null) {
      this.firstPointId = nearbyPoint.id
    } else {
      const secondPointId = nearbyPoint.id
      if (this.controlPointsType === ControlPointsType.StartPoints) {
        this.step.satin!.startPoints = { firstPointId: this.firstPointId, secondPointId }
      } else if (this.controlPointsType === ControlPointsType.EndPoints) {
        this.step.satin!.endPoints = { firstPointId: this.firstPointId, secondPointId }
      } else if (this.controlPointsType === ControlPointsType.ControlPoints) {
        const { positivePath, negativePath } = this.step.sourcePath.analyzePath(
          this.step.satin.startPoints!,
          this.step.satin.endPoints!,
        )
        if (positivePath.find(p => p.id === this.firstPointId) !== undefined &&
          negativePath.find(p => p.id === secondPointId) !== undefined) {
          this.step.satin!.controlPointPairList.push({ positivePathPointId: this.firstPointId, negativePathPointId: secondPointId })
        } else if (negativePath.find(p => p.id === this.firstPointId) !== undefined &&
          positivePath.find(p => p.id === secondPointId) !== undefined) {
          this.step.satin!.controlPointPairList.push({ positivePathPointId: secondPointId, negativePathPointId: this.firstPointId })
        } else {
          alert('制御点は、正負のパスからそれぞれ1点ずつ選択してください。')
        }
      }
      this.store.editorView = new ProcessPreview()
    }
  }
  doubleClicked(p: p5): void { }
}
