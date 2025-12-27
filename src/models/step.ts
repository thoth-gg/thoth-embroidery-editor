import { SatinProcess, type Process } from './process'
import { Path, Point } from './point'

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

export abstract class Step {
  id: string
  color: string
  embroideryProcess: EmbroideryProcess = EmbroideryProcess.SatinControlPoints

  sourcePath: Path
  processList: Process[] = []

  constructor(color: string, sourcePath: Path) {
    this.id = `step-${lastId++}`
    this.color = color
    this.sourcePath = sourcePath
  }

  abstract get previewPathList(): { color: string, path: Path, weight: number }[]
  abstract get previewPointList(): { color: string, pointId: string, size: number }[]
  abstract updateProcessList(): void
}

export class SatinStep extends Step {
  startAndEndPoints: {
    positivePathStartPointId: string
    positivePathEndPointId: string
    negativePathStartPointId: string
    negativePathEndPointId: string
  } | null = null

  splitPoints: {
    positivePointId: string
    negativePointId: string
    isSelectedA: boolean
    isSelectedB: boolean
  } | null = null

  // controlPointPairList: ControlPointPair[] = []
  positiveControlPointIdList: string[] = []
  negativeControlPointIdList: string[] = []

  get controlPointPairList(): ControlPointPair[] {
    const pairs: ControlPointPair[] = []
    if (this.startAndEndPoints === null) return pairs;
    const len = Math.min(this.positiveControlPointIdList.length, this.negativeControlPointIdList.length)

    const positivePath = this.sourcePath.getPositivePath(
      this.startAndEndPoints!.positivePathStartPointId,
      this.startAndEndPoints!.positivePathEndPointId,
    )
    const negativePath = this.sourcePath.getNegativePath(
      this.startAndEndPoints!.negativePathStartPointId,
      this.startAndEndPoints!.negativePathEndPointId,
    )
    const positiveControlPointList = this.positiveControlPointIdList.sort((a, b) => {
      return positivePath.findIndex(p => p.id === a) - positivePath.findIndex(p => p.id === b)
    })
    const negativeControlPointList = this.negativeControlPointIdList.sort((a, b) => {
      return negativePath.findIndex(p => p.id === b) - negativePath.findIndex(p => p.id === a)
    })
    for (let i = 0; i < len; i++) {
      pairs.push({
        positivePathPointId: positiveControlPointList[i],
        negativePathPointId: negativeControlPointList[i],
      })
    }
    return pairs
  }

  get previewPathList(): { color: string, path: Path, weight: number }[] {
    const paths: { color: string, path: Path, weight: number }[] = []

    this.controlPointPairList.forEach((pair) => {
      const controlPath = new Path()
      const positivePoint = this.sourcePath.find(p => p.id === pair.positivePathPointId)
      const negativePoint = this.sourcePath.find(p => p.id === pair.negativePathPointId)
      if (positivePoint && negativePoint) {
        controlPath.push(positivePoint)
        controlPath.push(negativePoint)
        paths.push({ color: 'purple', path: controlPath, weight: 2 })
      }
    })

    this.processList.forEach((process) => {
      paths.push({ color: '#ff00ff77', path: new Path(...process.getStitchList().map(s => s.point)), weight: 1 })
    })

    return paths
  }

  get previewPointList(): { color: string, pointId: string, size: number }[] {
    const points: { color: string, pointId: string, size: number }[] = []

    if (this.startAndEndPoints) {
      points.push({ color: 'red', pointId: this.startAndEndPoints!.positivePathStartPointId, size: 5 })
      points.push({ color: '#00AA00', pointId: this.startAndEndPoints!.positivePathEndPointId, size: 5 })
      points.push({ color: 'red', pointId: this.startAndEndPoints!.negativePathStartPointId, size: 5 })
      points.push({ color: '#00AA00', pointId: this.startAndEndPoints!.negativePathEndPointId, size: 5 })
    }

    return points;
  }

  updateProcessList() {
    const result = [] as Process[]
    if (this.startAndEndPoints) {
      for (let i = 0; i < this.controlPointPairList.length + 1; i++) {
        const beforePair = this.controlPointPairList[i - 1] || { positivePathPointId: this.startAndEndPoints.positivePathStartPointId, negativePathPointId: this.startAndEndPoints.negativePathStartPointId }
        const afterPair = this.controlPointPairList[i] || { positivePathPointId: this.startAndEndPoints.positivePathEndPointId, negativePathPointId: this.startAndEndPoints.negativePathEndPointId }

        const negativePath = this.sourcePath.getNegativePath(
          beforePair.negativePathPointId,
          afterPair.negativePathPointId,
        )

        const positivePath = this.sourcePath.getPositivePath(
          beforePair.positivePathPointId,
          afterPair.positivePathPointId,
        )

        result.push(new SatinProcess(positivePath, negativePath))
      }
    }

    this.processList = result
  }
}

export interface ControlPointPair {
  positivePathPointId: string
  negativePathPointId: string
}
