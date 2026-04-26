import type { ConditionExpression } from '@/types/config.types'
import { evaluateCondition } from '@/engines/rule-engine'
import type { EvalContext } from '@/engines/rule-engine'
import type { ValidatorFn } from '../types'

// Validadores nombrados (registrados desde código), referenciables desde
// el JSON con `type: 'custom'` y `value: { literal: 'nombreFn' }`.
type CustomValidatorFn = (value: unknown, ctx: EvalContext) => boolean
type CustomConditionFn = (ctx: EvalContext) => ConditionExpression | null

const customRegistry: Record<string, CustomValidatorFn> = {}
const customConditionRegistry: Record<string, CustomConditionFn> = {}

export function registerCustomValidator(name: string, fn: CustomValidatorFn): void {
  customRegistry[name] = fn
}

export function registerCustomCondition(name: string, fn: CustomConditionFn): void {
  customConditionRegistry[name] = fn
}

export const customValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null || !('literal' in rule.value)) return null
  const name = rule.value.literal
  if (typeof name !== 'string') return null

  const fn = customRegistry[name]
  if (fn) return fn(value, ctx) ? null : rule.message

  const condFn = customConditionRegistry[name]
  if (condFn) {
    const expr = condFn(ctx)
    if (!expr) return null
    return evaluateCondition(expr, ctx) ? null : rule.message
  }

  return null
}
