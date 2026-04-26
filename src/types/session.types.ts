// Contrato de sesión de declaración — output del bootstrap.
// Alimenta `ruleContext` del FormRenderer (ver useSessionRuleContext).

export const EMPLAZAMIENTO_STATES = ['ANTES', 'DESPUES'] as const
export type EmplazamientoState = (typeof EMPLAZAMIENTO_STATES)[number]

// Regla de dominio (DOMAIN.md): año gravable hasta N años hacia atrás.
// Centralizado aquí para que cambiar la ventana sea un solo punto de edición.
// El año actual SÍ está incluido → window length = LOOKBACK + 1.
export const YEARS_LOOKBACK = 10

export function generateAvailableYears(
  currentYear: number = new Date().getFullYear()
): string[] {
  return Array.from({ length: YEARS_LOOKBACK + 1 }, (_, i) =>
    String(currentYear - i)
  )
}

// La sesión guarda IDs (lo que el backend espera al submit) y labels
// (lo que UI/reglas consumen). El año NO tiene ID en el API: es una
// cadena ('2025') generada client-side por la regla de los 10 años.
export interface DeclarationSession {
  year: string
  bimesterId: number
  bimesterLabel: string
  declarationTypeId: number
  declarationTypeLabel: string
  emplazamientoState: EmplazamientoState
}
