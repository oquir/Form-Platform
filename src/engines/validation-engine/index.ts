// Validation Engine — propio, sin Zod (ARCHITECTURE_GOALS).
// Reglas declaradas en config; validadores registrados en código.

export { validateField } from './validateField'
export { validateStep } from './validateStep'
export { validateForm } from './validateForm'
export { registerValidator } from './validators-registry'
export {
  registerCustomValidator,
  registerCustomCondition,
} from './validators/custom'
export type { ValidatorFn } from './types'
