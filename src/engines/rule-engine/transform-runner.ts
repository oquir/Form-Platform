import type { HydratedData } from '@/types/form.types'

type TransformFn = (value: unknown, hydrated: HydratedData) => unknown

// Transforms invocables desde FormulaNode.postProcess o PayloadMap.transform.
// Nombrados, registrables — el JSON nunca contiene código.
const transformRegistry: Record<string, TransformFn> = {
  // DOMAIN.md: 499 → 0, 500 → 1000 (redondeo a miles, half-up)
  redondearMiles: (value) => {
    if (typeof value !== 'number') return value
    return Math.round(value / 1000) * 1000
  },
  // Saldo a cargo: si el resultado es negativo, el campo vale 0
  clampMin0: (value) => {
    if (typeof value !== 'number') return value
    return Math.max(0, value)
  },
  // Saldo a favor: negativo del balance; si el balance era positivo, vale 0
  negateClampMin0: (value) => {
    if (typeof value !== 'number') return value
    return Math.max(0, -value)
  },
  // Redondeo hacia arriba a miles. 0 permanece en 0; cualquier valor > 0
  // sube al siguiente múltiplo de 1000 (1→1000, 1001→2000, 10000→10000).
  ceilMiles: (value) => {
    if (typeof value !== 'number' || value <= 0) return 0
    return Math.ceil(value / 1000) * 1000
  },
}

export function registerTransform(name: string, fn: TransformFn): void {
  transformRegistry[name] = fn
}

export function applyTransforms(
  value: unknown,
  names: string[] | undefined,
  hydrated: HydratedData
): unknown {
  if (!names || names.length === 0) return value
  return names.reduce<unknown>((acc, name) => {
    const fn = transformRegistry[name]
    return fn ? fn(acc, hydrated) : acc
  }, value)
}
