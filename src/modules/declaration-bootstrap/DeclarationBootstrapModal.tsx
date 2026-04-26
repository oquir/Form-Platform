import { useState } from 'react'
import { Modal } from './ui/Modal'
import { PeriodSection } from './sections/PeriodSection'
import { DeclarationTypeSection } from './sections/DeclarationTypeSection'
import { EmplazamientoStateSection } from './sections/EmplazamientoStateSection'
import { useDeclarationBootstrap } from '@/orchestration/session'
import type { BootstrapDraft } from '@/orchestration/session/useDeclarationBootstrap'
import {
  EMPLAZAMIENTO_STATES,
  type EmplazamientoState,
} from '@/types/session.types'

// Coordinator del modal:
// - delega data + commit a useDeclarationBootstrap (orchestration)
// - mantiene draft local (no leaks al store hasta confirmar)
// - habilita "Continuar" solo cuando el draft está completo
// No conoce DTOs, ni React Query, ni Zustand.

interface DeclarationBootstrapModalProps {
  isOpen: boolean
}

const EMPTY_DRAFT: BootstrapDraft = {
  year: '',
  bimesterId: '',
  declarationTypeId: '',
  emplazamientoState: '',
}

function isEmplazamientoState(v: string): v is EmplazamientoState {
  return (EMPLAZAMIENTO_STATES as readonly string[]).includes(v)
}

export function DeclarationBootstrapModal({ isOpen }: DeclarationBootstrapModalProps) {
  const view = useDeclarationBootstrap()
  const [draft, setDraft] = useState<BootstrapDraft>(EMPTY_DRAFT)

  const isComplete =
    draft.year !== '' &&
    draft.bimesterId !== '' &&
    draft.declarationTypeId !== '' &&
    isEmplazamientoState(draft.emplazamientoState)

  const handleSubmit = () => {
    if (!isComplete) return
    view.commit(draft)
  }

  return (
    <Modal isOpen={isOpen} title="Iniciar declaración">
      {view.isLoading && (
        <p className="text-sm text-gray-500">Cargando catálogos...</p>
      )}

      {view.error && (
        <p className="text-sm text-red-600">
          No se pudieron cargar los catálogos. Intente nuevamente.
        </p>
      )}

      {!view.isLoading && !view.error && (
        <div className="flex flex-col gap-5">
          <PeriodSection
            year={draft.year}
            bimesterId={draft.bimesterId}
            years={view.years}
            bimesters={view.bimesters}
            onYearChange={(year) =>
              setDraft((d) => ({ ...d, year, bimesterId: '' }))
            }
            onBimesterChange={(bimesterId) =>
              setDraft((d) => ({ ...d, bimesterId }))
            }
          />
          <DeclarationTypeSection
            value={draft.declarationTypeId}
            options={view.declarationTypes}
            onChange={(declarationTypeId) =>
              setDraft((d) => ({ ...d, declarationTypeId }))
            }
          />
          <EmplazamientoStateSection
            value={draft.emplazamientoState}
            options={view.emplazamientoStates}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                emplazamientoState: isEmplazamientoState(v) ? v : '',
              }))
            }
          />
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!isComplete}
              onClick={handleSubmit}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
