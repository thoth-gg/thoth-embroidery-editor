<script setup lang="ts">
import { useStore } from '@/store/store'
import PanelBase from '../common/PanelBase.vue'
import StrokePreview from '../common/StrokePreview.vue'
import type { Step } from '@/models/step'

const store = useStore()

function click(step: Step) {
  if (store.editor.selectedStepId === step.id) {
    store.editor.selectedStepId = null
    return
  }
  store.editor.selectedStepId = step.id
}
</script>

<template>
  <PanelBase title="ステップ" class="step-panel">
    <div
      class="step"
      v-for="step in store.stepList"
      v-bind:key="step.id"
      @click="click(step)"
      :class="{ selected: store.editor.selectedStepId === step.id }"
    >
      <StrokePreview :step="step" />
      <div class="step-info">
        <p>色: {{ step.color }}</p>
        <p>処理方法: {{ step.embroideryProcess.name }}</p>
      </div>
    </div>
  </PanelBase>
</template>

<style scoped>
.step-panel {
  overflow-y: scroll;
}

.step {
  border: 1px solid #ccc;
  display: flex;
}

.step.selected {
  background-color: #fff6ba;
}

.step-info {
  padding: 2px 4px;
}
</style>
