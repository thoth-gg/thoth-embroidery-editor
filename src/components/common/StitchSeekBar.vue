<script setup lang="ts">
import { useStore } from '@/store/store'
import { computed, watch, nextTick } from 'vue'

const store = useStore()

const maxStitchCount = computed(() => {
  return store.processList.reduce((total, process) => {
    return total + process.getStitchList().length
  }, 0)
})

watch(
  () => store.processList,
  async () => {
    await nextTick()
    store.previewStitchLimit = maxStitchCount.value
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div class="seekbar-container">
    <input
      type="range"
      class="seekbar"
      min="0"
      :max="maxStitchCount"
      v-model="store.previewStitchLimit"
    />
  </div>
</template>

<style scoped>
.seekbar-container {
  width: 100%;
  padding: 6px 8px 0px;
  background-color: #fafafa;
  border-top: 1px solid #ccc;
}

.seekbar {
  width: 100%;
  cursor: pointer;
}
</style>
