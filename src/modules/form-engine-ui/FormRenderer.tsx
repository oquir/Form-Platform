import { useCallback, useMemo } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import type { MunicipalityConfig } from '@/types/config.types'
import type { FormValues, HydratedData } from '@/types/form.types'
import type { ResolvedStep } from '@/types/engine.types'
import { resolveSchema } from '@/engines/form-engine'
import { evaluateRules } from '@/engines/rule-engine'
import type { EvalContext } from '@/engines/rule-engine'
import { validateStep as runValidateStep } from '@/engines/validation-engine'
import { useFormSession } from '@/orchestration/form-state'
import { StepRenderer } from './StepRenderer'
import { StepNavigator } from './StepNavigator'

interface FormRendererProps {
  config: MunicipalityConfig
  hydrated: HydratedData
  initialValues?: FormValues
  // Variables nombradas accesibles desde reglas (declarationType, dates...)
  ruleContext?: Record<string, unknown>
}

export function FormRenderer({
  config, hydrated, initialValues, ruleContext,
}: FormRendererProps) {
  // Snapshot del schema base sin valores — primer render para inicializar la sesión.
  // Después de tener la sesión y los watched values, se reevalúa todo.
  const initialSchema = useMemo(
    () => resolveSchema(config, evaluateRules({
      config, values: initialValues ?? {}, hydrated, context: ruleContext,
    }), hydrated),
    // Solo en mount: evita resetear currentStepIndex en cada cambio de valores.
    // Las reglas reactivas se aplican vía <ReactiveSession> abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const session = useFormSession({ schema: initialSchema, initialValues })

  if (!session.currentStep) {
    return <p className="text-sm text-gray-500">No hay pasos visibles.</p>
  }

  return (
    <FormProvider {...session.methods}>
      <ReactiveStepView
        config={config}
        hydrated={hydrated}
        ruleContext={ruleContext}
        methods={session.methods}
        sessionStep={session.currentStep}
        currentStepIndex={session.currentStepIndex}
        totalSteps={session.visibleSteps.length}
        isFirst={session.isFirstStep}
        isLast={session.isLastStep}
        onPrev={session.goPrev}
        onNext={session.goNext}
      />
    </FormProvider>
  )
}

// Componente interno: vive bajo FormProvider, así puede llamar useWatch
// sin recrear el form context. Recalcula reglas/schema reactivamente
// y compone validación + avance.
interface ReactiveStepViewProps {
  config: MunicipalityConfig
  hydrated: HydratedData
  ruleContext?: Record<string, unknown>
  methods: UseFormReturn<FormValues>
  sessionStep: ResolvedStep
  currentStepIndex: number
  totalSteps: number
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
}

function ReactiveStepView({
  config, hydrated, ruleContext, methods,
  sessionStep, currentStepIndex, totalSteps, isFirst, isLast, onPrev, onNext,
}: ReactiveStepViewProps) {
  const watched = useWatch({ control: methods.control }) as FormValues

  const rules = useMemo(
    () => evaluateRules({ config, values: watched, hydrated, context: ruleContext }),
    [config, watched, hydrated, ruleContext]
  )

  const schema = useMemo(
    () => resolveSchema(config, rules, hydrated),
    [config, rules, hydrated]
  )

  // Reemplaza el step de la sesión por la versión actualizada con reglas reactivas.
  // La sesión sigue siendo dueña del índice; aquí solo enriquecemos el contenido.
  const liveStep = schema.steps.find((s) => s.id === sessionStep.id) ?? sessionStep

  const handleNext = useCallback(() => {
    const stepConfig = config.steps.find((s) => s.id === liveStep.id)
    if (!stepConfig) { onNext(); return }

    const ctx: EvalContext = {
      values: methods.getValues(),
      hydrated,
      context: ruleContext ?? {},
    }
    const result = runValidateStep(stepConfig, rules, ctx)

    if (!result.isValid) {
      methods.clearErrors()
      for (const [fieldId, message] of result.errors) {
        methods.setError(fieldId, { type: 'validation', message })
      }
      return
    }

    methods.clearErrors()
    onNext()
  }, [config, liveStep.id, rules, hydrated, ruleContext, methods, onNext])

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
      <StepRenderer step={liveStep} />
      <StepNavigator
        currentIndex={currentStepIndex}
        totalSteps={totalSteps}
        isFirst={isFirst}
        isLast={isLast}
        onPrev={onPrev}
        onNext={handleNext}
      />
    </form>
  )
}
