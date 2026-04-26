import type { ValidationRule } from '@/types/config.types'
import type { EvalContext } from '@/engines/rule-engine'

// Cada validador es puro. Devuelve el mensaje de error si falla, o null
// si la regla pasa. La firma es uniforme para que el registry funcione.
export type ValidatorFn = (
  value: unknown,
  rule: ValidationRule,
  ctx: EvalContext
) => string | null
