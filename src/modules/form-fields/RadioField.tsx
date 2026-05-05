import type { FieldComponent } from './types'

export const RadioField: FieldComponent = ({
  id, name, label, value, onChange, onBlur, disabled, options, error, clearable = true,
}) => {
  const current = typeof value === 'string' ? value : ''

  return (
    <div className="flex flex-row justify-between items-center gap-1.5">
      <span id={`${id}-label`} className="text-sm font-medium text-gray-700">{label}</span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-center overflow-x-auto max-w-full"
      >
        {(options ?? []).map((opt) => {
          const isSelected = current === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => { onChange(opt.value); onBlur?.() }}
              className={[
                'px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap disabled:cursor-not-allowed',
                isSelected
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
        {clearable && current !== '' && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
          >
            ✕
          </button>
        )}
      </div>
      {/* Campo oculto para mantener el name del form accesible */}
      <input type="hidden" name={name} value={current} />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
