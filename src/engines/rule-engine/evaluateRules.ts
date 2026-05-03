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

// Resuelve el colSpan efectivo de un field. Primer `colSpanWhen` que matchee
// gana; si no hay match, cae al `colSpan` declarado. Devuelve `undefined`
// cuando el field no tiene configuración explícita: el form-engine aplica
// el default (12 = fila completa).
function evalFieldColSpan(field: FieldConfig, ctx: EvalContext): number | undefined {
  if (field.colSpanWhen) {
    for (const rule of field.colSpanWhen) {
      if (evaluateCondition(rule.when, ctx)) return rule.value
    }
  }
  return field.colSpan
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
  const colSpan = new Map<string, number>()
  const disabled = new Map<string, boolean>()

  // Copia mutable de los valores: permite que un campo `calculated` sea
  // referenciado como operando por otro campo calculado posterior. Exige
  // que la config declare los campos en orden de dependencia (natural en
  // un formulario secuencial: el campo 10 siempre aparece antes que el 16).
  const currentValues = { ...values }

  for (const step of config.steps) {
    stepVisibility.set(step.id, evalStepVisibility(step, ctx))

    for (const field of step.fields) {
      visibility.set(field.id, evalFieldVisibility(field, ctx))

      if (field.disabledWhen != null) {
        disabled.set(field.id, evaluateCondition(field.disabledWhen, ctx))
      }

      const span = evalFieldColSpan(field, ctx)
      if (span !== undefined) colSpan.set(field.id, span)

      if (field.type === 'calculated' && field.formula) {
        const result = evaluateFormula(field.formula, { ...ctx, values: currentValues })
        if (typeof result === 'number') {
          computed.set(field.id, result)
          // Propaga el resultado para que fórmulas posteriores puedan usarlo.
          currentValues[field.id] = result
        }
      }
    }
  }

  return { visibility, computed, stepVisibility, colSpan, disabled }
}
