import { useState } from 'react'
import { MonetaryInput } from './MonetaryInput'
import type { FieldComponent } from './types'

const BLOCKED_KEYS = new Set(['e', 'E', '+'])

function isValidPartial(s: string): boolean {
  if (s === '' || s === '-') return true
  return /^-?\d+$/.test(s)
}

export const NumberField: FieldComponent = ({
  id, name, label, value, onChange, onBlur, disabled, error, maxLength, min, displayFormat,
}) => {
  const [rawInput, setRawInput] = useState('')
  const blockMinus = min !== undefined && min >= 0

  if (displayFormat === 'thousands') {
    const numericValue = typeof value === 'number' ? value : 0
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
        <MonetaryInput
          id={id}
          name={name}
          value={numericValue}
          onChange={(n) => onChange(n)}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  // Campos numéricos sin formato de miles (ej. numeroEstablecimientos)
  const display = typeof value === 'number' ? String(value) : (rawInput)

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const raw = e.target.value
          if (!isValidPartial(raw)) return
          if (maxLength !== undefined && raw.replace('-', '').length > maxLength) return
          setRawInput(raw)
          if (raw === '' || raw === '-') { onChange(null); return }
          onChange(Number(raw))
        }}
        onKeyDown={(e) => {
          if (BLOCKED_KEYS.has(e.key)) e.preventDefault()
          if (blockMinus && e.key === '-') e.preventDefault()
        }}
        onBlur={onBlur}
        disabled={disabled}
        className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
