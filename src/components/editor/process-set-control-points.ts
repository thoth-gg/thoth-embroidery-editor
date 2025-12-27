import p5 from 'p5'
import { EditorView } from './p5interface'
import { useStore } from '@/store/store'
import { rescalePathXY } from '@/utils/transform'
import { Boundary, Path, Point } from '@/models/point'
import { ProcessPreview } from './process-preview'
import { SatinStep } from '@/models/step'

export enum ControlPointsType {
  StartAndEndPoints,
  ControlPoints,
  SplitPoints,
}

export class ProcessSetControlPoints extends EditorView {
  controlPointsType: ControlPointsType
  firstPointId: string | null = null
  secondPointId: string | null = null
  thirdPointId: string | null = null
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
      (m, c) => (p.dist(c.x, c.y, x, y) < p.dist(m.x, m.y, x, y) ? c : m),
      new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
    )
  }

  private drawPath(p: p5, path: Path) {
    p.beginShape()
    path.forEach((point) => p.vertex(point.x, point.y))
    p.endShape()
  }

  getFilteredPath(sourcePath: Path): Path {
    if (this.controlPointsType === ControlPointsType.SplitPoints) return sourcePath
    if (!(this.store.selectedStep instanceof SatinStep)) return sourcePath
    if (this.store.selectedStep.splitPoints === null) return sourcePath
    const positivePath = sourcePath.getPositivePath(
      this.store.selectedStep.splitPoints.positivePointId,
      this.store.selectedStep.splitPoints.negativePointId,
    )
    const negativePath = sourcePath.getNegativePath(
      this.store.selectedStep.splitPoints.positivePointId,
      this.store.selectedStep.splitPoints.negativePointId,
    )

    const filteredPath = sourcePath.filter((point) => {
      if (this.controlPointsType === ControlPointsType.SplitPoints) return true
      if (!(this.store.selectedStep instanceof SatinStep)) return true
      let result = false
      if (this.store.selectedStep.splitPoints?.isSelectedA) {
        result = result || positivePath.includes(point)
      }
      if (this.store.selectedStep.splitPoints?.isSelectedB) {
        result = result || negativePath.includes(point)
      }
      return result
    })
    return new Path(...filteredPath)
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

    const filteredPath = this.getFilteredPath(sourcePath)

    p.stroke(0)
    p.strokeWeight(1)
    filteredPath.forEach((point) => p.point(point.x, point.y))

    p.stroke(0)
    p.strokeWeight(5)

    filteredPath
      .filter((point) =>
        [this.firstPointId, this.secondPointId, this.thirdPointId].includes(point.id),
      )
      .forEach((point) => p.point(point.x, point.y))

    if (this.isMouseInBounds(mouseX, mouseY, p)) {
      const nearbyPoint = this.getNearbyPointOnPath(p, mouseX, mouseY, new Path(...filteredPath))
      p.point(nearbyPoint.x, nearbyPoint.y)
    }
  }

  mouseClicked(p: p5): void {
    if (!this.isMouseInBounds(p.mouseX, p.mouseY, p)) {
      return
    }
    // SatinStepのみ対応
    if (!(this.step instanceof SatinStep)) return
    const stepBoundary = Boundary.fromPath(this.step.sourcePath)
    const drawBoundary = stepBoundary.padding(this.store.previewMargin)
    const sourcePath = rescalePathXY(this.step.sourcePath, p.width, p.height, drawBoundary)
    const filteredPath = this.getFilteredPath(sourcePath)
    const nearbyPoint = this.getNearbyPointOnPath(p, p.mouseX, p.mouseY, filteredPath)
    if (this.firstPointId === null) {
      this.firstPointId = nearbyPoint.id
      return
    }

    switch (this.controlPointsType) {
      case ControlPointsType.StartAndEndPoints: {
        if (this.secondPointId === null) {
          this.secondPointId = nearbyPoint.id
          return
        }
        if (this.thirdPointId === null) {
          this.thirdPointId = nearbyPoint.id
          return
        }
        const startPoints = { firstPointId: this.firstPointId, secondPointId: this.secondPointId }
        const endPoints = { firstPointId: this.thirdPointId, secondPointId: nearbyPoint.id }
        const { positivePath, negativePath } = this.step.sourcePath.analyzePath(
          startPoints,
          endPoints,
        )
        this.step.startAndEndPoints = {
          positivePathStartPointId: positivePath[0].id == this.firstPointId ? this.firstPointId : this.secondPointId,
          negativePathStartPointId: positivePath[0].id == this.firstPointId ? this.secondPointId : this.firstPointId,
          positivePathEndPointId: positivePath[0].id == this.thirdPointId ? this.thirdPointId : nearbyPoint.id,
          negativePathEndPointId: positivePath[0].id == this.thirdPointId ? nearbyPoint.id : this.thirdPointId,
        }
        this.step.updateProcessList()
        this.store.editorView = new ProcessPreview()
        return
      }
      case ControlPointsType.ControlPoints: {

        const positivePath = this.step.sourcePath.getPositivePath(
          this.step.startAndEndPoints!.positivePathStartPointId,
          this.step.startAndEndPoints!.positivePathEndPointId,
        )
        const negativePath = this.step.sourcePath.getNegativePath(
          this.step.startAndEndPoints!.negativePathStartPointId,
          this.step.startAndEndPoints!.negativePathEndPointId,
        )
        if (
          positivePath.find((p) => p.id === this.firstPointId) !== undefined &&
          negativePath.find((p) => p.id === nearbyPoint.id) !== undefined
        ) {
          this.step.positiveControlPointIdList.push(this.firstPointId)
          this.step.negativeControlPointIdList.push(nearbyPoint.id)
        } else if (
          negativePath.find((p) => p.id === this.firstPointId) !== undefined &&
          positivePath.find((p) => p.id === nearbyPoint.id) !== undefined
        ) {
          this.step.positiveControlPointIdList.push(nearbyPoint.id)
          this.step.negativeControlPointIdList.push(this.firstPointId)
        } else {
          alert('制御点は、正負のパスからそれぞれ1点ずつ選択してください。')
        }
        this.step.updateProcessList()
        this.store.editorView = new ProcessPreview()
        return
      }
      case ControlPointsType.SplitPoints: {
        this.step.splitPoints = {
          positivePointId: this.firstPointId,
          negativePointId: nearbyPoint.id,
          isSelectedA: true,
          isSelectedB: true,
        }
        this.store.editorView = new ProcessPreview()
        return
      }
    }
  }
  doubleClicked(p: p5): void { }
}
