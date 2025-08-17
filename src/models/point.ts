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
}
