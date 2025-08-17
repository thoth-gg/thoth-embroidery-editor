<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'

const store = useStore()
</script>

<template>
  <PanelBase title="プロセス">
    <div v-if="store.selectedStep">
      <div v-for="process in store.selectedStep.processList" v-bind:key="process.id">
        <p>{{ process.id }}</p>
      </div>
    </div>
  </PanelBase>
</template>

<style scoped></style>
