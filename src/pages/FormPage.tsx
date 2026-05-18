import { useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { useAppStore, selectMunicipalityId } from '@/store/app.store'
import { FormRenderer } from '@/modules/form-engine-ui'
import { sampleConfig } from '@/dev/sample.config'
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
import { useDataOrchestrator } from '@/orchestration/data'
import type { DeclarationSession } from '@/types/session.types'
import type { HydratedData } from '@/types/form.types'

// Código del municipio: numérico, longitud razonable (NIT-style 9-10 dígitos
// o variantes). El backend valida el código real; aquí solo descartamos
// basura para no gastar un request y mandar a /not-found rápidamente.
const MUNICIPALITY_ID_REGEX = /^\d{6,15}$/

export function FormPage() {
  const [searchParams] = useSearchParams()
  const municipalityId = searchParams.get('c')

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

  if (!isValidId || !municipalityId) {
    return <Navigate to="/not-found" replace />
  }

  // Orchestrator se dispara desde el mount: corre en paralelo con el modal
  // de bootstrap (los catálogos del modal son independientes), de forma
  // que cuando el usuario confirma la sesión los datos del municipio ya
  // suelen estar cacheados.
  return <FormPageInner municipalityId={municipalityId} activeMunicipality={activeMunicipality} isSessionReady={isSessionReady} session={session} />
}

interface FormPageInnerProps {
  municipalityId: string
  activeMunicipality: string | null
  isSessionReady: boolean
  session: DeclarationSession | null
}

function FormPageInner({
  municipalityId, activeMunicipality, isSessionReady, session,
}: FormPageInnerProps) {
  const { isLoading, error, data } = useDataOrchestrator(municipalityId)

  const headerTitle = data?.municipality?.municipalityName ?? sampleConfig.municipalityName

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{headerTitle}</h1>
            <p className="text-xs text-gray-500">Código de municipio: {activeMunicipality}</p>
          </div>
          {isSessionReady && session && <SessionSummary session={session} />}
        </header>

        {isSessionReady && session && (
          <FormBody session={session} isLoading={isLoading} error={error} data={data} />
        )}
      </div>

      <DeclarationBootstrapModal isOpen={!isSessionReady} />
    </main>
  )
}

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

// Decisión de qué pintar según el estado del orchestrator. Evita
// acoplar SessionAwareFormRenderer al ciclo de fetching.
function FormBody({
  session, isLoading, error, data,
}: {
  session: DeclarationSession
  isLoading: boolean
  error: Error | null
  data: HydratedData | null
}) {
  if (isLoading) {
    return <p className="text-sm text-gray-500">Cargando datos del municipio...</p>
  }
  if (error || !data) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-red-600">No se pudieron cargar los datos del municipio.</p>
        {error && (
          <pre className="text-xs text-red-400 whitespace-pre-wrap break-all">
            {error.message}
          </pre>
        )}
      </div>
    )
  }
  return <SessionAwareFormRenderer session={session} hydrated={data} />
}

function SessionAwareFormRenderer({
  session, hydrated,
}: {
  session: DeclarationSession
  hydrated: HydratedData
}) {
  const ruleContext = useSessionRuleContext(session)
  return (
    <FormRenderer
      config={sampleConfig}
      hydrated={hydrated}
      ruleContext={ruleContext}
    />
  )
}
