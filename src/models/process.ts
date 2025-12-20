import { calcDistance, dividePath } from '@/utils/curve'
import type { Path } from './point'
import { Stitch } from './stitch'

let processLastId = 0

export abstract class Process {
  id: string
  stitchList: Stitch[]

  constructor(id?: string) {
    this.id = id || `process-${processLastId++}`
    this.stitchList = []
  }

  abstract getStitchList(): Stitch[]
}

export class SatinProcess extends Process {
  positivePath: Path
  negativePath: Path

  constructor(positivePath: Path, negativePath: Path) {
    super()
    this.positivePath = positivePath
    this.negativePath = negativePath
  }

  getStitchList(): Stitch[] {
    const n = Math.ceil(Math.max(calcDistance(this.positivePath), calcDistance(this.negativePath)))
    const posiPath = dividePath(this.positivePath, n + 1)
    const negaPath = dividePath(this.negativePath, n).reverse()

    const result = [] as Stitch[]
    for (let i = 0; i < n; i++) {
      result.push(new Stitch(posiPath[i]))
      result.push(new Stitch(negaPath[i]))
    }

    return result;
  }
}
