import type { StepConfig, FieldConfig } from '@/types/config.types'
import type { ResolvedStep, ResolvedField, RuleEvalResult } from '@/types/engine.types'
import type { HydratedData } from '@/types/form.types'
import { resolveOptions } from './resolveOptions'

// Determina visibilidad de un campo. En Fase 2 el RuleEngine aún no evalúa
// `visibleWhen`, así que se respeta lo que ya esté en el mapa o se asume
// visible por defecto. Cuando RuleEngine entre en Fase 3, su output llenará
// el mapa y la lógica aquí no cambia.
function resolveFieldVisibility(field: FieldConfig, rules: RuleEvalResult): boolean {
  const fromRules = rules.visibility.get(field.id)
  if (fromRules !== undefined) return fromRules
  return field.visibleWhen == null
}

function resolveField(
  field: FieldConfig,
  rules: RuleEvalResult,
  hydrated: HydratedData
): ResolvedField {
  return {
    id: field.id,
    label: field.label,
    type: field.type,
    isVisible: resolveFieldVisibility(field, rules),
    isDisabled: false,
    options: resolveOptions(field, hydrated),
    computedValue: field.type === 'calculated' ? rules.computed.get(field.id) : undefined,
  }
}

export function resolveStep(
  step: StepConfig,
  rules: RuleEvalResult,
  hydrated: HydratedData
): ResolvedStep {
  const fromRules = rules.stepVisibility.get(step.id)
  const isVisible = fromRules !== undefined ? fromRules : step.visibleWhen == null

  return {
    id: step.id,
    label: step.label,
    order: step.order,
    isVisible,
    fields: step.fields.map((f) => resolveField(f, rules, hydrated)),
  }
}
