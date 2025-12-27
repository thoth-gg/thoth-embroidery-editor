<script setup lang="ts">
import { ref, watch } from 'vue'
import PanelBase from '../common/PanelBase.vue'
import { EditorMode, useStore } from '@/store/store'
import MenuButton from '../common/MenuButton.vue'
import { EmbroideryProcess, SatinStep } from '@/models/step'
import type { EditorView } from '../editor/p5interface'
import { ProcessPreview } from '../editor/process-preview'
import { StitchPreview } from '../editor/stitch-preview'
import { ManualProcess } from '@/models/process'
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

function setSplitPreview(key: string) {
  if (!(store.selectedStep instanceof SatinStep)) return
  if (store.selectedStep.splitPoints === null) return
  if (key === 'A')
    store.selectedStep.splitPoints.isSelectedA = !store.selectedStep.splitPoints.isSelectedA
  else if (key === 'B')
    store.selectedStep.splitPoints.isSelectedB = !store.selectedStep.splitPoints.isSelectedB
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
      <!-- <label for="process-select">処理方法: </label>
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
      ><br /> -->
      <div
        v-if="
          store.selectedStep?.embroideryProcess.key == EmbroideryProcess.SatinControlPoints.key &&
          store.selectedStep instanceof SatinStep
        "
      >
        <MenuButton
          @click="setEditorView(new ProcessSetControlPoints(ControlPointsType.SplitPoints))"
          :disabled="!store.selectedStep"
          >分割点指定 </MenuButton
        >:
        {{
          (store.selectedStep.splitPoints ? '指定済み' : '未指定') +
          (store.editorView instanceof ProcessSetControlPoints &&
          store.editorView.controlPointsType === ControlPointsType.SplitPoints
            ? ' (指定中)'
            : '')
        }}<MenuButton
          @click="setSplitPreview('A')"
          :disabled="!store.selectedStep.splitPoints"
          :active="store.selectedStep.splitPoints?.isSelectedA ?? false"
          >A</MenuButton
        ><MenuButton
          @click="setSplitPreview('B')"
          :disabled="!store.selectedStep.splitPoints"
          :active="store.selectedStep.splitPoints?.isSelectedB ?? false"
          >B</MenuButton
        ><br />
        <MenuButton
          @click="setEditorView(new ProcessSetControlPoints(ControlPointsType.StartAndEndPoints))"
          :disabled="!store.selectedStep"
          >始終点指定 </MenuButton
        >:
        {{
          (store.selectedStep.startAndEndPoints ? '指定済み' : '未指定') +
          (store.editorView instanceof ProcessSetControlPoints &&
          store.editorView.controlPointsType === ControlPointsType.StartAndEndPoints
            ? ' (指定中)'
            : '')
        }}<br />
        <MenuButton
          @click="setEditorView(new ProcessSetControlPoints(ControlPointsType.ControlPoints))"
          :disabled="!store.selectedStep"
        >
          ガイドポイント追加</MenuButton
        >:
        {{
          (store.selectedStep.controlPointPairList.length > 0
            ? `${store.selectedStep.controlPointPairList.length}個指定済`
            : '未指定') +
          (store.editorView instanceof ProcessSetControlPoints &&
          store.editorView.controlPointsType === ControlPointsType.ControlPoints
            ? ' (指定中)'
            : '')
        }}
      </div>
    </div>
    <div v-if="store.editorView instanceof StitchPreview">
      <div v-if="store.selectedProcess instanceof ManualProcess"></div>
    </div>
  </PanelBase>
</template>

<style scoped></style>
