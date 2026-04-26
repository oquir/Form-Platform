import { resolveValueRef } from '@/engines/rule-engine'
import type { ValidatorFn } from '../types'

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function isEmpty(v: unknown): boolean {
  if (v == null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  return false
}

export const requiredValidator: ValidatorFn = (value, rule) => {
  return isEmpty(value) ? rule.message : null
}

export const minValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null) return null
  const n = toNumber(value)
  const min = toNumber(resolveValueRef(rule.value, ctx))
  if (n == null || min == null) return null
  return n < min ? rule.message : null
}

export const maxValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null) return null
  const n = toNumber(value)
  const max = toNumber(resolveValueRef(rule.value, ctx))
  if (n == null || max == null) return null
  return n > max ? rule.message : null
}

export const minLengthValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null || typeof value !== 'string') return null
  const min = toNumber(resolveValueRef(rule.value, ctx))
  if (min == null) return null
  return value.length < min ? rule.message : null
}

export const maxLengthValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null || typeof value !== 'string') return null
  const max = toNumber(resolveValueRef(rule.value, ctx))
  if (max == null) return null
  return value.length > max ? rule.message : null
}

export const patternValidator: ValidatorFn = (value, rule, ctx) => {
  if (rule.value == null || typeof value !== 'string' || value === '') return null
  const pattern = resolveValueRef(rule.value, ctx)
  if (typeof pattern !== 'string') return null
  try {
    return new RegExp(pattern).test(value) ? null : rule.message
  } catch {
    return null
  }
}
