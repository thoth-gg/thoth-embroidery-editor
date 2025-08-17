<script setup lang="ts">
import { Boundary, Point } from '@/models/point'
import { EditorMode, useStore } from '@/store/store'
import { bezier } from '@/utils/bezier'
import { rescalePathXY } from '@/utils/transform'
import p5 from 'p5'
import { onMounted } from 'vue'
import { drawWhole } from './step-mode'
import { drawStep } from './process-mode'

const store = useStore()

const sketch = (p: p5) => {
  p.setup = function () {
    p.createCanvas(1080, 800)
  }

  p.draw = function () {
    p.background(255)
    p.noStroke()
    p.noFill()

    switch (store.editor.mode.type) {
      case 'step':
        drawWhole(p)
        break
      case 'process':
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
