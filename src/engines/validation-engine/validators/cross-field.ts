import type { ConditionExpression } from '@/types/config.types'
import { evaluateCondition, resolveValueRef } from '@/engines/rule-engine'
import type { ValidatorFn } from '../types'

// crossField: la regla pasa si la condición sintética se cumple.
// Permite reglas tipo "fecha A debe ser anterior a fecha B" expresadas
// como ConditionExpression a través de rule.target/operator/value.
export const crossFieldValidator: ValidatorFn = (_value, rule, ctx) => {
  if (!rule.target || !rule.operator || rule.value == null) return null

  const expr: ConditionExpression = {
    operator: rule.operator,
    left: { field: rule.target },
    right: { literal: resolveValueRef(rule.value, ctx) },
  }

  return evaluateCondition(expr, ctx) ? null : rule.message
}
