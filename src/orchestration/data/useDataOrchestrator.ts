import { useMemo } from 'react'
import {
  useCiudadesQuery,
  useDepartamentosQuery,
  usePeriodosAnualesQuery,
  useTiposDeclaracionQuery,
  useTiposDocumentoQuery,
  useTiposPersonaQuery,
} from '@/infrastructure/queries/global.queries'
import {
  useActividadesEconomicasQuery,
  useClasificacionMunicipioQuery,
  useConsultarMunicipioQuery,
} from '@/infrastructure/queries/municipality.queries'
import type { GlobalCatalogs, HydratedData } from '@/types/form.types'
import type { SelectOption } from '@/types/api.types'

// Data Orchestrator — única vía por la que el FormRenderer recibe HydratedData.
//
// Compone:
//   - Datos del municipio activo: /ConsultarMunicipio/{id}
//   - Catálogos globales requeridos por el form: tiposDocumento, periodos,
//     tiposDeclaración, departamentos, ciudades. React Query dedupea: si el
//     modal ya los pidió, salen de cache sin tráfico extra.
//
// Política de catálogos: solo se pueblan los que el FormEngine necesita
// referenciar vía `source: { catalog: '...' }`. El resto queda como []
// y se llena cuando aparezca un step que lo requiera.

export interface DataOrchestratorResult {
  isLoading: boolean
  error: Error | null
  data: HydratedData | null
}

export function useDataOrchestrator(municipalityId: string): DataOrchestratorResult {
  const municipioQ        = useConsultarMunicipioQuery(municipalityId)
  const periodosQ         = usePeriodosAnualesQuery()
  const tiposDeclaracionQ = useTiposDeclaracionQuery()
  const tiposDocumentoQ   = useTiposDocumentoQuery()
  const departamentosQ    = useDepartamentosQuery()
  const ciudadesQ         = useCiudadesQuery()
  const tiposPersonaQ     = useTiposPersonaQuery()
  const clasificacionQ    = useClasificacionMunicipioQuery(municipalityId)
  const actividadesQ      = useActividadesEconomicasQuery(municipalityId)

  const data = useMemo<HydratedData | null>(() => {
    if (!municipioQ.data) return null

    // Mapeos DTO → SelectOption con value como string del id.
    // El rule-engine compara con `===` estricto: las literales en config
    // deben ser strings ('2', no 2).
    const annualPeriods: SelectOption[] = (periodosQ.data ?? []).map((p) => ({
      value: String(p.idPeriodoAnual),
      label: p.periodoAnual,
    }))
    const declarationTypes: SelectOption[] = (tiposDeclaracionQ.data ?? []).map((t) => ({
      value: String(t.idTipoDeclaracion),
      label: t.tipoDeclaracion,
    }))
    const documentTypes: SelectOption[] = (tiposDocumentoQ.data ?? []).map((d) => ({
      value: String(d.idTipoDocumento),
      label: d.tipoDocumento,
    }))
    const departments: SelectOption[] = (departamentosQ.data ?? []).map((d) => ({
      value: String(d.idDepartamento),
      label: d.departamento,
    }))
    // `parentValue` habilita la cascada declarativa departamento → ciudad
    // (ver `resolveOptions` + `CatalogRef.filterBy`).
    const cities: SelectOption[] = (ciudadesQ.data ?? []).map((c) => ({
      value: String(c.idCiudad),
      label: c.ciudad,
      parentValue: String(c.idDepartamento),
    }))
    const personTypes: SelectOption[] = (tiposPersonaQ.data ?? []).map((p) => ({
      value: String(p.idTipoPersona),
      label: p.tipoPersona,
    }))
    // El backend permite `clasificacionMunicipio` nulo; en ese caso la opción
    // queda invisible para el usuario (se filtra) en lugar de mostrar "null".
    const municipalityClassifications: SelectOption[] = (clasificacionQ.data ?? [])
      .filter((c) => c.tipoClasificacion != null)
      .map((c) => ({
        value: String(c.idClasificacionMunicipio),
        label: c.tipoClasificacion as string,
      }))

    const catalogs: GlobalCatalogs = {
      annualPeriods,
      personTypes,
      sanctionTypes: [],
      declarationTypes,
      departments,
      cities,
      documentTypes,
      municipalityClassifications,
      yesNo: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
      tiposSancionICA: [
        { value: 'extratemporaneidad', label: 'Extratemporaneidad' },
        { value: 'correccion', label: 'Corrección' },
        { value: 'inexactitud', label: 'Inexactitud' },
        { value: 'otra', label: 'Otra' },
      ],
      tiposFirmante: [
        { value: 'contador', label: 'Contador' },
        { value: 'revisorFiscal', label: 'Revisor Fiscal' },
      ],
    }

    // Tarifa simulada determinista mientras el backend no la exponga.
    // Usa un conjunto de tarifas ICA reales colombianas (pesos por mil).
    const TARIFAS_SIMULADAS = [2, 3, 4.14, 5, 6.9, 7, 8, 9.66, 10, 11.04]
    const economicActivities = (actividadesQ.data ?? []).map((a) => ({
      idActividad: a.idActividad,
      codigoCIIU:  a.codigoCIIU,
      descripcion: a.descripcion,
      tarifaXMil:  TARIFAS_SIMULADAS[a.idActividad % TARIFAS_SIMULADAS.length],
    }))

    return {
      catalogs,
      municipality: {
        municipalityId,
        municipalityName: municipioQ.data.municipio,
        departmentName: municipioQ.data.departamento,
        siteColor: municipioQ.data.colorSitio,
        tieneRIT: municipioQ.data.tieneRIT,
        tarifaSobretasa: municipioQ.data.tarifaSobretasa,
        economicActivities,
      },
      contributor: null,
      previousDeclaration: null,
    }
  }, [
    municipioQ.data,
    periodosQ.data,
    tiposDeclaracionQ.data,
    tiposDocumentoQ.data,
    departamentosQ.data,
    ciudadesQ.data,
    tiposPersonaQ.data,
    clasificacionQ.data,
    actividadesQ.data,
    municipalityId,
  ])

  // El municipio es bloqueante (sin él no hay form); los catálogos
  // adicionales no — degradan a select vacío si fallan.
  return {
    isLoading: municipioQ.isPending,
    error: (municipioQ.error as Error | null) ?? null,
    data,
  }
}
