import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { env } from '@/env'
import { ApiError } from '@/types/api.types'
import type { ApiResponse } from './types'
import { setupInterceptors } from './interceptors'

// Abstracción central de HTTP — ningún módulo usa axios directamente.
// El backend devuelve siempre `ApiResponse<T> = { success, result, message }`.
// El gateway desempaca el envelope una sola vez: los consumers reciben `result`
// y aplican Zod a ese shape interno, sin saber del envelope.

class ApiGateway {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: env.apiBaseUrl,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15_000,
    })

    setupInterceptors(this.client)
  }

  async get<T>(url: string, params?: Record<string, string>): Promise<T> {
    const response = await this.client.get<unknown>(url, { params })
    return this.unwrap<T>(response.data)
  }

  async post<T>(url: string, body: unknown): Promise<T> {
    const response = await this.client.post<unknown>(url, body)
    return this.unwrap<T>(response.data)
  }

  // Validación estructural ligera — sin Zod para no acoplar transporte a una
  // librería de validación. El shape del envelope es contrato global del backend.
  private unwrap<T>(payload: unknown): T {
    if (!isApiEnvelope(payload)) {
      throw new ApiError('INVALID_ENVELOPE', 'Respuesta del servidor con shape inesperado', payload)
    }
    if (!payload.success) {
      throw new ApiError('API_FAILURE', payload.message ?? 'Operación fallida en el servidor', payload)
    }
    return payload.result as T
  }
}

function isApiEnvelope(v: unknown): v is ApiResponse<unknown> {
  return (
    typeof v === 'object' &&
    v !== null &&
    'success' in v &&
    'result' in v &&
    'message' in v
  )
}

export const apiGateway = new ApiGateway()
