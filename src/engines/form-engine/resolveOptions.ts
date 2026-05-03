import type { FieldConfig, CatalogRef, ApiRef } from '@/types/config.types'
import type { FormValues, HydratedData, GlobalCatalogs } from '@/types/form.types'
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
//
// Soporta cascadas declarativas vía `source.filterBy`: si el catálogo está
// indexado por `parentValue` y el config declara dependencia con otro field,
// las opciones se filtran por el valor actual de ese field. Sin valor padre
// se devuelve [] (la UI muestra solo el placeholder).
export function resolveOptions(
  field: FieldConfig,
  hydrated: HydratedData,
  values: FormValues
): SelectOption[] | undefined {
  if (field.type !== 'select' && field.type !== 'radio') return undefined

  if (isCatalogRef(field.source)) {
    const key = field.source.catalog as keyof GlobalCatalogs
    const all = hydrated.catalogs[key] ?? []

    const filterBy = field.source.filterBy
    if (!filterBy) return all

    const parentValue = values[filterBy.field]
    if (parentValue == null || parentValue === '') return []

    const parentStr = String(parentValue)
    return all.filter((opt) => opt.parentValue === parentStr)
  }

  if (isApiRef(field.source)) {
    return []
  }

  return []
}
