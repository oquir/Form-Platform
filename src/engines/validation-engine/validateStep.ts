import type { StepConfig } from '@/types/config.types'
import type { RuleEvalResult } from '@/types/engine.types'
import type { StepValidationResult } from '@/types/form.types'
import type { EvalContext } from '@/engines/rule-engine'
import { validateField } from './validateField'

// Solo valida los campos visibles del step según el RuleEvalResult.
// Evita bloquear el avance por errores en campos ocultos por reglas.
export function validateStep(
  step: StepConfig,
  rules: RuleEvalResult,
  ctx: EvalContext
): StepValidationResult {
  const errors = new Map<string, string>()

  for (const field of step.fields) {
    const isVisible = rules.visibility.get(field.id) ?? (field.visibleWhen == null)
    if (!isVisible) continue

    const error = validateField(field, ctx.values[field.id], ctx)
    if (error) errors.set(field.id, error)
  }

  return { isValid: errors.size === 0, errors }
}
