// Lazy loaders por municipio — cada JSON se importa solo cuando el usuario lo selecciona
// Se agregan entradas aquí al incorporar nuevos municipios (zero código en engines)

import type { MunicipalityConfig } from '@/types/config.types'

type MunicipalityLoader = () => Promise<MunicipalityConfig>

export const municipalityRegistry: Record<string, MunicipalityLoader> = {
  // '11001': () => import('../municipalities/bogota.config.json'),
  // '05001': () => import('../municipalities/medellin.config.json'),
}

export async function loadMunicipalityConfig(
  municipalityId: string
): Promise<MunicipalityConfig> {
  const loader = municipalityRegistry[municipalityId]

  if (!loader) {
    throw new Error(`[municipalityRegistry] No config found for municipalityId: ${municipalityId}`)
  }

  return loader()
}
