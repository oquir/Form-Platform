import type { SelectOption } from '@/types/api.types'

// Select primitivo — RHF-agnóstico, controlado por value/onChange.
// Reusable fuera del bootstrap.

interface SelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export function Select({
  id, label, value, onChange, options,
  placeholder = 'Seleccione...', disabled,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
