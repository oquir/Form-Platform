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
  // Ancho del campo en el grid de 12 columnas del step. Resuelto por el
  // FormEngine a partir de `colSpan` / `colSpanWhen`. La UI lo aplica como
  // grid-column inline (los componentes no conocen reglas de layout).
  colSpan: number
  // Transforms aplicados en onBlur sobre el valor de input (ej. 'redondearMiles').
  // Propagado tal cual desde FieldConfig; la UI los ejecuta vía applyTransforms.
  postProcess?: string[]
  // Límite de caracteres para inputs de tipo number. Extraído de la regla
  // `maxLength` en validations; cumple doble propósito: bloquea el input
  // durante la escritura y valida al enviar el step.
  maxLength?: number
  // Valor mínimo extraído de la regla `min`. Cuando es >= 0, el NumberField
  // bloquea la tecla `-` para que el usuario no pueda ingresar negativos.
  min?: number
  // Propagado desde FieldConfig.displayFormat.
  displayFormat?: 'thousands'
  // Solo activityTable: límite de filas y cálculos por fila.
  maxRows?: number
  rowCalculations?: import('./config.types').RowCalculationConfig[]
  // Solo para tipo 'radio'. false = oculta el botón "Limpiar selección".
  clearable?: boolean
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
  colSpan: Map<string, number>
  disabled: Map<string, boolean>
  // Resultado del cálculo de fecha límite de presentación.
  // null = no hay calendario configurado o el documento aún no fue ingresado.
  deadlineDate: Date | null
  isLate: boolean | null
}

// ─── Validation engine ────────────────────────────────────────────────────────

export interface ValidationContext {
  formValues: FormValues
  externalData: HydratedData
  municipalityConfig: MunicipalityConfig
  declarationType: string
  currentDate: Date
}
