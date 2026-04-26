import type { ValidationType } from '@/types/config.types'
import type { ValidatorFn } from './types'
import {
  requiredValidator, minValidator, maxValidator,
  minLengthValidator, maxLengthValidator, patternValidator,
} from './validators/primitive'
import { arrayMinValidator, arrayMaxValidator } from './validators/array'
import { dateAfterValidator, dateBeforeValidator } from './validators/date'
import { crossFieldValidator } from './validators/cross-field'
import { customValidator } from './validators/custom'

const registry: Record<ValidationType, ValidatorFn> = {
  required: requiredValidator,
  min: minValidator,
  max: maxValidator,
  minLength: minLengthValidator,
  maxLength: maxLengthValidator,
  pattern: patternValidator,
  arrayMin: arrayMinValidator,
  arrayMax: arrayMaxValidator,
  dateAfter: dateAfterValidator,
  dateBefore: dateBeforeValidator,
  crossField: crossFieldValidator,
  custom: customValidator,
}

export function getValidator(type: ValidationType): ValidatorFn | null {
  return registry[type] ?? null
}

export function registerValidator(type: ValidationType, fn: ValidatorFn): void {
  registry[type] = fn
}
