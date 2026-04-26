import { z } from 'zod'

// Único uso autorizado de Zod en el proyecto: validar respuestas externas.
// Estos schemas validan el SHAPE INTERNO (`result` ya desempacado por el gateway).
// El envelope `ApiResponse<T>` lo valida ApiGateway estructuralmente.

export const periodoAnualSchema = z.object({
  idPeriodoAnual: z.number(),
  periodoAnual: z.string(),
})

export const tipoDeclaracionSchema = z.object({
  idTipoDeclaracion: z.number(),
  tipoDeclaracion: z.string(),
})

export const periodosAnualesResponseSchema = z.array(periodoAnualSchema)
export const tiposDeclaracionResponseSchema = z.array(tipoDeclaracionSchema)
