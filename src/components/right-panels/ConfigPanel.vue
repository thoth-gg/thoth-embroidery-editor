<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'

const store = useStore()
</script>

<template>
  <PanelBase title="設定">
    <div>
      <label for="preview-margin-input">プレビュー余白: </label>
      <input
        type="range"
        id="preview-margin-input"
        v-model.number="store.previewMargin"
        min="0"
        max="100"
      />
      {{ store.previewMargin }}px
    </div>
  </PanelBase>
</template>

<style scoped></style>
