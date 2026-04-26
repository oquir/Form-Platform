import type { ConditionOperand, ValueRef } from '@/types/config.types'
import type { FormValues, HydratedData, GlobalCatalogs } from '@/types/form.types'

export interface EvalContext {
  values: FormValues
  hydrated: HydratedData
  // Variables nombradas (declarationType, currentDate, etc.) accesibles
  // desde reglas vía { context: 'name' }. Inyectadas por el coordinator.
  context: Record<string, unknown>
}

function isFieldRef(o: ConditionOperand | ValueRef): o is { field: string } {
  return 'field' in o
}

function isLiteral(o: ConditionOperand | ValueRef): o is { literal: unknown } {
  return 'literal' in o
}

function isContextRef(o: ValueRef): o is { context: string } {
  return 'context' in o
}

function isCatalogRef(o: ValueRef): o is { catalog: string } {
  return 'catalog' in o
}

// Resuelve un ConditionOperand simple (literal o field). Los nodos que
// son a su vez ConditionExpression los maneja el evaluator de condiciones.
export function resolveOperand(o: ConditionOperand, ctx: EvalContext): unknown {
  if (isLiteral(o)) return o.literal
  if (isFieldRef(o)) return ctx.values[o.field]
  return undefined
}

export function resolveValueRef(ref: ValueRef, ctx: EvalContext): unknown {
  if (isLiteral(ref)) return ref.literal
  if (isFieldRef(ref)) return ctx.values[ref.field]
  if (isContextRef(ref)) return ctx.context[ref.context]
  if (isCatalogRef(ref)) {
    const key = ref.catalog as keyof GlobalCatalogs
    return ctx.hydrated.catalogs[key]
  }
  return undefined
}
