import { Point, type Path } from '@/models/point'

export function calcDistance(path: Path): number {
  return path.reduce(
    (d, p, i) => (i == 0 ? d : d + Math.hypot(p.x - path[i - 1].x, p.y - path[i - 1].y)),
    0,
  )
}

export function dividePath(path: Path, n: number): Path {
  if (path.length < 2) throw new Error('path には 2 点以上が必要です')
  if (!Number.isInteger(n) || n < 2) throw new Error('n は 2 以上の整数で指定してください')

  const segLens: number[] = []
  const cumLens: number[] = [0]
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x
    const dy = path[i].y - path[i - 1].y
    const len = Math.hypot(dx, dy)
    segLens.push(len)
    cumLens.push(cumLens[i - 1] + len)
  }
  const totalLen = cumLens[cumLens.length - 1]
  if (totalLen === 0) throw new Error('全長が 0 です')

  const result: Path = []
  let segIdx = 1
  const EPS = 1e-9

  for (let k = 0; k < n; k++) {
    const target = k === n - 1 ? totalLen : (totalLen * k) / (n - 1)

    while (segIdx < cumLens.length - 1 && cumLens[segIdx] < target - EPS) {
      segIdx++
    }

    if (Math.abs(cumLens[segIdx] - target) < EPS || segLens[segIdx - 1] === 0) {
      const p = path[segIdx]
      result.push(new Point(p.x, p.y))
      continue
    }

    const prevLen = cumLens[segIdx - 1]
    const t = (target - prevLen) / segLens[segIdx - 1]
    const p0 = path[segIdx - 1]
    const p1 = path[segIdx]
    result.push(new Point(p0.x + (p1.x - p0.x) * t, p0.y + (p1.y - p0.y) * t))
  }

  return result
}
