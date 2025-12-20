<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'
import ProcessPreview from '../common/ProcessPreview.vue'
import MenuButton from '../common/MenuButton.vue'
import type { Process } from '@/models/process'

const store = useStore()

function deleteProcess(process: Process) {
  const index = store.processList.findIndex((p) => p.id === process.id)
  if (index !== -1) {
    store.processList.splice(index, 1)
    if (store.editor.selectedStepProcessId === process.id) {
      store.editor.selectedStepProcessId = null
    }
  }
}

function moveUp(process: Process) {
  const index = store.processList.findIndex((p) => p.id === process.id)
  if (index > 0) {
    const temp = store.processList[index]
    store.processList[index] = store.processList[index - 1]
    store.processList[index - 1] = temp
  }
}

function moveDown(process: Process) {
  const index = store.processList.findIndex((p) => p.id === process.id)
  if (index < store.processList.length - 1) {
    const temp = store.processList[index]
    store.processList[index] = store.processList[index + 1]
    store.processList[index + 1] = temp
  }
}
</script>

<template>
  <PanelBase title="プロセス">
    <div v-for="(process, index) in store.processList" v-bind:key="process.id" class="process">
      <ProcessPreview :process="process" />
      <div class="process-info">
        <div class="process-controls">
          <MenuButton @click="moveUp(process)" :disabled="index === 0">↑</MenuButton>
          <MenuButton @click="moveDown(process)" :disabled="index === store.processList.length - 1"
            >↓</MenuButton
          >
          <MenuButton @click="deleteProcess(process)">削除</MenuButton>
        </div>
      </div>
    </div>
  </PanelBase>
</template>

<style scoped>
.process {
  border: 1px solid #ccc;
  display: flex;
}

.process-info {
  padding: 2px 4px;
  flex: 1;
  display: flex;
  align-items: center;
}

.process-controls {
  display: flex;
  gap: 4px;
}
</style>
