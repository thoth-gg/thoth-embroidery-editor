<script setup lang="ts">
import PanelBase from '../common/PanelBase.vue'
import { ref } from 'vue'
import { useStore } from '@/store/store'
import MenuButton from '../common/MenuButton.vue'
import { parseSvg } from '@/utils/svg'
import { Embroidery } from '@/models/embroidery'
import { Step } from '@/models/step'

const store = useStore()
const status = ref('未読込')

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const fr = new FileReader()
    fr.onload = (e: any) => resolve(e.currentTarget?.result)
    fr.readAsText(file)
  })
}

async function onFileChange(e: any) {
  let files = e.target?.files
  if (files && files.length > 0) {
    const svg = await readFile(files[0])
    e.target.value = ''

    try {
      const parsedSvg = parseSvg(svg)

      store.embroidery = new Embroidery(
        parsedSvg.width,
        parsedSvg.height,
        parsedSvg.objectPathList.map((objectPath) => new Step(objectPath.color, objectPath.path)),
      )

      status.value = '読み込み完了'
    } catch (error: any) {
      console.error('Error parsing SVG:', error)
      status.value = error.message
    }
  }
}
</script>

<template>
  <PanelBase title="プロジェクト設定">
    <p>ステータス: {{ status }}</p>
    <label for="project-file"><MenuButton>SVG読み込み</MenuButton></label>
    <input
      type="file"
      name="project-file"
      id="project-file"
      @change="onFileChange"
      accept=".svg"
      hidden
    />
  </PanelBase>
</template>

<style scoped></style>
