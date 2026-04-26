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
