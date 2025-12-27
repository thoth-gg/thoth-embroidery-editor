<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'
import ProcessPreview from '../common/ProcessPreview.vue'
import MenuButton from '../common/MenuButton.vue'
import type { Process } from '@/models/process'
import { ManualProcess, SatinProcess } from '@/models/process'
import { Path } from '@/models/point'

const store = useStore()

function click(process: Process) {
  if (store.editor.selectedProcessId === process.id) {
    store.editor.selectedProcessId = null
    return
  }
  store.editor.selectedProcessId = process.id
}

function deleteProcess(process: Process) {
  const index = store.processList.findIndex((p) => p.id === process.id)
  if (index !== -1) {
    store.processList.splice(index, 1)
    if (store.editor.selectedStepProcessId === process.id) {
      store.editor.selectedStepProcessId = null
    }
    if (store.editor.selectedProcessId === process.id) {
      store.editor.selectedProcessId = null
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

function addManualProcess(process: Process) {
  const index = store.processList.findIndex((p) => p.id === process.id)
  if (index === -1) {
    return
  }
  const nextProcess = store.processList[index + 1]
  store.processList.splice(
    index + 1,
    0,
    new ManualProcess(
      process.getStitchList()[process.getStitchList().length - 1].point,
      nextProcess.getStitchList()[0].point,
    ),
  )
}
</script>

<template>
  <PanelBase title="プロセス">
    <div
      v-for="(process, index) in store.processList"
      v-bind:key="process.id"
      class="process"
      @click="click(process)"
      :class="{ process: true, selected: store.editor.selectedProcessId === process.id }"
    >
      <ProcessPreview :process="process" />
      <div class="process-info">
        <div class="process-controls">
          <MenuButton @click.stop="moveUp(process)" :disabled="index === 0">↑</MenuButton>
          <MenuButton
            @click.stop="moveDown(process)"
            :disabled="index === store.processList.length - 1"
            >↓</MenuButton
          >
          <MenuButton @click.stop="deleteProcess(process)">削除</MenuButton>
        </div>
        <div class="process-controls">
          <MenuButton
            @click.stop="addManualProcess(process)"
            :disabled="index === store.processList.length - 1"
            >↓手動Processを追加</MenuButton
          >
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

.process.selected {
  background-color: #fff6ba;
}

.process-info {
  padding: 2px 4px;
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.process-controls {
  display: flex;
  gap: 4px;
}
</style>
