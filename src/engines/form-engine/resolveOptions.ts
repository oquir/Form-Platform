import type { FieldConfig, CatalogRef, ApiRef } from '@/types/config.types'
import type { HydratedData, GlobalCatalogs } from '@/types/form.types'
import type { SelectOption } from '@/types/api.types'

function isCatalogRef(source: FieldConfig['source']): source is CatalogRef {
  return source != null && 'catalog' in source
}

function isApiRef(source: FieldConfig['source']): source is ApiRef {
  return source != null && 'api' in source
}

// Resuelve opciones desde catálogo global. Las fuentes 'api' se hidratan
// vía hooks (Fase 4) y se inyectan luego en HydratedData; aquí devolvemos []
// para no acoplar el engine al ciclo de fetching.
export function resolveOptions(
  field: FieldConfig,
  hydrated: HydratedData
): SelectOption[] | undefined {
  if (field.type !== 'select') return undefined

  if (isCatalogRef(field.source)) {
    const key = field.source.catalog as keyof GlobalCatalogs
    return hydrated.catalogs[key] ?? []
  }

  if (isApiRef(field.source)) {
    return []
  }

  return []
}
