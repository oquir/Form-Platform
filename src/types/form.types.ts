import type { SelectOption } from './api.types'

// ─── Runtime form values ──────────────────────────────────────────────────────

export type FormValues = Record<string, unknown>

export type ApiPayload = Record<string, unknown>

// ─── Validation results ───────────────────────────────────────────────────────

export interface FieldError {
  fieldId: string
  message: string
}

export interface StepValidationResult {
  isValid: boolean
  errors: Map<string, string>
}

export interface FormValidationResult {
  isValid: boolean
  errors: Map<string, string>
}

// ─── Hydrated external data ───────────────────────────────────────────────────
// Datos externos que el Rule Engine y Validation Engine necesitan

export interface GlobalCatalogs {
  annualPeriods: SelectOption[]
  personTypes: SelectOption[]
  sanctionTypes: SelectOption[]
  declarationTypes: SelectOption[]
  departments: SelectOption[]
  cities: SelectOption[]
  documentTypes: SelectOption[]
  // Dependiente del municipio activo. Vive en el mismo bag que los catálogos
  // globales para no acoplar `resolveOptions` a múltiples fuentes; la
  // hidratación se hace en el Data Orchestrator.
  municipalityClassifications: SelectOption[]
  yesNo: SelectOption[]
  tiposSancionICA: SelectOption[]
  tiposFirmante: SelectOption[]
}

export interface MunicipalityDataCache {
  municipalityId: string
  municipalityName: string
  departmentName: string
  // Color de marca por municipio (proviene de ConsultarMunicipio).
  // Útil para futuro theming dinámico — por ahora solo se almacena.
  siteColor?: string
  // Indica si el municipio expone Registro de Información Tributaria.
  // Las reglas declarativas pueden referenciarlo como `municipality.tieneRIT`.
  tieneRIT?: boolean
  // Los siguientes los proveerán endpoints adicionales cuando se integren.
  fechaMaximaDeclaracion?: string
  fechaMaximaConDescuento?: string
  // Porcentaje de sobretasa bomberil (Ley 1575/2012). Varía por municipio:
  // típicamente 2%, 3% o 5% del total ICA. Llega desde el endpoint de config.
  tarifaSobretasa?: number
  economicActivities?: Array<{
    idActividad: number
    codigoCIIU: string
    descripcion: string
    // Proviene del backend cuando esté disponible; por ahora se simula en el
    // DataOrchestrator con un valor determinista basado en idActividad.
    tarifaXMil: number
  }>
}

export interface HydratedData {
  catalogs: GlobalCatalogs
  municipality: MunicipalityDataCache | null
  contributor: Record<string, unknown> | null
  previousDeclaration: Record<string, unknown> | null
}
