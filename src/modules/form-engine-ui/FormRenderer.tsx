import { useCallback, useMemo } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import type { MunicipalityConfig } from '@/types/config.types'
import type { FormValues, HydratedData } from '@/types/form.types'
import type { ResolvedStep } from '@/types/engine.types'
import { resolveSchema, resolveDefaults } from '@/engines/form-engine'
import { evaluateRules } from '@/engines/rule-engine'
import type { EvalContext } from '@/engines/rule-engine'
import { validateStep as runValidateStep } from '@/engines/validation-engine'
import { useFormSession } from '@/orchestration/form-state'
import { StepRenderer } from './StepRenderer'
import { StepNavigator } from './StepNavigator'
import { FormEngineProvider } from '@/context/FormEngineContext'

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
  const mergedInitial = useMemo(
    () => resolveDefaults(config, initialValues),
    // Solo en mount: los defaults de config no cambian en runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const initialSchema = useMemo(
    () => resolveSchema(
      config,
      evaluateRules({ config, values: mergedInitial, hydrated, context: ruleContext }),
      hydrated,
      mergedInitial,
    ),
    // Solo en mount: evita resetear currentStepIndex en cada cambio de valores.
    // Las reglas reactivas se aplican vía <ReactiveSession> abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const session = useFormSession({ schema: initialSchema, initialValues: mergedInitial })

  if (!session.currentStep) {
    return <p className="text-sm text-gray-500">No hay pasos visibles.</p>
  }

  return (
    <FormEngineProvider hydrated={hydrated}>
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
    </FormEngineProvider>
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
    () => resolveSchema(config, rules, hydrated, watched),
    [config, rules, hydrated, watched]
  )

  // Reemplaza el step de la sesión por la versión actualizada con reglas reactivas.
  // La sesión sigue siendo dueña del índice; aquí solo enriquecemos el contenido.
  const liveStep = schema.steps.find((s) => s.id === sessionStep.id) ?? sessionStep

  const handleNext = useCallback(() => {
    const stepConfig = config.steps.find((s) => s.id === liveStep.id)
    if (!stepConfig) { onNext(); return }

    const ctx: EvalContext = {
      values: { ...methods.getValues(), ...Object.fromEntries(rules.computed) },
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
      <DeadlineBanner deadlineDate={rules.deadlineDate} isLate={rules.isLate} />
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

function DeadlineBanner({ deadlineDate, isLate }: { deadlineDate: Date | null; isLate: boolean | null }) {
  if (!deadlineDate) return null

  const formatted = deadlineDate.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  if (isLate) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <span className="font-semibold">Declaración extemporánea.</span>{' '}
        La fecha límite de presentación fue el <span className="font-semibold">{formatted}</span>.
        Su declaración está sujeta a sanciones e intereses de mora.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
      Fecha límite de presentación:{' '}
      <span className="font-semibold">{formatted}</span>
    </div>
  )
}
