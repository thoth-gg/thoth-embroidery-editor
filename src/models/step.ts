import type { Process } from './process'
import type { Point, Path } from './point'

let lastId = 0

export type EmbroideryProcess = 'satin' | 'cross'

export class Step {
  id: string
  color: string
  embroideryProcess: EmbroideryProcess = 'satin'

  satin?: StepSatin
  cross?: StepCross

  sourcePath: Path
  processList: Process[] = [] // 周辺情報を元に生成される

  constructor(color: string, sourcePath: Path) {
    this.id = `step-${lastId++}`
    this.color = color
    this.sourcePath = sourcePath
  }
}

export interface StepSatin {
  satinStartPointId: string | null
  satinEndPointId: string | null
}

export interface StepCross {}
