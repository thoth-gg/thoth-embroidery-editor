let pointLastId = 0
let pathLastId = 0

export class Point {
  id: string
  x: number
  y: number

  constructor(x: number, y: number, id?: string) {
    this.id = id || `point-${pointLastId++}`
    this.x = x
    this.y = y
  }
}

export type Path = Point[]
export type BezierCtrlPoints = Point[]

export class Boundary {
  minX: number
  minY: number
  maxX: number
  maxY: number

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX
    this.minY = minY
    this.maxX = maxX
    this.maxY = maxY
  }

  static fromPath(path: Path): Boundary {
    const xPointList = path.map((point) => point.x)
    const yPointList = path.map((point) => point.y)
    return new Boundary(
      Math.min(...xPointList),
      Math.min(...yPointList),
      Math.max(...xPointList),
      Math.max(...yPointList),
    )
  }

  public padding(padding: number) {
    return new Boundary(
      this.minX - padding,
      this.minY - padding,
      this.maxX + padding,
      this.maxY + padding,
    )
  }
}
