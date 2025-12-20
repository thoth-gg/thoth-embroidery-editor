<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'
import StepProcessPreview from '../common/StepProcessPreview.vue'
import type { Process } from '@/models/process'
import MenuButton from '../common/MenuButton.vue'

const store = useStore()

function click(process: Process) {
  if (store.editor.selectedStepProcessId === process.id) {
    store.editor.selectedStepProcessId = null
    return
  }
  store.editor.selectedStepProcessId = process.id
}

function add() {
  const process = store.selectedStep?.processList.find(
    (p) => p.id === store.editor.selectedStepProcessId,
  )
  if (!process) {
    return
  }
  store.processList.push(process)
}
</script>

<template>
  <PanelBase title="ステッププロセス" class="step-process-panel">
    <div
      v-if="store.selectedStep"
      v-for="process in store.selectedStep.processList"
      v-bind:key="process.id"
      @click="click(process)"
      :class="{
        'step-process': true,
        selected: store.editor.selectedStepProcessId === process.id,
      }"
    >
      <StepProcessPreview :step="store.selectedStep" :process="process" />
      <div class="step-process-info"></div>
    </div>
    <MenuButton class="add-button" @click="add">追加</MenuButton>
  </PanelBase>
</template>

<style scoped>
.step-process-panel {
  flex-basis: 50%;
  overflow-y: scroll;
}

.step-process {
  border: 1px solid #ccc;
  display: flex;
}

.step-process.selected {
  background-color: #fff6ba;
}

.step-process-info {
  padding: 2px 4px;
}

.add-button {
  width: 100%;
  text-align: center;
  padding: 4px 0;
  position: sticky;
  bottom: 2px;
  margin-top: 4px;
}
</style>
