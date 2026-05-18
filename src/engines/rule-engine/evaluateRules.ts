import type { MunicipalityConfig, FieldConfig, StepConfig } from '@/types/config.types'
import type { RuleEvalResult } from '@/types/engine.types'
import type { FormValues, HydratedData } from '@/types/form.types'
import type { EvalContext } from './operand-resolver'
import { evaluateCondition } from './condition-evaluator'
import { evaluateFormula } from './formula-evaluator'
import { resolveDeadline } from '@/engines/deadline/resolveDeadline'

interface EvaluateRulesArgs {
  config: MunicipalityConfig
  values: FormValues
  hydrated: HydratedData
  context?: Record<string, unknown>
}

function evalFieldVisibility(field: FieldConfig, ctx: EvalContext): boolean {
  if (field.visibleWhen == null) return true
  return evaluateCondition(field.visibleWhen, ctx)
}

function evalStepVisibility(step: StepConfig, ctx: EvalContext): boolean {
  if (step.visibleWhen == null) return true
  return evaluateCondition(step.visibleWhen, ctx)
}

// Resuelve el colSpan efectivo de un field. Primer `colSpanWhen` que matchee
// gana; si no hay match, cae al `colSpan` declarado. Devuelve `undefined`
// cuando el field no tiene configuración explícita: el form-engine aplica
// el default (12 = fila completa).
function evalFieldColSpan(field: FieldConfig, ctx: EvalContext): number | undefined {
  if (field.colSpanWhen) {
    for (const rule of field.colSpanWhen) {
      if (evaluateCondition(rule.when, ctx)) return rule.value
    }
  }
  return field.colSpan
}

// Entrypoint del Rule Engine. Pure: mismo input → mismo output.
// El coordinator lo invoca tras cada cambio relevante de formValues.
export function evaluateRules({
  config, values, hydrated, context = {},
}: EvaluateRulesArgs): RuleEvalResult {
  // ── Fecha límite de presentación ────────────────────────────────────────────
  // Se calcula ANTES del loop principal para que `_isVencida` esté disponible
  // en las condiciones visibleWhen/disabledWhen de cualquier campo.
  let deadlineDate: Date | null = null
  let isLate: boolean | null = null

  if (config.calendarioVencimiento) {
    const cal = config.calendarioVencimiento
    const año = Number(context.year)
    const periodoId = context.periodoId != null ? String(context.periodoId) : null

    // Toma el primer campo con valor no vacío (soporta string o array de campos)
    const fields = Array.isArray(cal.documentoField)
      ? cal.documentoField
      : [cal.documentoField ?? 'numeroDocumento']
    const documento = fields.map((f) => String(values[f] ?? '')).find((v) => v.trim() !== '') ?? ''

    if (documento.trim() && !isNaN(año) && año > 0) {
      deadlineDate = resolveDeadline({ calendario: cal, año, periodoId, documento })
      isLate = deadlineDate != null ? new Date() > deadlineDate : null
    }
  }

  // ── Descuento por pronto pago ────────────────────────────────────────────────
  // Calcula el porcentaje de descuento vigente hoy según el año gravable.
  // Se inyecta como `_descuentoPct` para que el campo calculated lo use
  // en una fórmula multiply sin necesitar una operación especial.
  let descuentoPct = 0

  if (config.calendarioDescuento) {
    const cal = config.calendarioDescuento
    const año = Number(context.year)
    const tramos = (año > 0 ? cal.porAnio?.[año] : undefined) ?? cal.default ?? []
    const now = new Date()
    for (const tramo of tramos) {
      const limite = new Date(`${tramo.hasta}T23:59:59`)
      if (now <= limite) {
        descuentoPct = tramo.porcentaje
        break
      }
    }
  }

  // Inyecta las variables internas en los valores para que las condiciones y
  // fórmulas puedan referenciarlas con { field: '_xxx' }.
  const ctx: EvalContext = { values, hydrated, context }

  const visibility = new Map<string, boolean>()
  const computed = new Map<string, number>()
  const stepVisibility = new Map<string, boolean>()
  const colSpan = new Map<string, number>()
  const disabled = new Map<string, boolean>()

  const currentValues: FormValues = {
    ...values,
    _isVencida:          isLate ?? false,
    _deadlineTimestamp:  deadlineDate?.getTime() ?? 0,
    _descuentoPct:       descuentoPct,
  }

  for (const step of config.steps) {
    stepVisibility.set(step.id, evalStepVisibility(step, ctx))

    for (const field of step.fields) {
      visibility.set(field.id, evalFieldVisibility(field, ctx))

      if (field.disabledWhen != null) {
        disabled.set(field.id, evaluateCondition(field.disabledWhen, ctx))
      }

      const span = evalFieldColSpan(field, ctx)
      if (span !== undefined) colSpan.set(field.id, span)

      if (field.type === 'calculated' && field.formula) {
        const result = evaluateFormula(field.formula, { ...ctx, values: currentValues })
        if (typeof result === 'number') {
          computed.set(field.id, result)
          // Propaga el resultado para que fórmulas posteriores puedan usarlo.
          currentValues[field.id] = result
        }
      }
    }
  }

  return { visibility, computed, stepVisibility, colSpan, disabled, deadlineDate, isLate }
}
