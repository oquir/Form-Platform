import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { apiGateway } from '@/infrastructure/api/ApiGateway'
import { ENDPOINTS } from '@/infrastructure/api/endpoints'
import type { ActividadEconomica, ClasificacionMunicipio, Municipio } from '@/infrastructure/api/types'
import { STALE_TIMES } from '@/lib/query-client'
import {
  actividadesEconomicasResponseSchema,
  clasificacionMunicipioResponseSchema,
  municipioSchema,
} from '@/infrastructure/schemas/api-responses.schemas'

// Datos dependientes del municipio activo. La cache se segmenta por id
// gracias al query key — cambiar de municipio no contamina el anterior.
export const MUNICIPALITY_QUERY_KEYS = {
  consultarMunicipio:      (id: string) => ['municipality', 'consultarMunicipio', id]      as const,
  clasificacionMunicipio:  (id: string) => ['municipality', 'clasificacionMunicipio', id]  as const,
  actividadesEconomicas:   (id: string) => ['municipality', 'actividadesEconomicas', id]   as const,
}

export function useConsultarMunicipioQuery(
  municipalityId: string | null
): UseQueryResult<Municipio> {
  return useQuery({
    queryKey: MUNICIPALITY_QUERY_KEYS.consultarMunicipio(municipalityId ?? ''),
    queryFn: async () => {
      const result = await apiGateway.get<unknown>(
        ENDPOINTS.GET_MUNICIPALITY(municipalityId as string)
      )
      return municipioSchema.parse(result)
    },
    // Solo dispara con id presente; el FormPage gatea el render previo.
    enabled: !!municipalityId,
    staleTime: STALE_TIMES.MUNICIPALITY_DATA,
  })
}

export function useActividadesEconomicasQuery(
  municipalityId: string | null
): UseQueryResult<ActividadEconomica[]> {
  return useQuery({
    queryKey: MUNICIPALITY_QUERY_KEYS.actividadesEconomicas(municipalityId ?? ''),
    queryFn: async () => {
      const result = await apiGateway.get<unknown>(
        ENDPOINTS.LIST_ECONOMIC_ACTIVITIES(municipalityId as string)
      )
      return actividadesEconomicasResponseSchema.parse(result)
    },
    enabled: !!municipalityId,
    staleTime: STALE_TIMES.MUNICIPALITY_DATA,
  })
}

export function useClasificacionMunicipioQuery(
  municipalityId: string | null
): UseQueryResult<ClasificacionMunicipio[]> {
  return useQuery({
    queryKey: MUNICIPALITY_QUERY_KEYS.clasificacionMunicipio(municipalityId ?? ''),
    queryFn: async () => {
      const result = await apiGateway.get<unknown>(
        ENDPOINTS.LIST_CLASIFICATION_TYPES(municipalityId as string)
      )
      return clasificacionMunicipioResponseSchema.parse(result)
    },
    enabled: !!municipalityId,
    staleTime: STALE_TIMES.MUNICIPALITY_DATA,
  })
}
