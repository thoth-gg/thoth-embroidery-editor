import type { Process } from './process'
import type { Point, Path } from './point'

let lastId = 0

export const EmbroideryProcess = {
  Satin2Points: {
    key: 'Satin2Points',
    name: '面: サテンステッチ(2点指定)',
  },
  SatinBezier: {
    key: 'SatinBezier',
    name: '面: サテンステッチ(ベジェ曲線)',
  },
  Tatami: {
    key: 'Tatami',
    name: '面: タタミステッチ',
  },
  Running: {
    key: 'Running',
    name: '線: ランニングステッチ',
  },
}

export type EmbroideryProcess = (typeof EmbroideryProcess)[keyof typeof EmbroideryProcess]

export class Step {
  id: string
  color: string
  embroideryProcess: EmbroideryProcess = EmbroideryProcess.Satin2Points

  satin?: StepSatin
  tatami?: StepTatami
  running?: StepRunning

  sourcePath: Path
  processList: Process[] = [] // 周辺情報を元に生成される

  constructor(color: string, sourcePath: Path) {
    this.id = `step-${lastId++}`
    this.color = color
    this.sourcePath = sourcePath
  }
}

export interface StepSatin {
  startPointId: string | null
  endPointId: string | null

  guidePointPairList: GuidePointPair[]
}

export interface GuidePointPair {
  positivePathPointId: string | null
  negativePathPointId: string | null
}

export interface StepTatami { }

export interface StepRunning { }
