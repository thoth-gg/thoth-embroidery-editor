import p5 from "p5";
import { EditorView } from "./p5interface";
import { useStore } from "@/store/store";
import { rescalePathXY } from "@/utils/transform";
import { Boundary, Path, Point } from "@/models/point";

export class StepPreview extends EditorView {
  draw(p: p5): void {
    const store = useStore()
    const embroidery = store.embroidery
    if (!embroidery) return

    embroidery.stepList.forEach((step) => {
      const color = p.color(step.color)
      if (store.selectedStep && store.selectedStep?.id !== step.id) color.setAlpha(50)
      p.fill(color)

      p.beginShape()
      rescalePathXY(step.sourcePath, p.width, p.height, store.embroideryBoundary!).forEach((point) =>
        p.vertex(point.x, point.y),
      )
      p.endShape()
    })
  }

  mouseClicked(p: p5): void { }
  doubleClicked(p: p5): void { }
}
