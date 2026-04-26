import { resolveValueRef } from '@/engines/rule-engine'
import type { ValidatorFn } from '../types'

function toCount(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return null
}

export const arrayMinValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null || !Array.isArray(value)) return null
  const min = toCount(resolveValueRef(rule.value, ctx))
  if (min == null) return null
  return value.length < min ? rule.message : null
}

export const arrayMaxValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null || !Array.isArray(value)) return null
  const max = toCount(resolveValueRef(rule.value, ctx))
  if (max == null) return null
  return value.length > max ? rule.message : null
}
