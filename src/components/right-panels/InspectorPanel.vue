<script setup lang="ts">
import { ref, watch } from 'vue'
import PanelBase from '../common/PanelBase.vue'
import { EditorMode, useStore } from '@/store/store'
import MenuButton from '../common/MenuButton.vue'
import { EmbroideryProcess, SatinStep } from '@/models/step'
import type { EditorView } from '../editor/p5interface'
import { ProcessPreview } from '../editor/process-preview'
import { ControlPointsType, ProcessSetControlPoints } from '../editor/process-set-control-points'

const store = useStore()
const process = ref<EmbroideryProcess>(EmbroideryProcess.SatinControlPoints)

watch(
  () => store.selectedStep,
  (newStep) => newStep && (process.value = newStep.embroideryProcess),
)

function setEditorMode(editorMode: EditorMode) {
  if (store.editor.mode.is(editorMode)) return (store.editor.mode = EditorMode.Process)
  store.editor.mode = editorMode
}

function setEditorView(editorView: EditorView) {
  if (store.editorView.getName() === editorView.getName())
    return (store.editorView = new ProcessPreview())
  store.editorView = editorView
}
</script>

<template>
  <PanelBase title="インスペクタ">
    <div
      v-if="
        store.editorView instanceof ProcessSetControlPoints ||
        store.editorView instanceof ProcessPreview
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
      <div
        v-if="
          store.selectedStep?.embroideryProcess.key == EmbroideryProcess.SatinControlPoints.key &&
          store.selectedStep instanceof SatinStep
        "
      >
        <MenuButton
          @click="setEditorView(new ProcessSetControlPoints(ControlPointsType.StartAndEndPoints))"
          :disabled="!store.selectedStep"
          >始終点指定 </MenuButton
        >:
        {{
          store.editorView instanceof ProcessSetControlPoints
            ? '指定中'
            : store.selectedStep.startAndEndPoints
              ? '指定済み'
              : '未指定'
        }}<br />
        <MenuButton
          @click="setEditorView(new ProcessSetControlPoints(ControlPointsType.ControlPoints))"
          :disabled="!store.selectedStep"
        >
          ガイドポイント追加</MenuButton
        >:
        {{
          `${store.selectedStep.controlPointPairList.length || 0}個指定済` +
          (store.editor.mode.is(EditorMode.ProcessSetGuidePointPair) ? `: 指定中` : '')
        }}
      </div>
    </div>
  </PanelBase>
</template>

<style scoped></style>
