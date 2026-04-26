import type { FieldComponent } from './types'

export const HiddenField: FieldComponent = ({ id, name, value }) => {
  const display = value == null ? '' : String(value)
  return <input id={id} name={name} type="hidden" value={display} readOnly />
}
