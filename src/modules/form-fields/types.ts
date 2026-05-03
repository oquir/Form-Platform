import type { ComponentType } from 'react'
import type { SelectOption } from '@/types/api.types'

// Contrato de cualquier componente de campo. Es el punto de extensión:
// para soportar un FieldType nuevo basta con implementar este contrato
// y registrarlo. El renderer no se entera.
export interface FieldComponentProps {
  id: string
  name: string
  label: string
  value: unknown
  onChange: (next: unknown) => void
  onBlur: () => void
  disabled: boolean
  options?: SelectOption[]
  error?: string
  // Solo lo consume DisplayField; el resto lo ignora.
  displayItems?: Array<{ label: string; value: string }>
  // Solo lo consume NumberField: límite de caracteres durante la escritura.
  maxLength?: number
  // Solo lo consume NumberField: cuando está definido y es >= 0, bloquea `-`.
  min?: number
  // 'thousands' activa el separador de miles en NumberField y CalculatedField.
  displayFormat?: 'thousands'
  // Solo activityTable.
  maxRows?: number
  rowCalculations?: import('@/types/config.types').RowCalculationConfig[]
  // Solo radio. false = oculta el botón "Limpiar selección".
  clearable?: boolean
}

export type FieldComponent = ComponentType<FieldComponentProps>
