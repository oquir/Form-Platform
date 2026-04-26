// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly code: string
  readonly status: number | undefined
  readonly details: unknown

  constructor(code: string, message: string, details?: unknown, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

// ─── Catálogos globales ───────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
}

export type CatalogResponse = SelectOption[]

// DTOs reales del backend: ver `infrastructure/api/types.ts`.
// Los catálogos hidratados internamente se exponen como SelectOption[];
// el mapeo DTO → SelectOption ocurre en la capa de orchestration.

// ─── Municipality ─────────────────────────────────────────────────────────────

export interface MunicipalityData {
  codigoMunicipio: string
  nombreMunicipio: string
  fechaMaximaDeclaracion: string
  fechaMaximaConDescuento: string
  fechaPresentacion: string
}

// ─── Economic activities ──────────────────────────────────────────────────────

export interface EconomicActivity {
  codigoActividad: string
  descripcion: string
  tarifaXMil: number
}

// ─── Contributor ──────────────────────────────────────────────────────────────

export interface Contributor {
  tipoDocumento: string
  numeroDocumento: string
  nombre: string
  tipoPersona: string
  correoElectronico?: string
}

// ─── Declaration ──────────────────────────────────────────────────────────────

export interface DeclarationDetail {
  numeroDeclaracion: string
  anioGravable: number
  tipoDeclaracion: string
  actividades: ActivityDetail[]
  totales: DeclarationTotals
}

export interface ActivityDetail {
  codigoActividad: string
  ingresoGravado: number
  tarifaXMil: number
  valorImpuesto: number
}

export interface DeclarationTotals {
  ingresos: number
  impuesto: number
  sancion: number
  totalAPagar: number
}

// ─── Submission response ──────────────────────────────────────────────────────

export interface SubmissionResponse {
  numeroDeclaracion: string
  codigoBarras: string
  fechaVencimiento: string
}
