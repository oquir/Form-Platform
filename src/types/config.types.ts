// ─── Condition expressions ────────────────────────────────────────────────────
// Lenguaje de condiciones unificado — usado por FormEngine, RuleEngine y ValidationEngine

export type ConditionOperator =
  | 'eq' | 'neq' | 'gt' | 'gte'
  | 'lt' | 'lte' | 'in' | 'notIn'
  | 'and' | 'or' | 'not'

export type ConditionOperand =
  | { field: string }
  | { literal: unknown }

export type ConditionExpression = {
  operator: ConditionOperator
  left: ConditionOperand | ConditionExpression
  right?: ConditionOperand | ConditionExpression
}

// ─── Value references ────────────────────────────────────────────────────────
// Permite que reglas y fórmulas referencien valores dinámicos en runtime

export type ValueRef =
  | { literal: unknown }
  | { field: string }
  | { context: string }
  | { catalog: string }

// ─── Validation rules ────────────────────────────────────────────────────────

export type ValidationType =
  | 'required'
  | 'min' | 'max'
  | 'minLength' | 'maxLength'
  | 'pattern'
  | 'crossField'
  | 'arrayMin' | 'arrayMax'
  | 'dateAfter' | 'dateBefore'
  | 'custom'

export interface ValidationRule {
  type: ValidationType
  value?: ValueRef
  message: string
  applyWhen?: ConditionExpression
  target?: string
  operator?: ConditionOperator
}

// ─── Formula / calculation ────────────────────────────────────────────────────

export type FormulaOperation =
  | 'multiply' | 'divide' | 'add' | 'subtract'
  | 'sumField'
  | 'calculateSanction'
  | 'conditional'
  | 'net'
  | 'sancionExtemporaneidad'
  | 'interesesMoratorios'

// Operando de fórmula: literal numérico, campo del form, o ruta dot-notation
// en HydratedData (ej. { hydrated: 'municipality.tarifaSobretasa' }).
export type FormulaOperand = string | number | { hydrated: string }

export interface FormulaNode {
  operation: FormulaOperation
  operands?: Array<FormulaOperand>
  source?: string
  sourceField?: string
  divisor?: number
  postProcess?: string[]
  base?: string
  params?: Record<string, ValueRef>
  // Para operation: 'conditional'
  condition?: ConditionExpression
  then?: FormulaNode
  else?: FormulaNode
  // Para operation: 'net' — sum(positives) - sum(negatives)
  positives?: Array<FormulaOperand>
  negatives?: Array<FormulaOperand>
  // Para operation: 'sancionExtemporaneidad'
  // operands[0] = campo base (totalImpuestoACargo). El resto se toma de config.
  tasa?: number
  unidadTiempo?: UnidadTiempoMora
  minimoSancion?: MinimoSancionRef
}

// ─── Field ────────────────────────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'number' | 'select' | 'radio' | 'date'
  | 'calculated' | 'hidden' | 'activityTable'
  | 'display'

// Binding declarativo de display fields: cada entry pinta un par
// label/valor donde `path` es dot-notation contra HydratedData
// (ej. 'municipality.municipalityName').
export interface DisplayBinding {
  label: string
  path: string
}

export interface CatalogRef {
  catalog: string
  // Cascada declarativa: filtra las opciones del catálogo dejando solo aquellas
  // cuyo `parentValue` coincide con el valor actual del field referenciado.
  // Si el field referenciado no tiene valor aún, no se muestra ninguna opción.
  filterBy?: { field: string }
}

export interface ApiRef {
  api: string
  paramFrom: string
}

export interface ColumnConfig {
  id: string
  label: string
  type?: FieldType
  editable: boolean
  source?: 'fromActivity' | CatalogRef
}

export interface RowValidationRule {
  field: string
  type: ValidationType
  value?: ValueRef
  message: string
}

export interface RowCalculationConfig {
  target: string
  formula: FormulaNode
}

export interface FieldConfig {
  id: string
  label: string
  type: FieldType
  source?: CatalogRef | ApiRef
  defaultValue?: unknown
  visibleWhen?: ConditionExpression
  disabledWhen?: ConditionExpression
  validations: ValidationRule[]
  onChange?: string[]
  formula?: FormulaNode
  maxRows?: number
  columns?: ColumnConfig[]
  rowValidations?: RowValidationRule[]
  rowCalculations?: RowCalculationConfig[]
  // Solo aplicable a campos tipo 'radio'. Cuando es false suprime el botón
  // "Limpiar selección" (útil en radios con defaultValue obligatorio).
  clearable?: boolean
  // Solo aplicable a fields tipo 'display'.
  bindings?: DisplayBinding[]
  // Transforms a aplicar sobre el valor cuando el usuario abandona el campo
  // (onBlur). Solo aplica a campos de input (number, text); los campos
  // `calculated` usan `formula.postProcess`. Los transforms están registrados
  // en transform-runner (ej. 'redondearMiles').
  postProcess?: string[]
  // Formato visual del valor numérico en reposo. 'thousands' aplica separador
  // de miles (ej. 1.233.000). Sin esta propiedad el campo muestra el número crudo.
  displayFormat?: 'thousands'
  // Layout declarativo. Grid es de 12 columnas: 12 = fila completa, 6 = mitad,
  // 4 = tercio, etc. Default 12 cuando no se especifica.
  colSpan?: number
  // Override condicional del colSpan. Primer `when` que matchee gana; si ninguno
  // matchea, cae a `colSpan` (o 12). Permite que el ancho de un mismo campo
  // cambie según el estado del formulario (ej: tipoDocumento pasa de 6 a 4
  // cuando el contribuyente elige NIT y aparecen NIT + DV en la misma fila).
  colSpanWhen?: Array<{ when: ConditionExpression; value: number }>
}

