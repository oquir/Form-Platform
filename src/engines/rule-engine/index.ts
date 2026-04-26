// Rule Engine — puro y determinista.
// Input:  MunicipalityConfig + FormValues + HydratedData (+ context opcional)
// Output: RuleEvalResult { visibility, computed, stepVisibility }
//
// Sin React, sin async, sin side effects.

export { evaluateRules } from './evaluateRules'
export { evaluateCondition } from './condition-evaluator'
export { evaluateFormula } from './formula-evaluator'
export { resolveOperand, resolveValueRef } from './operand-resolver'
export type { EvalContext } from './operand-resolver'
export { registerTransform, applyTransforms } from './transform-runner'
