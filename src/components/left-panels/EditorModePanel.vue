<script setup lang="ts">
import MenuButton from '../common/MenuButton.vue'
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'

const store = useStore()
</script>

<template>
  <PanelBase title="エディタモード">
    <MenuButton @click="store.editor.mode.type = 'step'" :active="store.editor.mode.type === 'step'"
      >ステップモード</MenuButton
    >
    <MenuButton
      @click="store.editor.mode.type = 'process'"
      :active="store.editor.mode.type === 'process'"
      >プロセスモード</MenuButton
    >
  </PanelBase>
</template>

<style scoped></style>
