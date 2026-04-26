import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { apiGateway } from '@/infrastructure/api/ApiGateway'
import { ENDPOINTS } from '@/infrastructure/api/endpoints'
import type { PeriodoAnual, TipoDeclaracion } from '@/infrastructure/api/types'
import { STALE_TIMES } from '@/lib/query-client'
import {
  periodosAnualesResponseSchema,
  tiposDeclaracionResponseSchema,
} from '@/infrastructure/schemas/api-responses.schemas'

// Query keys centralizadas — un solo lugar para invalidaciones futuras.
export const GLOBAL_QUERY_KEYS = {
  periodosAnuales:    ['catalogs', 'periodosAnuales']    as const,
  tiposDeclaracion:   ['catalogs', 'tiposDeclaracion']   as const,
}

export function usePeriodosAnualesQuery(): UseQueryResult<PeriodoAnual[]> {
  return useQuery({
    queryKey: GLOBAL_QUERY_KEYS.periodosAnuales,
    queryFn: async () => {
      // ApiGateway desempaca el envelope; aquí solo validamos `result`.
      const result = await apiGateway.get<unknown>(ENDPOINTS.LIST_ANNUAL_PERIODS)
      return periodosAnualesResponseSchema.parse(result)
    },
    staleTime: STALE_TIMES.GLOBAL_CATALOGS,
  })
}

export function useTiposDeclaracionQuery(): UseQueryResult<TipoDeclaracion[]> {
  return useQuery({
    queryKey: GLOBAL_QUERY_KEYS.tiposDeclaracion,
    queryFn: async () => {
      const result = await apiGateway.get<unknown>(ENDPOINTS.LIST_DECLARATION_TYPES)
      return tiposDeclaracionResponseSchema.parse(result)
    },
    staleTime: STALE_TIMES.GLOBAL_CATALOGS,
  })
}
