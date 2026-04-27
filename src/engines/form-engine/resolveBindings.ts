import type { DisplayBinding } from '@/types/config.types'
import type { HydratedData } from '@/types/form.types'

// Resolución de paths dot-notation contra HydratedData.
// Devuelve undefined si cualquier eslabón intermedio no existe.
export function getByPath(source: unknown, path: string): unknown {
  if (path === '') return source
  const segments = path.split('.')
  let cursor: unknown = source
  for (const seg of segments) {
    if (cursor == null || typeof cursor !== 'object') return undefined
    cursor = (cursor as Record<string, unknown>)[seg]
  }
  return cursor
}

// Formatea valores primitivos para display. Mantener simple — para
// formatos complejos (fechas, moneda) se introducirán transforms.
function formatForDisplay(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return '—'
}

export function resolveBindings(
  bindings: DisplayBinding[] | undefined,
  hydrated: HydratedData
): Array<{ label: string; value: string }> {
  if (!bindings) return []
  return bindings.map((b) => ({
    label: b.label,
    value: formatForDisplay(getByPath(hydrated, b.path)),
  }))
}
