import type { MunicipalityConfig } from '@/types/config.types'
import type { ResolvedFormSchema, RuleEvalResult } from '@/types/engine.types'
import type { HydratedData } from '@/types/form.types'
import { resolveStep } from './resolveStep'

export function resolveSchema(
  config: MunicipalityConfig,
  rules: RuleEvalResult,
  hydrated: HydratedData
): ResolvedFormSchema {
  const steps = [...config.steps]
    .sort((a, b) => a.order - b.order)
    .map((s) => resolveStep(s, rules, hydrated))

  return { steps }
}
