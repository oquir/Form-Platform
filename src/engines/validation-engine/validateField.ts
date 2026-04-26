import type { FieldConfig, ValidationRule } from '@/types/config.types'
import { evaluateCondition } from '@/engines/rule-engine'
import type { EvalContext } from '@/engines/rule-engine'
import { getValidator } from './validators-registry'

function ruleApplies(rule: ValidationRule, ctx: EvalContext): boolean {
  if (!rule.applyWhen) return true
  return evaluateCondition(rule.applyWhen, ctx)
}

// Itera las reglas declaradas y devuelve el primer mensaje de error.
// Fail-fast: una vez encontrado un error, no se ejecutan las demás reglas
// (alinea con la mayoría de UX de validación de formularios).
export function validateField(
  field: FieldConfig,
  value: unknown,
  ctx: EvalContext
): string | null {
  for (const rule of field.validations) {
    if (!ruleApplies(rule, ctx)) continue

    const validator = getValidator(rule.type)
    if (!validator) continue

    const error = validator(value, rule, ctx)
    if (error) return error
  }
  return null
}
