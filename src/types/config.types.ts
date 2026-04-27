// ─── Condition expressions ────────────────────────────────────────────────────
// Lenguaje de condiciones unificado — usado por FormEngine, RuleEngine y ValidationEngine

export type ConditionOperator =
  | 'eq' | 'neq'
  | 'gt' | 'gte'
  | 'lt' | 'lte'
  | 'in' | 'notIn'
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

export interface FormulaNode {
  operation: FormulaOperation
  operands?: Array<string | number>
  source?: string
  sourceField?: string
  divisor?: number
  postProcess?: string[]
  base?: string
  params?: Record<string, ValueRef>
}

// ─── Field ────────────────────────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'number' | 'select' | 'date'
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
  // Solo aplicable a fields tipo 'display'.
  bindings?: DisplayBinding[]
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
}
