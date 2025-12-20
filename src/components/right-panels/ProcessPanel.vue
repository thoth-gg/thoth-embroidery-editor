<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'
import ProcessPreview from '../common/ProcessPreview.vue'

const store = useStore()
</script>

<template>
  <PanelBase title="プロセス">
    <div
      v-for="process in store.processList"
      v-bind:key="process.id"
      :class="{
        process: true,
      }"
    >
      <ProcessPreview :process="process" />
      <div class="step-process-info"></div>
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
}
</style>
