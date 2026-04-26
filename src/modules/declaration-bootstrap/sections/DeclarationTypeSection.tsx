import { Select } from '../ui/Select'
import type { SelectOption } from '@/types/api.types'

interface DeclarationTypeSectionProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function DeclarationTypeSection({
  value, options, onChange,
}: DeclarationTypeSectionProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-gray-800">
        Tipo de declaración
      </legend>
      <Select
        id="bs-declaration-type"
        label="Tipo"
        value={value}
        options={options}
        onChange={onChange}
      />
    </fieldset>
  )
}
