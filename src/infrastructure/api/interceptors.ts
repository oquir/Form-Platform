import type { AxiosInstance } from 'axios'
import { isAxiosError } from 'axios'
import { ApiError } from '@/types/api.types'

export function setupInterceptors(client: AxiosInstance): void {
  // Request: punto de extensión para auth token cuando se integre la capa de auth
  client.interceptors.request.use((config) => {
    return config
  })

  // Response: normaliza todos los errores HTTP a ApiError para que los consumers
  // nunca traten con AxiosError directamente
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data as
          | { code?: string; message?: string }
          | undefined

        throw new ApiError(
          data?.code ?? 'UNKNOWN_ERROR',
          data?.message ?? error.message,
          error.response?.data,
          status
        )
      }
      throw error
    }
  )
}
