import type { FieldComponent } from './types'

// Radio group genérico. Las opciones provienen del FormEngine (catálogo) ya
// resueltas; el componente no conoce el origen ni hace lógica de dominio.
// Para campos opcionales ofrece un botón "Limpiar" que devuelve `null` al
// store (no es posible deseleccionar un radio de forma nativa).
export const RadioField: FieldComponent = ({
  id, name, label, value, onChange, onBlur, disabled, options, error, clearable = true,
}) => {
  const current = typeof value === 'string' ? value : ''

  return (
    <div className="flex flex-col gap-1">
      <span id={`${id}-label`} className="text-sm font-medium text-gray-700">{label}</span>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-col gap-1">
        {(options ?? []).map((opt) => {
          const optionId = `${id}-${opt.value}`
          return (
            <label key={opt.value} htmlFor={optionId} className="flex items-center gap-2 text-sm">
              <input
                id={optionId}
                type="radio"
                name={name}
                value={opt.value}
                checked={current === opt.value}
                onChange={() => onChange(opt.value)}
                onBlur={onBlur}
                disabled={disabled}
              />
              <span>{opt.label}</span>
            </label>
          )
        })}
        {clearable && current !== '' && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="self-start text-xs text-gray-500 underline hover:text-gray-700"
          >
            Limpiar selección
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
