import { makeAbsolute, parseSVG } from 'svg-path-parser'
import { bezier } from './bezier'
import { Path, Point } from '@/models/point'
import { calcDistance } from './curve'

export interface ObjectPath {
  id: string
  color: string
  path: Path
}

export interface ParsedSVG {
  width: number
  height: number
  objectPathList: ObjectPath[]
}

export function parseSvg(svgText: string) {
  const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const elementList = [...svgDoc.documentElement.querySelectorAll('*')]
  const tagList = [...new Set(elementList.map((el) => el.localName))]
  if (tagList.filter((tag) => tag != 'path').length > 0) {
    console.error('Unsupported SVG elements:', tagList)
    throw new Error('[ERR] 非対応のSVG要素')
  }

  const objectPathList: ObjectPath[] = []
  svgDoc.querySelectorAll('path').forEach((path) => {
    const data = makeAbsolute(parseSVG(path.getAttribute('d'))) as any[]

    const color = path.getAttribute('style')?.match(/fill:\s*([^;]+)/)?.[1] || ''
    if (!color || color === '' || color === 'none') return

    const pathList: Path[] = []

    let prevControlPoint: Point | null = null
    let currentPath = new Path()
    data.forEach((d: any) => {
      switch (d.code) {
        case 'M':
          if (currentPath.length != 0) {
            pathList.push(currentPath)
            currentPath = new Path()
          }
          currentPath.push(new Point(d.x, d.y))
          break
        case 'C':
        case 'S':
          const controlPoints =
            d.code == 'C'
              ? [
                new Point(d.x0, d.y0),
                new Point(d.x1, d.y1),
                new Point(d.x2, d.y2),
                new Point(d.x, d.y),
              ]
              : [
                new Point(d.x0, d.y0),
                new Point(
                  prevControlPoint ? 2 * d.x0 - prevControlPoint.x : d.x0,
                  prevControlPoint ? 2 * d.y0 - prevControlPoint.y : d.y0,
                ),
                new Point(d.x2, d.y2),
                new Point(d.x, d.y),
              ]

          const approxCurveDistance = Math.ceil(calcDistance(bezier(controlPoints, 8)))
          bezier(controlPoints, approxCurveDistance).forEach((p) => currentPath.push(p))
          prevControlPoint = new Point(d.x2, d.y2)
          break
        case 'Z':
          currentPath.push(new Point(d.x, d.y))
          pathList.push(currentPath)
          currentPath = new Path()
          break
        default:
          currentPath.push(new Point(d.x, d.y))
          prevControlPoint = null
          break
      }
    })
    objectPathList.push({
      id: `object-${objectPathList.length + 1}`,
      color,
      path: pathList[0],
    } satisfies ObjectPath)
  })

  return {
    width: Number(svgDoc.documentElement.getAttribute('viewBox')?.split(' ')[2]) || 0,
    height: Number(svgDoc.documentElement.getAttribute('viewBox')?.split(' ')[3]) || 0,
    objectPathList: objectPathList.filter((objectPath) => objectPath.path.length > 0),
  } satisfies ParsedSVG
}
