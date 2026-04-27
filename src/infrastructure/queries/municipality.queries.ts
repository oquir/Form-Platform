import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { apiGateway } from '@/infrastructure/api/ApiGateway'
import { ENDPOINTS } from '@/infrastructure/api/endpoints'
import type { Municipio } from '@/infrastructure/api/types'
import { STALE_TIMES } from '@/lib/query-client'
import { municipioSchema } from '@/infrastructure/schemas/api-responses.schemas'

// Datos dependientes del municipio activo. La cache se segmenta por id
// gracias al query key — cambiar de municipio no contamina el anterior.
export const MUNICIPALITY_QUERY_KEYS = {
  consultarMunicipio: (id: string) => ['municipality', 'consultarMunicipio', id] as const,
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
