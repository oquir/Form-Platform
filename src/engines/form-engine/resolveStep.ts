import type { StepConfig, FieldConfig } from '@/types/config.types'
import type { ResolvedStep, ResolvedField, RuleEvalResult } from '@/types/engine.types'
import type { FormValues, HydratedData } from '@/types/form.types'
import { resolveOptions } from './resolveOptions'
import { resolveBindings } from './resolveBindings'

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
  hydrated: HydratedData,
  values: FormValues
): ResolvedField {
  return {
    id: field.id,
    label: field.label,
    type: field.type,
    isVisible: resolveFieldVisibility(field, rules),
    isDisabled: rules.disabled.get(field.id) ?? false,
    options: resolveOptions(field, hydrated, values),
    computedValue: field.type === 'calculated' ? rules.computed.get(field.id) : undefined,
    displayItems: field.type === 'display' ? resolveBindings(field.bindings, hydrated) : undefined,
    // Default 12 (fila completa) si la config no especifica colSpan.
    colSpan: rules.colSpan.get(field.id) ?? 12,
    postProcess: field.postProcess,
    maxLength: resolveMaxLength(field),
    min: resolveMin(field),
    displayFormat: field.displayFormat,
    maxRows: field.maxRows,
    rowCalculations: field.rowCalculations,
    clearable: field.clearable,
  }
}

function resolveMaxLength(field: FieldConfig): number | undefined {
  const rule = field.validations.find((v) => v.type === 'maxLength')
  if (!rule?.value || !('literal' in rule.value)) return undefined
  const n = Number(rule.value.literal)
  return Number.isFinite(n) ? n : undefined
}

function resolveMin(field: FieldConfig): number | undefined {
  const rule = field.validations.find((v) => v.type === 'min')
  if (!rule?.value || !('literal' in rule.value)) return undefined
  const n = Number(rule.value.literal)
  return Number.isFinite(n) ? n : undefined
}

export function resolveStep(
  step: StepConfig,
  rules: RuleEvalResult,
  hydrated: HydratedData,
  values: FormValues
): ResolvedStep {
  const fromRules = rules.stepVisibility.get(step.id)
  const isVisible = fromRules !== undefined ? fromRules : step.visibleWhen == null

  return {
    id: step.id,
    label: step.label,
    order: step.order,
    isVisible,
    fields: step.fields.map((f) => resolveField(f, rules, hydrated, values)),
  }
}
