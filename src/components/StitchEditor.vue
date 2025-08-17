<script setup lang="ts">
import { Boundary, Point } from '@/models/point'
import { useStore } from '@/store/store'
import { bezier } from '@/utils/bezier'
import { rescalePointsXY } from '@/utils/transform'
import p5 from 'p5'
import { onMounted } from 'vue'

const store = useStore()

function drawWhole(p: p5) {
  const embroidery = store.embroidery
  if (!embroidery) return
  embroidery.stepList.forEach((step) => {
    const color = p.color(step.color)
    if (store.selectedStep && store.selectedStep?.id !== step.id) color.setAlpha(50)
    p.fill(color)

    p.beginShape()
    rescalePointsXY(step.sourcePath, p.width, p.height, store.embroideryBoundary!).forEach(
      (point) => p.vertex(point.x, point.y),
    )
    p.endShape()
  })
}

function drawStep(p: p5) {
  const step = store.selectedStep
  if (!step) return

  const color = p.color(step.color)
  if (['process-set-start-point', 'process-set-end-point'].includes(store.editor.mode)) {
    color.setAlpha(50)
  }
  p.fill(color)
  p.noStroke()

  const xPointList = step.sourcePath.map((point) => point.x)
  const yPointList = step.sourcePath.map((point) => point.y)
  const stepBoundary = new Boundary(
    Math.min(...xPointList) - 10,
    Math.min(...yPointList) - 10,
    Math.max(...xPointList) + 10,
    Math.max(...yPointList) + 10,
  )

  const rescaledStroke = rescalePointsXY(step.sourcePath, p.width, p.height, stepBoundary)

  p.beginShape()
  let startPoint: Point | undefined
  let endPoint: Point | undefined
  rescaledStroke.forEach((point) => {
    if (point.id == step.satin?.satinStartPointId) startPoint = point
    if (point.id == step.satin?.satinEndPointId) endPoint = point
    p.vertex(point.x, point.y)
  })
  p.endShape()

  p.strokeWeight(5)
  if (startPoint) {
    p.stroke(255, 0, 0, store.editor.mode === 'process-set-start-point' ? 100 : 255)
    p.point(startPoint.x, startPoint.y)
  }

  if (endPoint) {
    p.stroke(0, 170, 0, store.editor.mode === 'process-set-end-point' ? 100 : 255)
    p.point(endPoint.x, endPoint.y)
  }

  if (store.posiPath) {
    p.stroke(0, 0, 255)
    p.strokeWeight(1)
    p.noFill()
    p.beginShape()
    rescalePointsXY(store.posiPath, p.width, p.height, stepBoundary).forEach((point) => {
      p.vertex(point.x, point.y)
    })
    p.endShape()
  }

  if (['process-set-start-point', 'process-set-end-point'].includes(store.editor.mode)) {
    const mouseX = p.mouseX
    const mouseY = p.mouseY
    const min = rescaledStroke.reduce(
      (min, current) => {
        return p.dist(current.x, current.y, mouseX, mouseY) < p.dist(min.x, min.y, mouseX, mouseY)
          ? current
          : min
      },
      new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
    )

    p.stroke(0)
    p.strokeWeight(1)
    rescaledStroke.forEach((point) => p.point(point.x, point.y))

    if (isMouseInBounds(mouseX, mouseY, p)) {
      p.stroke(0)
      p.strokeWeight(5)
      p.point(min.x, min.y)

      if (p.mouseIsPressed) {
        if (!step.satin) {
          step.satin = {
            satinStartPointId: null,
            satinEndPointId: null,
          }
        }
        if (store.editor.mode === 'process-set-start-point') {
          if (step.satin.satinStartPointId === min.id) {
            step.satin.satinStartPointId = null
          } else if (step.satin.satinEndPointId === min.id) {
            step.satin.satinEndPointId = null
            step.satin.satinStartPointId = min.id
          } else {
            step.satin.satinStartPointId = min.id
          }
        }
        if (store.editor.mode === 'process-set-end-point') {
          if (step.satin.satinEndPointId === min.id) {
            step.satin.satinEndPointId = null
          } else if (step.satin.satinStartPointId === min.id) {
            step.satin.satinStartPointId = null
            step.satin.satinEndPointId = min.id
          } else {
            step.satin.satinEndPointId = min.id
          }
        }
        store.editor.mode = 'process'
      }
    }
  }
}

const isMouseInBounds = (x: number, y: number, p: p5) => {
  return 0 <= x && x <= p.width && 0 <= y && y <= p.height
}

const sketch = (p: p5) => {
  p.setup = function () {
    p.createCanvas(1080, 800)
  }

  p.draw = function () {
    p.background(255)
    p.noStroke()
    p.noFill()

    switch (store.editor.mode) {
      case 'step':
        drawWhole(p)
        break
      case 'process':
      case 'process-set-start-point':
      case 'process-set-end-point':
        if (!store.selectedStep) {
          drawWhole(p)
          break
        }
        drawStep(p)
        break
    }
  }
}

onMounted(() => {
  const app = document.getElementById('canvas')
  if (app) new p5(sketch, app)
})
</script>

<template>
  <div class="editor-panel" id="canvas"></div>
</template>

<style scoped>
.editor-panel {
  width: calc(100vw - 632px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style>
.p5Canvas {
  width: 100% !important;
  height: initial !important;
}
</style>
