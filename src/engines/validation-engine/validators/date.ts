import { resolveValueRef } from '@/engines/rule-engine'
import type { ValidatorFn } from '../types'

function toTime(v: unknown): number | null {
  if (typeof v !== 'string' || v === '') return null
  const t = Date.parse(v)
  return Number.isNaN(t) ? null : t
}

export const dateAfterValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null) return null
  const a = toTime(value)
  const b = toTime(resolveValueRef(rule.value, ctx))
  if (a == null || b == null) return null
  return a > b ? null : rule.message
}

export const dateBeforeValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null) return null
  const a = toTime(value)
  const b = toTime(resolveValueRef(rule.value, ctx))
  if (a == null || b == null) return null
  return a < b ? null : rule.message
}
