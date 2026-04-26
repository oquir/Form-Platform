import type { MunicipalityConfig, FieldConfig, StepConfig } from '@/types/config.types'
import type { RuleEvalResult } from '@/types/engine.types'
import type { FormValues, HydratedData } from '@/types/form.types'
import type { EvalContext } from './operand-resolver'
import { evaluateCondition } from './condition-evaluator'
import { evaluateFormula } from './formula-evaluator'

interface EvaluateRulesArgs {
  config: MunicipalityConfig
  values: FormValues
  hydrated: HydratedData
  context?: Record<string, unknown>
}

function evalFieldVisibility(field: FieldConfig, ctx: EvalContext): boolean {
  if (field.visibleWhen == null) return true
  return evaluateCondition(field.visibleWhen, ctx)
}

function evalStepVisibility(step: StepConfig, ctx: EvalContext): boolean {
  if (step.visibleWhen == null) return true
  return evaluateCondition(step.visibleWhen, ctx)
}

// Entrypoint del Rule Engine. Pure: mismo input → mismo output.
// El coordinator lo invoca tras cada cambio relevante de formValues.
export function evaluateRules({
  config, values, hydrated, context = {},
}: EvaluateRulesArgs): RuleEvalResult {
  const ctx: EvalContext = { values, hydrated, context }

  const visibility = new Map<string, boolean>()
  const computed = new Map<string, number>()
  const stepVisibility = new Map<string, boolean>()

  for (const step of config.steps) {
    stepVisibility.set(step.id, evalStepVisibility(step, ctx))

    for (const field of step.fields) {
      visibility.set(field.id, evalFieldVisibility(field, ctx))

      if (field.type === 'calculated' && field.formula) {
        const result = evaluateFormula(field.formula, ctx)
        if (typeof result === 'number') {
          computed.set(field.id, result)
        }
      }
    }
  }

  return { visibility, computed, stepVisibility }
}
