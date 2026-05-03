import type { FieldComponent } from './types'

function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

export const CalculatedField: FieldComponent = ({ id, label, value, displayFormat }) => {
  const display = value == null
    ? '—'
    : displayFormat === 'thousands' && typeof value === 'number'
      ? formatCOP(value)
      : String(value)

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <output id={id} className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
        {display}
      </output>
    </div>
  )
}
