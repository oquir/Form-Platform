import type { ConditionExpression, ConditionOperand } from '@/types/config.types'
import { resolveOperand, type EvalContext } from './operand-resolver'

function isExpression(node: ConditionOperand | ConditionExpression): node is ConditionExpression {
  return 'operator' in node
}

function resolveSide(
  node: ConditionOperand | ConditionExpression | undefined,
  ctx: EvalContext
): unknown {
  if (node === undefined) return undefined
  if (isExpression(node)) return evaluateCondition(node, ctx)
  return resolveOperand(node, ctx)
}

function compareNumbers(a: unknown, b: unknown, fn: (x: number, y: number) => boolean): boolean {
  if (typeof a !== 'number' || typeof b !== 'number') return false
  return fn(a, b)
}

// Evalúa una expresión booleana sobre un EvalContext. Recursiva: las ramas
// (left/right) pueden ser otra ConditionExpression. Cualquier operador
// desconocido devuelve false (fail-closed).
export function evaluateCondition(expr: ConditionExpression, ctx: EvalContext): boolean {
  const op = expr.operator

  if (op === 'and' || op === 'or') {
    const l = Boolean(resolveSide(expr.left, ctx))
    const r = Boolean(resolveSide(expr.right, ctx))
    return op === 'and' ? l && r : l || r
  }

  if (op === 'not') {
    return !Boolean(resolveSide(expr.left, ctx))
  }

  const l = resolveSide(expr.left, ctx)
  const r = resolveSide(expr.right, ctx)

  switch (op) {
    case 'eq':  return l === r
    case 'neq': return l !== r
    case 'gt':  return compareNumbers(l, r, (x, y) => x > y)
    case 'gte': return compareNumbers(l, r, (x, y) => x >= y)
    case 'lt':  return compareNumbers(l, r, (x, y) => x < y)
    case 'lte': return compareNumbers(l, r, (x, y) => x <= y)
    case 'in':  return Array.isArray(r) && r.includes(l)
    case 'notIn': return Array.isArray(r) && !r.includes(l)
    default: return false
  }
}
