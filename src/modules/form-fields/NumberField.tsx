import type { FieldComponent } from './types'

export const NumberField: FieldComponent = ({
  id, name, label, value, onChange, onBlur, disabled, error,
}) => {
  const display = typeof value === 'number' ? String(value) : ''

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        name={name}
        type="number"
        value={display}
        onChange={(e) => {
          const raw = e.target.value
          onChange(raw === '' ? null : Number(raw))
        }}
        onBlur={onBlur}
        disabled={disabled}
        className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
