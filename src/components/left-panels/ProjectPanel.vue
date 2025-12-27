<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { ref } from 'vue'
import { useStore } from '@/store/store'
import MenuButton from '../common/MenuButton.vue'
import { parseSvg } from '@/utils/svg'
import { Embroidery } from '@/models/embroidery'
import { SatinStep } from '@/models/step'
import { buildDST } from '@/utils/dst_util'
import { Point, Path, Boundary } from '@/models/point'
import { rescalePathXY } from '@/utils/transform'

const store = useStore()
const status = ref('未読込')

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const fr = new FileReader()
    fr.onload = (e: any) => resolve(e.currentTarget?.result)
    fr.readAsText(file)
  })
}

async function onFileChange(e: any) {
  let files = e.target?.files
  if (files && files.length > 0) {
    const svg = await readFile(files[0])
    e.target.value = ''

    try {
      const parsedSvg = parseSvg(svg)

      store.embroidery = new Embroidery(
        parsedSvg.width,
        parsedSvg.height,
        parsedSvg.objectPathList.map(
          (objectPath) => new SatinStep(objectPath.color, objectPath.path),
        ),
      )

      status.value = '読み込み完了'
    } catch (error: any) {
      console.error('Error parsing SVG:', error)
      status.value = error.message
    }
  }
}

function onExport() {
  if (!store.embroidery) return

  const originalPoints: Point[] = []
  for (const process of store.processList) {
    const stitches = process.getStitchList()
    for (const stitch of stitches) {
      originalPoints.push(stitch.point)
    }
  }

  if (originalPoints.length === 0) {
    console.warn('No stitches to export')
    return
  }

  // Remap points to 10cm x 10cm (1000 x 1000 in 0.1mm units)
  const DST_SIZE_CM = 5
  const DST_SIZE_UNITS = DST_SIZE_CM * 100 // 10cm = 100mm = 1000 units (0.1mm)

  const originalPath = new Path(...originalPoints)
  const boundary = Boundary.fromPath(originalPath)
  const remappedPath = rescalePathXY(originalPath, DST_SIZE_UNITS, DST_SIZE_UNITS, boundary)

  // Shift points so that the minimum X and Y are at (0, 0)
  // Round to integers (DST format uses 0.1mm units, so no decimal places needed)
  const remappedPoints = Array.from(remappedPath)
  const minX = Math.min(...remappedPoints.map((p) => p.x))
  const minY = Math.min(...remappedPoints.map((p) => p.y))
  const shiftedPoints = remappedPoints.map(
    (p) => new Point(Math.round(p.x - minX), Math.round(p.y - minY), p.id),
  )

  // Flip points vertically (top-bottom)
  const maxY = Math.max(...shiftedPoints.map((p) => p.y))
  const absolutePoints = shiftedPoints.map((p) => new Point(p.x, maxY - p.y, p.id))

  const dst = buildDST(absolutePoints)
  const blob = new Blob([dst], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pattern.dst'
  a.click()
}
</script>

<template>
  <PanelBase title="プロジェクト設定">
    <p>ステータス: {{ status }}</p>
    <label for="project-file"><MenuButton>SVG読み込み</MenuButton></label>
    <input
      type="file"
      name="project-file"
      id="project-file"
      @change="onFileChange"
      accept=".svg"
      hidden
    />
    <MenuButton @click="onExport">書き出し</MenuButton>
  </PanelBase>
</template>

<style scoped></style>
