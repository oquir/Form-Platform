import { useMemo } from 'react'
import type {
  DeclarationSession,
  EmplazamientoState,
} from '@/types/session.types'

// Bridge sesión → ruleContext.
//
// CONTRATO público que los configs de municipio referencian como `context.<key>`.
// Expone IDs (matching estricto contra catálogos) y labels (reglas declarativas
// escritas con texto humano).

export type SessionRuleContext = {
  year: string
  bimesterId: number
  bimester: string
  declarationTypeId: number
  declarationType: string
  emplazamientoState: EmplazamientoState
}

export function useSessionRuleContext(
  session: DeclarationSession
): SessionRuleContext {
  return useMemo<SessionRuleContext>(
    () => ({
      year: session.year,
      bimesterId: session.bimesterId,
      bimester: session.bimesterLabel,
      declarationTypeId: session.declarationTypeId,
      declarationType: session.declarationTypeLabel,
      emplazamientoState: session.emplazamientoState,
    }),
    [session]
  )
}
