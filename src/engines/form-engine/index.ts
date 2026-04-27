// Form Engine — funciones puras que transforman MunicipalityConfig
// en ResolvedFormSchema listo para renderizar. Sin React, sin RHF, sin fetch.

export { resolveStep } from './resolveStep'
export { resolveSchema } from './resolveSchema'
export { emptyRuleResult } from './empty-rule-result'
export { resolveBindings, getByPath } from './resolveBindings'
