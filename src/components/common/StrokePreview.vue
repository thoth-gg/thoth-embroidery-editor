<script setup lang="ts">
import { Boundary } from '@/models/point'
import type { Step } from '@/models/step'
import { useStore } from '@/store/store'
import { rescalePathXY } from '@/utils/transform'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  step: Step
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const store = useStore()

onMounted(() => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    ctx.fillStyle = props.step.color

    const normalizedPoints = rescalePathXY(
      props.step.sourcePath,
      canvas.value.width,
      canvas.value.height,
      new Boundary(0, 0, store.embroidery!.width, store.embroidery!.height),
    )
    ctx.beginPath()
    normalizedPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.fill()
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
