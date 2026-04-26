import type { MunicipalityConfig } from '@/types/config.types'
import type { RuleEvalResult } from '@/types/engine.types'
import type { FormValidationResult } from '@/types/form.types'
import type { EvalContext } from '@/engines/rule-engine'
import { validateStep } from './validateStep'

// Valida todos los pasos visibles y consolida errores.
// El submit final lo invoca antes de mappear el payload.
export function validateForm(
  config: MunicipalityConfig,
  rules: RuleEvalResult,
  ctx: EvalContext
): FormValidationResult {
  const errors = new Map<string, string>()

  for (const step of config.steps) {
    const isStepVisible = rules.stepVisibility.get(step.id) ?? (step.visibleWhen == null)
    if (!isStepVisible) continue

    const result = validateStep(step, rules, ctx)
    for (const [k, v] of result.errors) errors.set(k, v)
  }

  return { isValid: errors.size === 0, errors }
}
