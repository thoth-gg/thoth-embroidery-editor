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
    const drawBoundary = stepBoundary.padding(30)

    p.fill(step.color)
    p.noStroke()
    drawPath(p, rescalePathXY(step.sourcePath, p.width, p.height, drawBoundary))

    p.noFill()
    p.stroke(0, 0, 255)
    p.strokeWeight(1)
    drawPath(p, rescalePathXY(store.debugPath || new Path(), p.width, p.height, drawBoundary))
  }

  mouseClicked(p: p5): void { }
  doubleClicked(p: p5): void { }
}

function drawPath(p: p5, path: Path) {
  p.beginShape()
  path.forEach((point) => p.vertex(point.x, point.y))
  p.endShape()
}