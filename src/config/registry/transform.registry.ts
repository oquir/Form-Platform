import type { HydratedData } from '@/types/form.types'

// Funciones de transformación para el PayloadMapper
// Nombradas, testeables y tipadas — alternativa a lógica anónima en el mapper

type TransformFn = (value: unknown, externalData: HydratedData) => unknown

export const transformRegistry: Record<string, TransformFn> = {
  // Se agregan transforms en Phase 3 al implementar PayloadMapper
  // mapActividades: (rows, _data) => { ... }
}
