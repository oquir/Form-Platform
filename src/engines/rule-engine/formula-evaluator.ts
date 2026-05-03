import type { FormulaNode, FormulaOperand } from '@/types/config.types'
import type { EvalContext } from './operand-resolver'
import { resolveValueRef } from './operand-resolver'
import { applyTransforms } from './transform-runner'

function toNumber(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function resolveHydratedPath(path: string, ctx: EvalContext): unknown {
  const parts = path.split('.')
  let val: unknown = ctx.hydrated
  for (const p of parts) {
    if (val == null || typeof val !== 'object') return undefined
    val = (val as Record<string, unknown>)[p]
  }
  return val
}

function resolveOperandValue(operand: FormulaOperand, ctx: EvalContext): number {
  if (typeof operand === 'number') return operand
  if (typeof operand === 'object') return toNumber(resolveHydratedPath(operand.hydrated, ctx))
  // String: referencia a otro campo del formulario
  return toNumber(ctx.values[operand])
}

function reduceArithmetic(
  operands: Array<FormulaOperand> | undefined,
  ctx: EvalContext,
  fn: (acc: number, n: number) => number,
  initial: number
): number {
  if (!operands || operands.length === 0) return initial
  return operands.map((o) => resolveOperandValue(o, ctx)).reduce(fn, initial)
}

function evalSumField(node: FormulaNode, ctx: EvalContext): number {
  if (!node.source || !node.sourceField) return 0
  const arr = ctx.values[node.source]
  if (!Array.isArray(arr)) return 0
  return arr.reduce<number>((acc, row) => {
    if (row && typeof row === 'object') {
      return acc + toNumber((row as Record<string, unknown>)[node.sourceField as string])
    }
    return acc
  }, 0)
}

// Phase 3: cálculo de sanción simplificado — solo aplica un porcentaje
// sobre `base` capado al 100% (200% en emplazamiento). El detalle por
// fechas se completa cuando el coordinator inyecte fechas en `context`.
function evalSanction(node: FormulaNode, ctx: EvalContext): number {
  if (!node.base) return 0
  const baseValue = toNumber(ctx.values[node.base])
  const params = node.params ?? {}
  const pct = toNumber(params.porcentaje ? resolveValueRef(params.porcentaje, ctx) : 0)
  const cap = toNumber(params.cap ? resolveValueRef(params.cap, ctx) : 100)
  const effective = Math.min(pct, cap)
  return baseValue * (effective / 100)
}

// Evalúa un FormulaNode → number. Aplica postProcess al final (transforms
// nombrados como redondeo). El input nunca contiene funciones; todo es data.
export function evaluateFormula(node: FormulaNode, ctx: EvalContext): unknown {
  let raw: number

  switch (node.operation) {
    case 'add':
      raw = reduceArithmetic(node.operands, ctx, (a, b) => a + b, 0)
      break
    case 'subtract': {
      const ops = node.operands ?? []
      if (ops.length === 0) { raw = 0; break }
      const [first, ...rest] = ops.map((o) => resolveOperandValue(o, ctx))
      raw = rest.reduce((a, b) => a - b, first)
      break
    }
    case 'multiply': {
      const product = reduceArithmetic(node.operands, ctx, (a, b) => a * b, 1)
      // Soporta el patrón ICA "ingresos * tarifa / 1000": divisor opcional
      // aplicado al producto. Si divisor=0, devuelve 0 (fail-closed).
      const divisor = node.divisor ?? 1
      raw = divisor === 0 ? 0 : product / divisor
      break
    }
    case 'divide': {
      const ops = node.operands ?? []
      if (ops.length === 0) { raw = 0; break }
      const [first, ...rest] = ops.map((o) => resolveOperandValue(o, ctx))
      const divisor = node.divisor ?? rest.reduce((a, b) => a * b, 1)
      raw = divisor === 0 ? 0 : first / divisor
      break
    }
    case 'sumField':
      raw = evalSumField(node, ctx)
      break
    case 'calculateSanction':
      raw = evalSanction(node, ctx)
      break
    default:
      raw = 0
  }

  return applyTransforms(raw, node.postProcess, ctx.hydrated)
}
