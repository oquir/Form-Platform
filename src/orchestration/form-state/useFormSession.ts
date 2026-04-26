import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import type { FormValues } from '@/types/form.types'
import type { ResolvedFormSchema, ResolvedStep } from '@/types/engine.types'

interface UseFormSessionArgs {
  schema: ResolvedFormSchema
  initialValues?: FormValues
}

export interface FormSession {
  methods: UseFormReturn<FormValues>
  visibleSteps: ResolvedStep[]
  currentStepIndex: number
  currentStep: ResolvedStep | null
  isFirstStep: boolean
  isLastStep: boolean
  goNext: () => void
  goPrev: () => void
  goTo: (index: number) => void
}

// Sesión = RHF + navegación de pasos. No conoce ValidationEngine.
// La validación al avanzar la compone el coordinator (FormRenderer).
export function useFormSession({ schema, initialValues }: UseFormSessionArgs): FormSession {
  const methods = useForm<FormValues>({
    defaultValues: initialValues ?? {},
    mode: 'onBlur',
    shouldUnregister: false,
  })

  const visibleSteps = useMemo(
    () => schema.steps.filter((s) => s.isVisible),
    [schema]
  )

  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const safeIndex = Math.min(currentStepIndex, Math.max(visibleSteps.length - 1, 0))
  const currentStep = visibleSteps[safeIndex] ?? null

  const goTo = useCallback((index: number) => {
    setCurrentStepIndex(() => Math.max(0, Math.min(index, visibleSteps.length - 1)))
  }, [visibleSteps.length])

  const goNext = useCallback(() => {
    setCurrentStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1))
  }, [visibleSteps.length])

  const goPrev = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  return {
    methods,
    visibleSteps,
    currentStepIndex: safeIndex,
    currentStep,
    isFirstStep: safeIndex === 0,
    isLastStep: safeIndex === visibleSteps.length - 1,
    goNext,
    goPrev,
    goTo,
  }
}
