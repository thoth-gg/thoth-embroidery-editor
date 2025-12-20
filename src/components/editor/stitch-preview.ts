import p5 from "p5";
import { EditorView } from "./p5interface";
import { useStore } from "@/store/store";
import { rescalePathXY } from "@/utils/transform";
import { Path } from "@/models/point";

export class StitchPreview extends EditorView {
  draw(p: p5): void {
    const store = useStore()
    const embroidery = store.embroidery
    if (!embroidery) return

    p.noFill()
    p.stroke("#000000")
    p.strokeWeight(0.3)
    p.beginShape()
    store.processList.forEach((process) => {
      const stitchPath = new Path(...process.getStitchList().map(stitch => stitch.point))
      rescalePathXY(stitchPath, p.width, p.height, store.embroideryBoundary!).forEach((point) =>
        p.vertex(point.x, point.y),
      )
    })
    p.endShape()
  }

  mouseClicked(p: p5): void { }
  doubleClicked(p: p5): void { }
}
