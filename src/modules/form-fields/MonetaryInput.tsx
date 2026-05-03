import { useState } from 'react'

const BLOCKED_KEYS = new Set(['e', 'E', '+', '.', ',', '-'])

function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function isValidPartial(s: string): boolean {
  if (s === '') return true
  return /^\d+$/.test(s)
}

interface MonetaryInputProps {
  id?: string
  name?: string
  value: number
  onChange: (n: number) => void
  onBlur?: () => void
  disabled?: boolean
  maxLength?: number
  className?: string
}

// Input numérico monetario reutilizable:
// - Muestra valor formateado con separadores de miles (es-CO) en reposo.
// - Al hacer foco muestra el número crudo para edición.
// - Redondea al múltiplo de 1000 más cercano en blur.
// - Bloquea e, E, +, ., ,, - (solo enteros no negativos).
export function MonetaryInput({
  id, name, value, onChange, onBlur, disabled, maxLength, className = '',
}: MonetaryInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [rawInput, setRawInput] = useState('')

  const handleFocus = () => {
    setRawInput(value !== 0 ? String(value) : '0')
    setIsFocused(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (!isValidPartial(raw)) return
    if (maxLength !== undefined && raw.length > maxLength) return
    setRawInput(raw)
    onChange(raw === '' ? 0 : Number(raw))
  }

  const handleBlur = () => {
    const n = rawInput === '' ? 0 : Number(rawInput)
    const rounded = Math.round(n / 1000) * 1000
    setIsFocused(false)
    if (rounded !== value) onChange(rounded)
    onBlur?.()
  }

  const displayValue = isFocused ? rawInput : formatCOP(value)

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={(e) => { if (BLOCKED_KEYS.has(e.key)) e.preventDefault() }}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
    />
  )
}
