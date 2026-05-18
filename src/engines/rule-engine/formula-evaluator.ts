import type { FormulaNode, FormulaOperand, UnidadTiempoMora, MinimoSancionRef } from '@/types/config.types'
import type { EvalContext } from './operand-resolver'
import { resolveValueRef } from './operand-resolver'
import { applyTransforms } from './transform-runner'
import { evaluateCondition } from './condition-evaluator'
import { env } from '@/env'

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

// ── Sanción por extemporaneidad ───────────────────────────────────────────────

function calcularPeriodos(desde: Date, hasta: Date, unidad: UnidadTiempoMora): number {
  const diffMs  = hasta.getTime() - desde.getTime()
  const diffDias = diffMs / (1000 * 60 * 60 * 24)

  if (unidad === 'dia') return Math.ceil(diffDias)

  // Diferencia en meses exactos (puede ser decimal)
  const mesesExactos =
    (hasta.getFullYear() - desde.getFullYear()) * 12 +
    (hasta.getMonth()   - desde.getMonth()) +
    (hasta.getDate() - desde.getDate()) / 30

  if (unidad === 'mes') return Math.floor(mesesExactos)
  // 'fraccion' → mes completo o fracción cuenta como mes completo
  return Math.ceil(mesesExactos)
}

function resolveMinimo(ref: MinimoSancionRef): number {
  if (ref.tipo === 'uvt')   return ref.cantidad * env.uvtValue
  if (ref.tipo === 'smmlv') return ref.cantidad * env.smmlvValue
  return ref.valor
}

function evalSancionExtemporaneidad(node: FormulaNode, ctx: EvalContext): number {
  const deadlineTs = toNumber(ctx.values['_deadlineTimestamp'])
  if (!deadlineTs) return 0

  const deadline = new Date(deadlineTs)
  const now = new Date()
  if (now <= deadline) return 0

  const campoBase = (node.operands?.[0] as string | undefined) ?? 'totalImpuestoACargo'
  const base = toNumber(ctx.values[campoBase])
  if (base <= 0) return 0

  const tasa       = node.tasa       ?? 0.05
  const unidad     = node.unidadTiempo ?? 'fraccion'
  const periodos   = calcularPeriodos(deadline, now, unidad)

  let sancion = tasa * periodos * base

  // Aplica mínimo
  if (node.minimoSancion) {
    const minVal = resolveMinimo(node.minimoSancion)
    sancion = Math.max(sancion, minVal)
  }

  // Cap: la sanción no puede superar el 100 % del impuesto base
  return Math.min(sancion, base)
}

// ── Intereses moratorios ──────────────────────────────────────────────────────

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function evalInteresesMoratorios(node: FormulaNode, ctx: EvalContext): number {
  const deadlineTs = toNumber(ctx.values['_deadlineTimestamp'])
  if (!deadlineTs) return 0

  const deadline = new Date(deadlineTs)
  const now = new Date()
  if (now <= deadline) return 0

  const campoBase = (node.operands?.[0] as string | undefined) ?? 'valorAPagar'
  const valorBase = toNumber(ctx.values[campoBase])
  if (valorBase <= 0) return 0

  const diasMora = Math.ceil((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
  if (diasMora <= 0) return 0

  // La tasa diaria usa 366 días en año bisiesto, 365 en año normal.
  // El año relevante es el del día de hoy (cuando se está pagando).
  const diasAnio = isLeapYear(now.getFullYear()) ? 366 : 365
  const tasaDiaria = env.tasaInteresAnual / diasAnio

  return (valorBase * tasaDiaria * diasMora) / 100
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
    case 'net': {
      const pos = (node.positives ?? []).map((o) => resolveOperandValue(o, ctx)).reduce((a, b) => a + b, 0)
      const neg = (node.negatives ?? []).map((o) => resolveOperandValue(o, ctx)).reduce((a, b) => a + b, 0)
      raw = pos - neg
      break
    }
    case 'conditional': {
      const branch = node.condition && evaluateCondition(node.condition, ctx) ? node.then : node.else
      if (!branch) { raw = 0; break }
      const branchResult = evaluateFormula(branch, ctx)
      return typeof branchResult === 'number' ? branchResult : 0
    }
    case 'sancionExtemporaneidad':
      raw = evalSancionExtemporaneidad(node, ctx)
      break
    case 'interesesMoratorios':
      raw = evalInteresesMoratorios(node, ctx)
      break
    default:
      raw = 0
  }

  return applyTransforms(raw, node.postProcess, ctx.hydrated)
}
