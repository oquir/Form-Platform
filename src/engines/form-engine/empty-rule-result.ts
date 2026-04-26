import type { RuleEvalResult } from '@/types/engine.types'

// Stub neutro: permite construir Fase 2 sin Rule Engine.
// Cuando exista (Fase 3), el Coordinator inyectará el resultado real.
export function emptyRuleResult(): RuleEvalResult {
  return {
    visibility: new Map(),
    computed: new Map(),
    stepVisibility: new Map(),
  }
}
