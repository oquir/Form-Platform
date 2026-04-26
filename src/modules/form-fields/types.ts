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
}

export type FieldComponent = ComponentType<FieldComponentProps>
