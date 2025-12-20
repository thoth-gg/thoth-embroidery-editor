<script setup lang="ts">
import MenuButton from '../common/MenuButton.vue'
import PanelBase from '../common/PanelBase.vue'
import { useStore } from '@/store/store'
import { ProcessPreview } from '../editor/process-preview'
import { StitchPreview } from '../editor/stitch-preview'

const store = useStore()
</script>

<template>
  <PanelBase title="エディタモード">
    <MenuButton
      @click="store.editorView = new ProcessPreview()"
      :active="store.editorView instanceof ProcessPreview"
    >
      Step Mode
    </MenuButton>
    <MenuButton
      @click="store.editorView = new StitchPreview()"
      :active="store.editorView instanceof StitchPreview"
    >
      Process Mode
    </MenuButton>
  </PanelBase>
</template>

<style scoped></style>
