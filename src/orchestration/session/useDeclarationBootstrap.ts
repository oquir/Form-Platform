import { useCallback, useMemo } from 'react'
import {
  usePeriodosAnualesQuery,
  useTiposDeclaracionQuery,
} from '@/infrastructure/queries/global.queries'
import { useDeclarationSessionStore } from './declaration-session.store'
import {
  EMPLAZAMIENTO_STATES,
  generateAvailableYears,
  type EmplazamientoState,
} from '@/types/session.types'
import type { SelectOption } from '@/types/api.types'

// View-model del bootstrap. Hace dos cosas:
// 1. Mapea catálogos (años derivados + bimestres del API + tipos del API)
//    a SelectOption[] para que la UI sea trivial.
// 2. Acepta un draft (todo strings, formato de <select>) y resuelve
//    los labels mirando los catálogos antes de persistir la sesión.

export interface BootstrapDraft {
  year: string
  bimesterId: string
  declarationTypeId: string
  emplazamientoState: EmplazamientoState | ''
}

export interface BootstrapView {
  isLoading: boolean
  error: Error | null
  years: SelectOption[]
  bimesters: SelectOption[]
  declarationTypes: SelectOption[]
  emplazamientoStates: SelectOption[]
  commit: (draft: BootstrapDraft) => void
}

const EMPLAZAMIENTO_LABELS: Record<EmplazamientoState, string> = {
  ANTES:   'Antes de emplazamiento',
  DESPUES: 'Después de emplazamiento',
}

const EMPLAZAMIENTO_OPTIONS: SelectOption[] = EMPLAZAMIENTO_STATES.map((v) => ({
  value: v,
  label: EMPLAZAMIENTO_LABELS[v],
}))

// Años se generan una sola vez al montar el hook — no dependen del API.
const YEAR_OPTIONS: SelectOption[] = generateAvailableYears().map((y) => ({
  value: y,
  label: y,
}))

export function useDeclarationBootstrap(): BootstrapView {
  const bimestersQ    = usePeriodosAnualesQuery()
  const typesQ        = useTiposDeclaracionQuery()
  const persistCommit = useDeclarationSessionStore((s) => s.commit)

  const bimesters = useMemo<SelectOption[]>(() => {
    if (!bimestersQ.data) return []
    return bimestersQ.data.map((b) => ({
      value: String(b.idPeriodoAnual),
      label: b.periodoAnual,
    }))
  }, [bimestersQ.data])

  const declarationTypes = useMemo<SelectOption[]>(() => {
    if (!typesQ.data) return []
    return typesQ.data.map((t) => ({
      value: String(t.idTipoDeclaracion),
      label: t.tipoDeclaracion,
    }))
  }, [typesQ.data])

  const commit = useCallback(
    (draft: BootstrapDraft) => {
      const bimestersData = bimestersQ.data
      const tiposData     = typesQ.data
      if (!bimestersData || !tiposData) return

      const bimester = bimestersData.find(
        (b) => String(b.idPeriodoAnual) === draft.bimesterId
      )
      const type = tiposData.find(
        (t) => String(t.idTipoDeclaracion) === draft.declarationTypeId
      )
      if (!bimester || !type) return
      if (draft.year === '' || draft.emplazamientoState === '') return

      persistCommit({
        year: draft.year,
        bimesterId: bimester.idPeriodoAnual,
        bimesterLabel: bimester.periodoAnual,
        declarationTypeId: type.idTipoDeclaracion,
        declarationTypeLabel: type.tipoDeclaracion,
        emplazamientoState: draft.emplazamientoState,
      })
    },
    [bimestersQ.data, typesQ.data, persistCommit]
  )

  return {
    isLoading: bimestersQ.isPending || typesQ.isPending,
    error: (bimestersQ.error ?? typesQ.error) as Error | null,
    years: YEAR_OPTIONS,
    bimesters,
    declarationTypes,
    emplazamientoStates: EMPLAZAMIENTO_OPTIONS,
    commit,
  }
}
