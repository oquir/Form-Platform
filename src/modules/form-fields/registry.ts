import type { FieldType } from '@/types/config.types'
import type { FieldComponent } from './types'
import { TextField } from './TextField'
import { NumberField } from './NumberField'
import { SelectField } from './SelectField'
import { RadioField } from './RadioField'
import { DateField } from './DateField'
import { HiddenField } from './HiddenField'
import { CalculatedField } from './CalculatedField'
import { ActivityTable } from './ActivityTable'
import { DisplayField } from './DisplayField'

// Registry de tipos de campo. Open/Closed: agregar un FieldType nuevo
// implica añadir aquí una entrada y el renderer no se modifica.
const registry: Record<FieldType, FieldComponent> = {
  text: TextField,
  number: NumberField,
  select: SelectField,
  radio: RadioField,
  date: DateField,
  hidden: HiddenField,
  calculated: CalculatedField,
  activityTable: ActivityTable,
  display: DisplayField,
}

export function getFieldComponent(type: FieldType): FieldComponent {
  return registry[type]
}

export function registerFieldComponent(type: FieldType, component: FieldComponent): void {
  registry[type] = component
}
