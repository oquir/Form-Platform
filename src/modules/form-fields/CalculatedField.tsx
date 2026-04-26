import type { FieldComponent } from './types'

// Stub Fase 2 — el cálculo lo provee el RuleEngine en Fase 3.
// Por ahora es un display read-only del valor que llegue por props.
export const CalculatedField: FieldComponent = ({ id, label, value }) => {
  const display = value == null ? '—' : String(value)

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <output id={id} className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
        {display}
      </output>
    </div>
  )
}
