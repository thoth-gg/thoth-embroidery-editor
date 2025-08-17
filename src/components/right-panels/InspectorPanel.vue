<script setup lang="ts">
import { ref, watch } from 'vue'
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'
import MenuButton from '../common/MenuButton.vue'
import type { EmbroideryProcess } from '@/models/step'
import { Point, type Path } from '@/models/point'
import { calcDistance, dividePath } from '@/utils/curve'

const store = useStore()
const process = ref<EmbroideryProcess>('satin')

watch(
  () => store.selectedStep,
  (newStep) => {
    if (newStep) {
      process.value = newStep.embroideryProcess
    }
  },
)

function setStartPoint() {
  if (store.editor.mode === 'process-set-start-point') {
    store.editor.mode = 'process'
    return
  }
  store.editor.mode = 'process-set-start-point'
}

function setEndPoint() {
  if (store.editor.mode === 'process-set-end-point') {
    store.editor.mode = 'process'
    return
  }
  store.editor.mode = 'process-set-end-point'
}

function generateProcess() {
  switch (store.selectedStep?.embroideryProcess) {
    case 'satin':
      const path = store.selectedStep.sourcePath
      const startId = store.selectedStep.satin?.satinStartPointId
      const endId = store.selectedStep.satin?.satinEndPointId
      if (!startId || !endId) return

      const longPath = [...path, ...path]

      const positivePath = []
      for (let point of longPath) {
        if (positivePath.length == 0) {
          if (point.id === startId) positivePath.push(point)
          continue
        }
        positivePath.push(point)
        if (point.id === endId) break
      }
      const negativePath = []
      for (let point of longPath) {
        if (negativePath.length == 0) {
          if (point.id === endId) negativePath.push(point)
          continue
        }
        negativePath.push(point)
        if (point.id === startId) break
      }

      const n = Math.ceil(Math.max(calcDistance(positivePath), calcDistance(negativePath)))
      const posiPath = dividePath(positivePath, n + 1)
      const negaPath = dividePath(negativePath, n).reverse()

      const result: Path = []
      for (let i = 0; i < negaPath.length; i++) {
        result.push(posiPath[i], negaPath[i])
      }
      result.push(posiPath[posiPath.length - 1])

      store.posiPath = result

      break
    case 'cross':
      // Generate cross process
      break
  }
}
</script>

<template>
  <PanelBase title="インスペクタ">
    <div v-if="store.editor.mode == 'step'"></div>
    <div
      v-if="
        store.editor.mode == 'process' ||
        store.editor.mode == 'process-set-start-point' ||
        store.editor.mode == 'process-set-end-point'
      "
    >
      <label for="process-select">処理方法: </label>
      <select
        name="process"
        id="process-select"
        :disabled="store.selectedStep == null"
        @change="
          (e) => {
            if (store.selectedStep) {
              store.selectedStep.embroideryProcess = (e.target as HTMLSelectElement)
                .value as EmbroideryProcess
            }
          }
        "
        v-bind:value="store.selectedStep?.embroideryProcess"
      >
        <option value="satin">面: サテンステッチ</option>
        <option value="cross">面: クロス2重</option></select
      ><br />
      <MenuButton @click="setStartPoint" :disabled="!store.selectedStep">開始点指定</MenuButton>:
      {{
        store.editor.mode == 'process-set-start-point'
          ? '指定中'
          : store.selectedStep?.satin?.satinStartPointId
            ? '指定済み'
            : '未指定'
      }}<br />
      <MenuButton @click="setEndPoint" :disabled="!store.selectedStep">終了点指定</MenuButton>:
      {{
        store.editor.mode == 'process-set-end-point'
          ? '指定中'
          : store.selectedStep?.satin?.satinEndPointId
            ? '指定済み'
            : '未指定'
      }}<br />
      <MenuButton
        @click="generateProcess"
        :disabled="
          !store.selectedStep ||
          !store.selectedStep?.satin?.satinStartPointId ||
          !store.selectedStep?.satin?.satinEndPointId
        "
        >プロセス生成</MenuButton
      >
    </div>
  </PanelBase>
</template>

<style scoped></style>
