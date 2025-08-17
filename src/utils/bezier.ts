import { Point, type BezierCtrlPoints, type Path } from '@/models/point'

export function bezier(controlPoints: BezierCtrlPoints, fineness: number) {
  if (controlPoints.length < 3) return []
  if (fineness <= 0) return []

  let lines = []
  for (let i = 0; i < controlPoints.length - 1; i++)
    lines.push(lineSplit(controlPoints[i], controlPoints[i + 1], fineness))

  const bezierCurvePoints: BezierCtrlPoints = []
  bezierCurvePoints.push(controlPoints[0])
  ;[...Array(fineness)].forEach((_, index) => {
    let l = lines.map((e) => e[index])
    while (l.length > 1) {
      let t = []
      for (let i = 0; i < l.length - 1; i++) {
        t.push(lineSplit(l[i], l[i + 1], fineness)[index])
      }
      l = t.slice()
    }
    bezierCurvePoints.push(l[0])
  })
  bezierCurvePoints.push(controlPoints[controlPoints.length - 1])
  return bezierCurvePoints
}

const lineSplit = (point1: Point, point2: Point, split: number) =>
  [...Array(split)].map(
    (_, i) =>
      new Point(
        point1.x + ((point2.x - point1.x) / (split + 1)) * (i + 1),
        point1.y + ((point2.y - point1.y) / (split + 1)) * (i + 1),
      ),
  )
