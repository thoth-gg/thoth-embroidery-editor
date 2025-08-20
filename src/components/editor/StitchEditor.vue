<script setup lang="ts">
import { useStore } from '@/store/store'
import p5 from 'p5'
import { onMounted, watch } from 'vue'

const store = useStore()

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(1080, 800)
  }

  p.draw = () => {
    p.background(255)

    p.push()
    store.editorView?.draw(p)
    p.pop()
  }

  p.mouseClicked = () => {
    store.editorView?.mouseClicked(p)
  }

  p.doubleClicked = () => {
    store.editorView?.doubleClicked(p)
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
