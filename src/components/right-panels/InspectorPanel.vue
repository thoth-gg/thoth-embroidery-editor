<script setup lang="ts">
import { ref, watch } from 'vue'
import PanelBase from '../common/PanelBase.vue'
import { EditorMode, useStore } from '@/store/store'
import MenuButton from '../common/MenuButton.vue'
import { EmbroideryProcess } from '@/models/step'
import { Path } from '@/models/point'
import { calcDistance, dividePath } from '@/utils/curve'
import type { EditorView } from '../editor/p5interface'
import { ProcessPreview } from '../editor/process-preview'
import { ProcessSetStartEndPoint } from '../editor/process-set-start-end-points'

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

function setEditorView(editorView: EditorView) {
  if (store.editorView.getName() === editorView.getName()) return (store.editorView = new ProcessPreview())
  store.editorView = editorView
}

function generateProcess() {
  switch (store.selectedStep?.embroideryProcess.key) {
    case EmbroideryProcess.Satin2Points.key:
      const path = store.selectedStep.sourcePath
      const startId = store.selectedStep.satin?.startPointId
      const endId = store.selectedStep.satin?.endPointId
      if (!startId || !endId) return

      const positivePath = path.getPositivePath(startId, endId)
      const negativePath = path.getNegativePath(startId, endId)

      const n = Math.ceil(Math.max(calcDistance(positivePath), calcDistance(negativePath)))
      const posiPath = dividePath(positivePath, n + 1)
      const negaPath = dividePath(negativePath, n).reverse()

      const result = new Path()
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
    <div v-if="(store.editorView instanceof ProcessSetStartEndPoint) || (store.editorView instanceof ProcessPreview)">
      <label for="process-select">処理方法: </label>
      <select name="process" id="process-select" :disabled="store.selectedStep == null" @change="
        (e) => {
          if (store.selectedStep) {
            const key = (e.target as HTMLSelectElement).value
            store.selectedStep.embroideryProcess =
              EmbroideryProcess[key as keyof typeof EmbroideryProcess]
          }
        }
      " v-bind:value="store.selectedStep?.embroideryProcess.key">
        <option v-for="ep in EmbroideryProcess" :key="ep.key" :value="ep.key">
          {{ ep.name }}
        </option>
      </select><br />
      <div v-if="store.selectedStep?.embroideryProcess.key == EmbroideryProcess.Satin2Points.key">
        <MenuButton @click="setEditorView(new ProcessSetStartEndPoint())" :disabled="!store.selectedStep">始・終点指定
        </MenuButton>:
        {{
          store.editorView instanceof ProcessSetStartEndPoint
            ? '指定中'
            : store.selectedStep?.satin?.startPointId
              ? '指定済み'
              : '未指定'
        }}<br />
        <MenuButton @click="setEditorMode(EditorMode.ProcessSetGuidePointPair)" :disabled="!store.selectedStep">
          ガイドポイント追加</MenuButton>:
        {{
          `${store.selectedStep?.satin?.guidePointPairList.length}個指定済` +
          (store.editor.mode.is(EditorMode.ProcessSetGuidePointPair) ? `: 指定中` : '')
        }}
      </div>
      <div v-if="store.selectedStep?.embroideryProcess.key == EmbroideryProcess.SatinBezier.key">
        <MenuButton @click="setEditorMode(EditorMode.ProcessSetControlPoints)" :disabled="!store.selectedStep">制御点指定
        </MenuButton>:
        {{
          store.editor.mode.is(EditorMode.ProcessSetControlPoints)
            ? '指定中'
            : store.selectedStep?.satin?.startPointId
              ? '指定済み'
              : '未指定'
        }}
      </div>
      <MenuButton @click="generateProcess" :disabled="!store.selectedStep ||
        !store.selectedStep?.satin?.startPointId ||
        !store.selectedStep?.satin?.endPointId
        ">プロセス生成</MenuButton>
    </div>
  </PanelBase>
</template>

<style scoped></style>
