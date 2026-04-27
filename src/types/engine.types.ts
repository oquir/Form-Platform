import type { FieldType, MunicipalityConfig } from './config.types'
import type { FormValues, HydratedData } from './form.types'
import type { SelectOption } from './api.types'

// ─── Resolved form schema ─────────────────────────────────────────────────────
// Output del FormEngine: estructura ya evaluada, lista para renderizar

export interface ResolvedField {
  id: string
  label: string
  type: FieldType
  isVisible: boolean
  isDisabled: boolean
  options?: SelectOption[]
  error?: string
  // Solo presente para fields tipo 'calculated' — proviene de rules.computed.
  // No vive en RHF: se trata como valor derivado, no como estado de form.
  computedValue?: unknown
  // Solo presente para fields tipo 'display' — pares label/valor ya
  // resueltos contra HydratedData por el FormEngine.
  displayItems?: Array<{ label: string; value: string }>
}

export interface ResolvedStep {
  id: string
  label: string
  order: number
  isVisible: boolean
  fields: ResolvedField[]
}

export interface ResolvedFormSchema {
  steps: ResolvedStep[]
}

// ─── Rule engine ──────────────────────────────────────────────────────────────

export interface RuleEvalResult {
  visibility: Map<string, boolean>
  computed: Map<string, number>
  stepVisibility: Map<string, boolean>
}

// ─── Validation engine ────────────────────────────────────────────────────────

export interface ValidationContext {
  formValues: FormValues
  externalData: HydratedData
  municipalityConfig: MunicipalityConfig
  declarationType: string
  currentDate: Date
}
