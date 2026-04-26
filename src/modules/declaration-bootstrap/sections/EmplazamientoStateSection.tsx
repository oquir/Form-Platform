import { Select } from '../ui/Select'
import type { SelectOption } from '@/types/api.types'

interface EmplazamientoStateSectionProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function EmplazamientoStateSection({
  value, options, onChange,
}: EmplazamientoStateSectionProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-gray-800">
        Estado de declaración
      </legend>
      <Select
        id="bs-emplazamiento-state"
        label="Estado"
        value={value}
        options={options}
        onChange={onChange}
      />
    </fieldset>
  )
}
