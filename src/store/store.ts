import type { EditorView } from '@/components/editor/p5interface'
import { StepPreview } from '@/components/editor/step-preview'
import type { Embroidery } from '@/models/embroidery'
import { Boundary, type Path } from '@/models/point'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useStore = defineStore('store', () => {
  const embroidery = ref<Embroidery | null>(null)

  // Deprecated
  const editor = ref<Editor>({
    mode: EditorMode.Step,
    selectedStepId: null,
  })

  const editorView = ref<EditorView>(new StepPreview())

  const debugPath = ref<Path | null>(null)

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

  const previewMargin = ref(5)

  return { embroidery, editor, editorView, selectedStep, stepList, embroideryBoundary, debugPath, previewMargin }
})

export const EditorMode: { [key: string]: EditorMode } = {
  Step: {
    key: 'step',
    type: 'step',
    is: (...mode: EditorMode[]) => mode.some((m) => m.key === 'step' && m.type === 'step'),
  } as const,
  Process: {
    key: 'process',
    type: 'process',
    is: (...mode: EditorMode[]) => mode.some((m) => m.key === 'process' && m.type === 'process'),
  } as const,
  ProcessSetStartPoint: {
    key: 'process-set-start-point',
    type: 'process',
    is: (...mode: EditorMode[]) =>
      mode.some((m) => m.key === 'process-set-start-point' && m.type === 'process'),
  } as const,
  ProcessSetEndPoint: {
    key: 'process-set-end-point',
    type: 'process',
    is: (...mode: EditorMode[]) =>
      mode.some((m) => m.key === 'process-set-end-point' && m.type === 'process'),
  } as const,
  ProcessSetGuidePointPair: {
    key: 'process-set-guide-point-pair',
    type: 'process',
    is: (...mode: EditorMode[]) =>
      mode.some((m) => m.key === 'process-set-guide-point-pair' && m.type === 'process'),
  } as const,
  ProcessSetControlPoints: {
    key: 'process-set-control-points',
    type: 'process',
    is: (...mode: EditorMode[]) =>
      mode.some((m) => m.key === 'process-set-control-points' && m.type === 'process'),
  } as const,
} as const

export interface EditorMode {
  key: string
  type: string
  is(...mode: EditorMode[]): boolean
}

export interface Editor {
  mode: EditorMode
  selectedStepId: string | null
}
