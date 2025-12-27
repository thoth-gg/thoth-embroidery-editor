import p5 from "p5";
import { EditorView } from "./p5interface";
import { useStore } from "@/store/store";
import { rescalePathXY, inverseRescalePathXY } from "@/utils/transform";
import { Path, Point } from "@/models/point";
import { ManualProcess } from "@/models/process";

export class ManualProcessEdit extends EditorView {
    store: ReturnType<typeof useStore> | null = null

    draw(p: p5): void {
        if (this.store == null) this.store = useStore()
        const embroidery = this.store.embroidery
        if (!embroidery) return

        if (this.processId != this.store.selectedProcess!.id) {
            this.processId = this.store.selectedProcess!.id
            if (this.store.selectedProcess instanceof ManualProcess) {
                this.controlPoints = rescalePathXY(new Path(...this.store.selectedProcess.pointList), p.width, p.height, this.store.embroideryBoundary!)
            }
        }

        p.noStroke()
        embroidery.stepList.forEach((step) => {
            const color = p.color(step.color)
            color.setAlpha(30)
            p.fill(color)

            p.beginShape()
            rescalePathXY(step.sourcePath, p.width, p.height, this.store?.embroideryBoundary!).forEach((pt) => p.vertex(pt.x, pt.y))
            p.endShape()
        });

        p.noFill()
        p.strokeWeight(0.3)
        this.store.processList.forEach((process) => {
            if (this.store?.editor.selectedProcessId === process.id) {
                return
            }
            p.stroke("#000000")

            p.beginShape()
            const path = rescalePathXY(new Path(...process.getStitchList().map(s => s.point)), p.width, p.height, this.store?.embroideryBoundary!);
            path.forEach((point) => p.vertex(point.x, point.y))
            p.endShape()
        })
        this.drawStitchEditor(p)
    }

    mouseClicked(p: p5): void {
        // TODO: 実装予定
    }

    doubleClicked(p: p5): void {
        // TODO: 実装予定
    }

    wasMousePressed = false
    lastClickTime = 0
    lastClickPos: Point | null = null
    draggingPointId: string | null = null
    processId: string | null = null
    controlPoints: Path | null = null

    distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
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

    drawStitchEditor(p: p5) {
        if (this.store == null || !(this.store.selectedProcess instanceof ManualProcess)) return

        /* ────────── マウス押下中 ────────── */
        if (p.mouseIsPressed) {
            /* 押した最初のフレームだけ判定 */
            if (!this.wasMousePressed) {
                /* 既存点のドラッグ判定 */
                const closest = this.controlPoints!.reduce((a, b) =>
                    p.dist(p.mouseX, p.mouseY, a.x, a.y) < p.dist(p.mouseX, p.mouseY, b.x, b.y) ? a : b,
                )

                if (p.dist(p.mouseX, p.mouseY, closest.x, closest.y) < 15) {
                    // 最初と最後でない
                    if (closest.id !== this.controlPoints![0].id && closest.id !== this.controlPoints![this.controlPoints!.length - 1].id) {
                        this.draggingPointId = closest.id
                    }
                } else {
                    /* TODO① クリック地点が線分から10px以内なら新規点を挿入 */
                    for (let i = 0; i < this.controlPoints!.length - 1; i++) {
                        const a = this.controlPoints![i]
                        const b = this.controlPoints![i + 1]
                        if (this.distToSegment(p.mouseX, p.mouseY, a.x, a.y, b.x, b.y) < 10) {
                            const newPt: Point = {
                                id: crypto.randomUUID(),
                                x: p.mouseX,
                                y: p.mouseY,
                            }
                            this.controlPoints!.splice(i + 1, 0, newPt)
                            this.draggingPointId = newPt.id // そのままドラッグ開始
                            break
                        }
                    }
                }
            }

            /* ドラッグ中は座標を更新 */
            if (this.draggingPointId) {
                const pt = this.controlPoints!.find((p) => p.id === this.draggingPointId)
                if (pt) {
                    pt.x = p.mouseX
                    pt.y = p.mouseY
                }
            }
        } else {
            /* ────────── マウスを離した瞬間 ────────── */
            this.draggingPointId = null

            const rerescaledControlPoints = inverseRescalePathXY(new Path(...this.controlPoints!), p.width, p.height, this.store.embroideryBoundary!)
            this.store.selectedProcess.pointList = rerescaledControlPoints

            const now = p.millis()
            if (this.wasMousePressed) {
                /* ダブルクリック判定: 300 ms 以内 & 位置がほぼ同じ */
                if (
                    this.lastClickPos &&
                    now - this.lastClickTime < 300 &&
                    p.dist(p.mouseX, p.mouseY, this.lastClickPos.x, this.lastClickPos.y) < 5
                ) {
                    /* TODO② ダブルクリックされた点を削除 */
                    const idx = this.controlPoints!.findIndex((pt) => p.dist(p.mouseX, p.mouseY, pt.x, pt.y) < 15)
                    if (idx !== -1) this.controlPoints!.splice(idx, 1)
                    this.lastClickPos = null
                } else {
                    this.lastClickPos = new Point(p.mouseX, p.mouseY)
                    this.lastClickTime = now
                }
            }
        }
        this.wasMousePressed = p.mouseIsPressed

        /* ────────── 描画 ────────── */
        p.noFill()
        p.strokeWeight(1)
        p.stroke(0)
        p.beginShape()
        this.controlPoints!.forEach((pt: Point) => {
            p.vertex(pt.x, pt.y)
            p.stroke(0)
            p.ellipse(pt.x, pt.y, 30)
            p.stroke(255)
            p.ellipse(pt.x, pt.y, 29)
        })
        p.stroke(255, 0, 0)
        p.endShape()
    }
}

