import type { CalendarioVencimiento, ReglaVencimiento } from '@/types/config.types'

// Extrae el último dígito significativo del número de documento.
// Ignora guiones, espacios y el dígito de verificación del NIT (separado por '-').
// Para NIT '900123456-1' usa '6' (último dígito del NIT sin DV).
function extractLastDigit(documento: string): string | null {
  const clean = documento.replace(/[-\s]/g, '')
  const last = clean.at(-1)
  return last && /\d/.test(last) ? last : null
}

function applyRegla(
  regla: ReglaVencimiento,
  periodoId: string | null,
  ultimoDigito: string | null,
): string | null {
  switch (regla.type) {
    case 'fixed':
      return regla.date

    case 'byLastDigit': {
      if (ultimoDigito == null) return null
      return regla.digits[ultimoDigito as keyof typeof regla.digits] ?? null
    }

    case 'byPeriod': {
      if (periodoId == null || ultimoDigito == null) return null
      const entrada = regla.periodos.find((p) => p.periodoId === periodoId)
      if (!entrada) return null
      return entrada.digits[ultimoDigito as keyof typeof entrada.digits] ?? null
    }
  }
}

export interface DeadlineInput {
  calendario: CalendarioVencimiento
  // Año gravable seleccionado por el contribuyente (ej. 2025)
  año: number
  // ID del periodo seleccionado — coincide con `periodoId` en `byPeriod`
  // (ej. 'trim1', 'bim1'). Puede ser null si el municipio no usa periodos.
  periodoId: string | null
  // Número de documento completo; se extrae el último dígito internamente.
  documento: string
}

// Devuelve la fecha límite como objeto Date (a las 23:59:59 del día),
// o null si la configuración no cubre el caso dado.
export function resolveDeadline({ calendario, año, periodoId, documento }: DeadlineInput): Date | null {
  const regla = calendario.porAnio?.[año] ?? calendario.default
  if (!regla) return null

  const ultimoDigito = extractLastDigit(documento)
  const isoDate = applyRegla(regla, periodoId, ultimoDigito)
  if (!isoDate) return null

  const d = new Date(`${isoDate}T23:59:59`)
  return isNaN(d.getTime()) ? null : d
}

// Conveniencia: indica si la fecha actual supera la fecha límite.
// Devuelve null cuando no se puede calcular el vencimiento.
export function isLate(input: DeadlineInput): boolean | null {
  const deadline = resolveDeadline(input)
  if (!deadline) return null
  return new Date() > deadline
}
