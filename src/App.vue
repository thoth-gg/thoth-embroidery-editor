<script setup lang="ts">
import ProjectPanel from './components/left-panels/ProjectPanel.vue'
import StepPanel from './components/left-panels/StepPanel.vue'
import ColorPalletPanel from './components/right-panels/ColorPalletPanel.vue'
import EditorPanel from './components/left-panels/EditorModePanel.vue'
import StitchEditor from './components/editor/StitchEditor.vue'
import InspectorPanel from './components/right-panels/InspectorPanel.vue'
import ProcessPanel from './components/right-panels/ProcessPanel.vue'
import ConfigPanel from './components/right-panels/ConfigPanel.vue'
import StepProcessPanel from './components/left-panels/StepProcessPanel.vue'
</script>

<template>
  <div class="base-grid">
    <div class="panel-slot">
      <div class="logo">Thoth Embroidery Editor</div>
      <ProjectPanel />
      <EditorPanel />
      <StepPanel />
      <StepProcessPanel />
    </div>
    <StitchEditor />
    <div class="panel-slot">
      <ConfigPanel />
      <!-- <ColorPalletPanel /> -->
      <InspectorPanel />
      <ProcessPanel />
    </div>
  </div>
</template>

<style scoped>
.base-grid {
  display: grid;
  position: fixed;
  grid-template-columns: 316px 1fr 316px;
}

.logo {
  font-family: 'Kirang Haerang', system-ui;
  font-size: 22pt;
  text-align: center;
  margin-top: 4px;
}

.panel-slot {
  padding: 8px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: 8px 0px;
}
</style>
