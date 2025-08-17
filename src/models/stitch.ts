import type { Point } from './point'

export type StitchAction = 'stitch' | 'cut' | 'color-change'

export interface Stitch {
  id: string
  action: StitchAction
  point: Point
}