// ─── Step ─────────────────────────────────────────────────────────────────────

export interface StepConfig {
  id: string
  label: string
  order: number
  visibleWhen: ConditionExpression | null
  fields: FieldConfig[]
}

// ─── API Hooks ────────────────────────────────────────────────────────────────

export type HookTrigger = 'onFieldBlur' | 'onFieldChange' | 'onStepEnter'

export type HookActionType = 'hydrateField' | 'hydrateStep' | 'setFieldError'

export interface HookAction {
  action: HookActionType
  target: string
  from?: string
  message?: string
}

export interface ApiHookConfig {
  hookId: string
  trigger: HookTrigger
  triggerField: string
  condition?: ConditionExpression
  endpoint: string
  params: Record<string, ValueRef>
  onSuccess: HookAction[]
  onError: HookAction[]
}

// ─── Payload mapping ──────────────────────────────────────────────────────────

export interface PayloadFieldMap {
  from: string
  to: string
  transform?: string
}

export interface PayloadMapConfig {
  root: string
  fields: PayloadFieldMap[]
}

// ─── Descuento por pronto pago ────────────────────────────────────────────────
//
// Un municipio puede ofrecer descuentos escalonados según la fecha de pago.
// Los tramos se evalúan en orden; se aplica el primero cuya fecha límite
// aún no haya pasado. Si todos expiraron el descuento es 0.
//
// Ejemplo — un municipio con tres tramos:
//   [{ hasta: '2025-02-28', porcentaje: 20 },
//    { hasta: '2025-03-31', porcentaje: 10 },
//    { hasta: '2025-04-30', porcentaje:  5 }]
//
// El engine inyecta `_descuentoPct` en currentValues; el campo calculated
// lo usa como operando en una fórmula multiply estándar.

export interface TramoDescuento {
  hasta: string    // fecha límite ISO 'YYYY-MM-DD' (inclusive, hasta las 23:59:59)
  porcentaje: number
}

export interface CalendarioDescuento {
  // Campo del formulario sobre el que se aplica el porcentaje.
  // Default: 'totalSaldoCargo' (R33). Algunos municipios usan otro base.
  campoBase?: string
  default?: TramoDescuento[]
  porAnio?: Partial<Record<number, TramoDescuento[]>>
}

// ─── Sanción por extemporaneidad ──────────────────────────────────────────────

export type UnidadTiempoMora = 'mes' | 'fraccion' | 'dia'

export type MinimoSancionRef =
  | { tipo: 'uvt';   cantidad: number }
  | { tipo: 'smmlv'; cantidad: number }
  | { tipo: 'fijo';  valor: number }

export interface ConfigSancionExtemporaneidad {
  // 'manual'    → el contribuyente digita el valor; solo se aplica el cap del 100%.
  // 'automatico'→ el engine calcula tasa × periodos × base; campo tipo 'calculated'.
  modo: 'manual' | 'automatico'
  // Solo relevantes en modo 'automatico':
  tasa?: number                  // fracción por periodo (ej. 0.05 = 5 %)
  unidadTiempo?: UnidadTiempoMora
  minimoSancion?: MinimoSancionRef
  // Campo del formulario que sirve de base y de cap (default: 'totalImpuestoACargo')
  campoBase?: string
}

// ─── Calendario de vencimiento ────────────────────────────────────────────────
//
// Modela los tres niveles de complejidad que usan los municipios colombianos
// para definir la fecha máxima de presentación del ICA:
//
//   fixed          → una sola fecha para todos los contribuyentes del año
//   byLastDigit    → 10 fechas distintas según el último dígito del NIT/cédula
//   byPeriod       → tabla cruzada periodo (bimestre/trimestre) × último dígito
//
// `porAnio` permite que cada año gravable tenga su propia regla.
// `default` se aplica cuando el año buscado no tiene entrada en `porAnio`.
// Si no hay `default` y el año no aparece, `resolveDeadline` devuelve null.

// Mapa último dígito → fecha ISO 'YYYY-MM-DD'
export type VencimientoPorDigito = Partial<Record<'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9', string>>

export type ReglaVencimiento =
  | { type: 'fixed'; date: string }
  | { type: 'byLastDigit'; digits: VencimientoPorDigito }
  | { type: 'byPeriod'; periodos: Array<{ periodoId: string; digits: VencimientoPorDigito }> }

export interface CalendarioVencimiento {
  // Campo del formulario cuyo valor contiene el número de documento.
  // Se usa para extraer el último dígito en reglas byLastDigit/byPeriod.
  // Si el municipio también usa NIT se puede declarar como array; se tomará
  // el primer campo con valor no vacío.
  documentoField?: string | string[]
  // Regla base del municipio (aplica a todos los años no listados en `porAnio`)
  default?: ReglaVencimiento
  // Overrides por año gravable específico
  porAnio?: Partial<Record<number, ReglaVencimiento>>
  // Configuración de cómo se liquida la sanción por extemporaneidad
  sancion?: ConfigSancionExtemporaneidad
}

// ─── Municipality config ──────────────────────────────────────────────────────

export interface TaxYearRange {
  min: number
  max: number
}

export interface MunicipalityConfig {
  municipalityId: string
  municipalityName: string
  taxYear: TaxYearRange
  steps: StepConfig[]
  apiHooks: ApiHookConfig[]
  payloadMap: PayloadMapConfig
  calendarioVencimiento?: CalendarioVencimiento
  calendarioDescuento?: CalendarioDescuento
}
