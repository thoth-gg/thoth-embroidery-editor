import type { EditorView } from '@/components/editor/p5interface'
import { ProcessPreview } from '@/components/editor/process-preview'
import type { Embroidery } from '@/models/embroidery'
import { Boundary, Path } from '@/models/point'
import type { Process } from '@/models/process'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useStore = defineStore('store', () => {
  const embroidery = ref<Embroidery | null>(null)

  // Deprecated
  const editor = ref<Editor>({
    mode: EditorMode.Step,
    selectedStepId: null,
    selectedStepProcessId: null,
  })

  const editorView = ref<EditorView>(new ProcessPreview())

  const debugPath = ref<Path | null>(null)
  const processList = ref<Process[]>([])
  const previewStitchLimit = ref(0)

  const selectedStep = computed(() => {
    return (
      embroidery.value?.stepList.find((step) => step.id === editor.value.selectedStepId) || null
    )
  })

  const stepList = computed(() => embroidery.value?.stepList || [])

  const embroideryBoundary = computed(() => {
    if (!embroidery.value) return null
    const stepBoundary = Boundary.fromPath(new Path(...embroidery.value.stepList.flatMap((s) => s.sourcePath)))
    return stepBoundary.padding(previewMargin.value)
  })

  const previewMargin = ref(5)

  return { embroidery, editor, editorView, selectedStep, stepList, embroideryBoundary, debugPath, previewMargin, processList, previewStitchLimit }
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
  selectedStepProcessId: string | null
}
