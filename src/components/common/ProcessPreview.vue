<script setup lang="ts">
import { Boundary, Path } from '@/models/point'
import type { Process } from '@/models/process'
import type { Step } from '@/models/step'
import { useStore } from '@/store/store'
import { rescalePathXY } from '@/utils/transform'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  process: Process
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const store = useStore()

onMounted(() => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    const stitchPath = new Path(...props.process.getStitchList().map((stitch) => stitch.point))
    const stepBoundary = Boundary.fromPath(stitchPath)
    const drawBoundary = stepBoundary.padding(store.previewMargin)

    const path = rescalePathXY(
      new Path(...props.process.getStitchList().map((stitch) => stitch.point)),
      canvas.value.width,
      canvas.value.height,
      drawBoundary,
    )
    ctx.strokeStyle = '#ff00ff77'
    ctx.beginPath()
    path.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()
  }
})
</script>

<template>
  <canvas width="1080" height="800" ref="canvas"></canvas>
</template>

<style scoped>
canvas {
  border-right: 1px solid #ccc;
  width: 108px;
  height: 80px;
  background-color: #fafafa;
}
</style>
