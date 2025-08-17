<script setup lang="ts">
import { ref, watch } from 'vue'
import PanelBase from '../common/PanelBase.vue'
import { EditorMode, useStore } from '@/store/store'
import MenuButton from '../common/MenuButton.vue'
import { EmbroideryProcess } from '@/models/step'
import { type Path } from '@/models/point'
import { calcDistance, dividePath } from '@/utils/curve'

const store = useStore()
const process = ref<EmbroideryProcess>(EmbroideryProcess.Satin2Points)

watch(
  () => store.selectedStep,
  (newStep) => newStep && (process.value = newStep.embroideryProcess),
)

function setEditorMode(editorMode: EditorMode) {
  if (store.editor.mode.is(editorMode)) return (store.editor.mode = EditorMode.Process)
  store.editor.mode = editorMode
}

function generateProcess() {
  switch (store.selectedStep?.embroideryProcess.key) {
    case EmbroideryProcess.Satin2Points.key:
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

      store.debugPath = result
      break
    case EmbroideryProcess.Tatami.key:
      // Generate tatami process
      break
    case EmbroideryProcess.Running.key:
      // Generate running process
      break
  }
}
</script>

<template>
  <PanelBase title="インスペクタ">
    <div v-if="store.editor.mode.type == 'step'"></div>
    <div v-if="store.editor.mode.type == 'process'">
      <label for="process-select">処理方法: </label>
      <select
        name="process"
        id="process-select"
        :disabled="store.selectedStep == null"
        @change="
          (e) => {
            if (store.selectedStep) {
              const key = (e.target as HTMLSelectElement).value
              store.selectedStep.embroideryProcess =
                EmbroideryProcess[key as keyof typeof EmbroideryProcess]
            }
          }
        "
        v-bind:value="store.selectedStep?.embroideryProcess.key"
      >
        <option v-for="ep in EmbroideryProcess" :key="ep.key" :value="ep.key">
          {{ ep.name }}
        </option></select
      ><br />
      <div v-if="store.selectedStep?.embroideryProcess.key == EmbroideryProcess.Satin2Points.key">
        <MenuButton
          @click="setEditorMode(EditorMode.ProcessSetStartPoint)"
          :disabled="!store.selectedStep"
          >開始点指定</MenuButton
        >:
        {{
          store.editor.mode.is(EditorMode.ProcessSetStartPoint)
            ? '指定中'
            : store.selectedStep?.satin?.satinStartPointId
              ? '指定済み'
              : '未指定'
        }}<br />
        <MenuButton
          @click="setEditorMode(EditorMode.ProcessSetEndPoint)"
          :disabled="!store.selectedStep"
          >終了点指定</MenuButton
        >:
        {{
          store.editor.mode.is(EditorMode.ProcessSetEndPoint)
            ? '指定中'
            : store.selectedStep?.satin?.satinEndPointId
              ? '指定済み'
              : '未指定'
        }}
      </div>
      <div v-if="store.selectedStep?.embroideryProcess.key == EmbroideryProcess.SatinBezier.key">
        <MenuButton
          @click="setEditorMode(EditorMode.ProcessSetControlPoints)"
          :disabled="!store.selectedStep"
          >制御点指定</MenuButton
        >:
        {{
          store.editor.mode.is(EditorMode.ProcessSetControlPoints)
            ? '指定中'
            : store.selectedStep?.satin?.satinStartPointId
              ? '指定済み'
              : '未指定'
        }}
      </div>
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
