import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAppStore, selectMunicipalityId } from '@/store/app.store'
import { FormRenderer } from '@/modules/form-engine-ui'
import { sampleConfig, sampleHydratedData } from '@/dev/sample.config'
import {
  DeclarationBootstrapModal,
  ResetSessionButton,
} from '@/modules/declaration-bootstrap'
import {
  useDeclarationSessionStore,
  selectSession,
  selectIsSessionReady,
  useSessionRuleContext,
} from '@/orchestration/session'
import type { DeclarationSession } from '@/types/session.types'

const MUNICIPALITY_ID_REGEX = /^\d{5}$/

export function FormPage() {
  const { municipalityId } = useParams<{ municipalityId: string }>()
  const setMunicipalityId  = useAppStore((s) => s.setMunicipalityId)
  const setAppReady        = useAppStore((s) => s.setAppReady)
  const activeMunicipality = useAppStore(selectMunicipalityId)
  const isSessionReady     = useDeclarationSessionStore(selectIsSessionReady)
  const session            = useDeclarationSessionStore(selectSession)

  const isValidId = municipalityId != null && MUNICIPALITY_ID_REGEX.test(municipalityId)

  useEffect(() => {
    if (!isValidId || !municipalityId) return
    setMunicipalityId(municipalityId)
    setAppReady(true)
  }, [municipalityId, isValidId, setMunicipalityId, setAppReady])

  if (!isValidId) {
    return <Navigate to="/not-found" replace />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{sampleConfig.municipalityName}</h1>
            <p className="text-xs text-gray-500">Municipio activo: {activeMunicipality}</p>
          </div>
          {isSessionReady && session && (
            <SessionSummary session={session} />
          )}
        </header>

        {isSessionReady && session && (
          <SessionAwareFormRenderer session={session} />
        )}
      </div>

      <DeclarationBootstrapModal isOpen={!isSessionReady} />
    </main>
  )
}

// Resumen compacto + reset. Vive aquí porque es UX de página, no del módulo bootstrap.
function SessionSummary({ session }: { session: DeclarationSession }) {
  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <p className="text-xs text-gray-600">
        {session.year} · {session.bimesterLabel} · {session.declarationTypeLabel}
      </p>
      <ResetSessionButton />
    </div>
  )
}

// Aísla la derivación session → ruleContext. FormPage no se ensucia con
// el shape del rule-engine; cualquier futuro consumer del FormRenderer
// con sesión activa puede reusar este patrón.
function SessionAwareFormRenderer({ session }: { session: DeclarationSession }) {
  const ruleContext = useSessionRuleContext(session)
  return (
    <FormRenderer
      config={sampleConfig}
      hydrated={sampleHydratedData}
      ruleContext={ruleContext}
    />
  )
}
