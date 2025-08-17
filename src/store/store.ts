import type { Embroidery } from '@/models/embroidery'
import { Boundary, type Path } from '@/models/point'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useStore = defineStore('store', () => {
  const embroidery = ref<Embroidery | null>(null)

  const posiPath = ref<Path | null>(null)

  const editor = ref<Editor>({
    mode: 'step',
    selectedStepId: null,
  })

  const selectedStep = computed(() => {
    return (
      embroidery.value?.stepList.find((step) => step.id === editor.value.selectedStepId) || null
    )
  })

  const stepList = computed(() => embroidery.value?.stepList || [])

  const embroideryBoundary = computed(() => {
    if (!embroidery.value) return null
    const { width, height } = embroidery.value
    return new Boundary(0, 0, width, height)
  })

  return { embroidery, editor, selectedStep, stepList, embroideryBoundary, posiPath }
})

export type EditorMode = 'step' | 'process' | 'process-set-start-point' | 'process-set-end-point'

export interface Editor {
  mode: EditorMode
  selectedStepId: string | null
}
