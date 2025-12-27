import { Boundary, Path, Point } from '@/models/point'

export function rescalePathXY(path: Path, dstW: number, dstH: number, boundary?: Boundary): Path {
  if (path.length === 0) return new Path()

  // 未指定なら元データから境界を取得
  if (!boundary) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    for (const { x, y } of path) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
    boundary = new Boundary(minX, minY, maxX, maxY)
  }

  const srcW = boundary.maxX - boundary.minX
  const srcH = boundary.maxY - boundary.minY

  // 幅または高さが 0 の場合は中央に配置
  if (srcW === 0 || srcH === 0) {
    const cx = dstW / 2
    const cy = dstH / 2
    return new Path(...path.map((p) => new Point(cx, cy, p.id)))
  }

  // 一様スケール係数
  const scale = Math.min(dstW / srcW, dstH / srcH)

  // 中央寄せオフセット（min を 0 に揃えた後、中央へ移動）
  const offsetX = (dstW - srcW * scale) / 2 - boundary.minX * scale
  const offsetY = (dstH - srcH * scale) / 2 - boundary.minY * scale

  return new Path(...path.map(({ x, y, id }) => new Point(x * scale + offsetX, y * scale + offsetY, id)))
}

export function inverseRescalePathXY(path: Path, dstW: number, dstH: number, boundary: Boundary): Path {
  if (path.length === 0) return new Path()

  const srcW = boundary.maxX - boundary.minX
  const srcH = boundary.maxY - boundary.minY

  // 幅または高さが 0 の場合は元の座標を返す（変換されていないため）
  if (srcW === 0 || srcH === 0) {
    return new Path(...path.map((p) => new Point(p.x, p.y, p.id)))
  }

  // 一様スケール係数（rescalePathXYと同じ計算）
  const scale = Math.min(dstW / srcW, dstH / srcH)

  // 中央寄せオフセット（rescalePathXYと同じ計算）
  const offsetX = (dstW - srcW * scale) / 2 - boundary.minX * scale
  const offsetY = (dstH - srcH * scale) / 2 - boundary.minY * scale

  // 逆変換: x = (x' - offsetX) / scale, y = (y' - offsetY) / scale
  return new Path(...path.map(({ x, y, id }) => new Point((x - offsetX) / scale, (y - offsetY) / scale, id)))
}
