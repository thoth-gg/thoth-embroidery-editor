<script setup lang="ts">
import MenuButton from '../common/MenuButton.vue'
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'
import { ProcessPreview } from '../editor/process-preview'
import { StepPreview } from '../editor/step-preview'

const store = useStore()
</script>

<template>
  <PanelBase title="エディタモード">
    <MenuButton
      @click="store.editorView = new StepPreview()"
      :active="store.editorView instanceof StepPreview"
    >
      ステップモード
    </MenuButton>
    <MenuButton
      @click="store.editorView = new ProcessPreview()"
      :active="store.editorView instanceof ProcessPreview"
    >
      プロセスモード
    </MenuButton>
  </PanelBase>
</template>

<style scoped></style>
