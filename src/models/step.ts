import type { Process } from './process'
import type { Point, Path } from './point'

let lastId = 0

export const EmbroideryProcess = {
  SatinControlPoints: {
    key: 'SatinControlPoints',
    name: '面: サテンステッチ(制御点指定)',
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
  embroideryProcess: EmbroideryProcess = EmbroideryProcess.SatinControlPoints

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
  startPoints: {
    firstPointId: string
    secondPointId: string
  } | null
  endPoints: {
    firstPointId: string
    secondPointId: string
  } | null

  controlPointPairList: ControlPointPair[]
}

export interface ControlPointPair {
  positivePathPointId: string | null
  negativePathPointId: string | null
}

export interface StepTatami { }

export interface StepRunning { }
