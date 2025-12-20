import p5 from "p5";
import { EditorView } from "./p5interface";
import { useStore } from "@/store/store";
import { rescalePathXY } from "@/utils/transform";
import { Path, Point } from "@/models/point";

export class StitchPreview extends EditorView {
  draw(p: p5): void {
    const store = useStore()
    const embroidery = store.embroidery
    if (!embroidery) return

    p.noFill()
    p.strokeWeight(0.3)
    p.beginShape()
    let totalStitchCount = 0
    let lastPoint: Point | null = null
    store.processList.forEach((process) => {
      const isSelected = store.editor.selectedProcessId === process.id
      p.endShape()
      p.stroke(isSelected ? "#ff0000" : "#000000")
      p.beginShape()
      if (lastPoint) {
        p.vertex(lastPoint.x, lastPoint.y)
      }

      const path = rescalePathXY(new Path(...process.getStitchList().map(s => s.point)), p.width, p.height, store.embroideryBoundary!);
      path.forEach((point) => {
        if (totalStitchCount >= store.previewStitchLimit) {
          return
        }
        p.vertex(point.x, point.y)
        lastPoint = point
        totalStitchCount++
      })
    })
    p.endShape()
  }

  mouseClicked(p: p5): void { }
  doubleClicked(p: p5): void { }
}
