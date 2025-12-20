import p5 from "p5";
import { EditorView } from "./p5interface";
import { useStore } from "@/store/store";
import { rescalePathXY } from "@/utils/transform";
import { Boundary, Path } from "@/models/point";
import { StepPreview } from "./step-preview";

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

    step.previewPathList.forEach(({ color, path, weight }) => {
      p.stroke(color)
      p.strokeWeight(weight)
      drawPath(p, rescalePathXY(path, p.width, p.height, drawBoundary))
    })

    step.previewPointList.forEach(({ color, pointId, size }) => {
      const point = sourcePath.find((p) => p.id === pointId)
      if (point) {
        p.stroke(color)
        p.strokeWeight(size)
        p.point(point.x, point.y)
      }
      return point
    })
  }

  mouseClicked(p: p5): void { }
  doubleClicked(p: p5): void { }
}

function drawPath(p: p5, path: Path) {
  p.beginShape()
  path.forEach((point) => p.vertex(point.x, point.y))
  p.endShape()
}