import type { Step } from './step'

export class Embroidery {
  width: number
  height: number

  stepList: Step[]

  constructor(width: number, height: number, stepList: Step[]) {
    this.width = width
    this.height = height
    this.stepList = stepList
  }
}
