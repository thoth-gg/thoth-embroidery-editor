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
    let totalStitchCount = 0
    store.processList.forEach((process) => {
      let stitchList = process.getStitchList()
      if (store.previewStitchLimit > 0) {
        const remainingLimit = store.previewStitchLimit - totalStitchCount
        if (remainingLimit <= 0) return
        stitchList = stitchList.slice(0, remainingLimit)
        totalStitchCount += stitchList.length
      }
      const stitchPath = new Path(...stitchList.map(stitch => stitch.point))
      rescalePathXY(stitchPath, p.width, p.height, store.embroideryBoundary!).forEach((point) =>
        p.vertex(point.x, point.y),
      )
    })
    p.endShape()
  }

  mouseClicked(p: p5): void { }
  doubleClicked(p: p5): void { }
}
