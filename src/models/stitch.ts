import type { Point } from './point'

export type StitchAction = 'stitch' | 'cut' | 'color-change'

let stitchLastId = 0

export class Stitch {
  id: string
  action: StitchAction
  point: Point

  constructor(point: Point, action: StitchAction = 'stitch', id?: string) {
    this.id = id || `stitch-${stitchLastId++}`
    this.point = point
    this.action = action
  }
}
