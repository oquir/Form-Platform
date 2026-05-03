import Select from 'react-select'
import { useFormEngine } from '@/context/FormEngineContext'
import { evaluateFormula } from '@/engines/rule-engine'
import type { EvalContext } from '@/engines/rule-engine'
import type { RowCalculationConfig } from '@/types/config.types'
import type { FormValues } from '@/types/form.types'
import { MonetaryInput } from './MonetaryInput'
import type { FieldComponent } from './types'

interface ActivityRow {
  idActividad: string | null
  codigoCIIU: string
  descripcion: string
  ingresoGravado: number
  tarifaXMil: number
  valorImpuestoActividad: number
  [key: string]: unknown
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function emptyRow(): ActivityRow {
  return {
    idActividad: null,
    codigoCIIU: '',
    descripcion: '',
    ingresoGravado: 0,
    tarifaXMil: 0,
    valorImpuestoActividad: 0,
  }
}

function applyRowCalculations(
  row: ActivityRow,
  calcs: RowCalculationConfig[],
  ctx: Omit<EvalContext, 'values'>
): ActivityRow {
  const result = { ...row }
  for (const calc of calcs) {
    const val = evaluateFormula(calc.formula, { ...ctx, values: result as FormValues })
    if (typeof val === 'number') result[calc.target] = val
  }
  return result
}

export const ActivityTable: FieldComponent = ({
  id, label, value, onChange, disabled, error, maxRows = 15, rowCalculations = [],
}) => {
  const { hydrated } = useFormEngine()
  const activities = hydrated.municipality?.economicActivities ?? []
  const rows: ActivityRow[] = Array.isArray(value) ? (value as ActivityRow[]) : []
  const evalCtx: Omit<EvalContext, 'values'> = { hydrated, context: {} }

  const totalImpuesto = rows.reduce((sum, r) => sum + (r.valorImpuestoActividad ?? 0), 0)
  const totalIngresos = rows.reduce((sum, r) => sum + (r.ingresoGravado ?? 0), 0)

  const recalc = (row: ActivityRow) =>
    rowCalculations.length ? applyRowCalculations(row, rowCalculations, evalCtx) : row

  const updateRow = (index: number, patch: Partial<ActivityRow>) => {
    const updated = rows.map((r, i) =>
      i === index ? recalc({ ...r, ...patch }) : r
    )
    onChange(updated)
  }

  const handleActivityChange = (index: number, idActividad: string | null) => {
    const found = activities.find((a) => String(a.idActividad) === idActividad) ?? null
    updateRow(index, {
      idActividad,
      codigoCIIU: found?.codigoCIIU ?? '',
      descripcion: found?.descripcion ?? '',
      tarifaXMil: found?.tarifaXMil ?? 0,
    })
  }

  const handleIngresoChange = (index: number, n: number) => {
    updateRow(index, { ingresoGravado: n })
  }

  const addRow = () => {
    if (rows.length >= maxRows || disabled) return
    onChange([...rows, recalc(emptyRow())])
  }

  const removeRow = (index: number) => {
    if (disabled) return
    onChange(rows.filter((_, i) => i !== index))
  }

  const usedIds = new Set(rows.map((r) => r.idActividad).filter(Boolean))

  return (
    <div className="flex flex-col gap-3" id={id}>

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">{rows.length}/{maxRows} actividades</span>
      </div>

      {/* Tarjetas de actividad */}
      {rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <ActivityCard
              key={i}
              row={row}
              index={i}
              activities={activities}
              usedIds={usedIds}
              disabled={!!disabled}
              onActivityChange={handleActivityChange}
              onIngresoChange={handleIngresoChange}
              onRemove={removeRow}
            />
          ))}
        </div>
      )}

      {/* Botón agregar */}
      {!disabled && rows.length < maxRows && (
        <button
          type="button"
          onClick={addRow}
          className="self-start rounded border border-dashed border-blue-400 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50"
        >
          + Agregar actividad
        </button>
      )}

      {/* Totales */}
      {rows.length > 0 && (
        <div className="flex justify-end gap-6 rounded border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
          <span className="text-gray-500">
            Total ingresos gravados:{' '}
            <span className="font-medium text-gray-800">{formatCOP(totalIngresos)}</span>
          </span>
          <span className="text-gray-500">
            17. Total impuesto:{' '}
            <span className="font-medium text-gray-800">{formatCOP(totalImpuesto)}</span>
          </span>
        </div>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}

// ── Tarjeta individual ─────────────────────────────────────────────────────────
interface ActivityCardProps {
  row: ActivityRow
  index: number
  activities: NonNullable<ReturnType<typeof useFormEngine>['hydrated']['municipality']>['economicActivities']
  usedIds: Set<string | null>
  disabled: boolean
  onActivityChange: (i: number, id: string | null) => void
  onIngresoChange: (i: number, n: number) => void
  onRemove: (i: number) => void
}

type ActivityOption = { value: string; label: string }

function ActivityCard({
  row, index, activities = [], usedIds, disabled,
  onActivityChange, onIngresoChange, onRemove,
}: ActivityCardProps) {
  const options: ActivityOption[] = (activities ?? [])
    .filter((a) => {
      const vid = String(a.idActividad)
      return !usedIds.has(vid) || row.idActividad === vid
    })
    .map((a) => ({ value: String(a.idActividad), label: `${a.codigoCIIU} — ${a.descripcion}` }))

  const selected = options.find((o) => o.value === row.idActividad) ?? null

  return (
    <div className="rounded border border-gray-200 bg-white">

      {/* Fila superior: selector + CIIU + botón eliminar */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex-1">
          <Select<ActivityOption>
            options={options}
            value={selected}
            onChange={(opt) => onActivityChange(index, opt?.value ?? null)}
            isDisabled={disabled}
            placeholder="Buscar actividad…"
            noOptionsMessage={() => 'Sin resultados'}
            unstyled
            classNames={{
              container: () => 'text-sm',
              control: ({ isFocused }) =>
                `rounded border px-2 py-1 bg-white cursor-pointer ${
                  isFocused ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-300'
                }`,
              menu: () => 'mt-1 rounded border border-gray-200 bg-white shadow-lg z-50',
              menuList: () => 'max-h-56 overflow-y-auto py-1',
              option: ({ isFocused, isSelected }) =>
                `px-3 py-1.5 cursor-pointer ${
                  isSelected ? 'bg-blue-500 text-white' :
                  isFocused  ? 'bg-blue-50 text-gray-900' : 'text-gray-700'
                }`,
              placeholder: () => 'text-gray-400',
              singleValue: () => 'text-gray-900',
              dropdownIndicator: () => 'text-gray-400 hover:text-gray-600 px-1 cursor-pointer',
              indicatorSeparator: () => 'bg-gray-200 mx-1',
              noOptionsMessage: () => 'px-3 py-2 text-gray-400 text-sm',
              input: () => 'text-gray-900',
            }}
          />
        </div>

        {row.codigoCIIU && (
          <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            CIIU {row.codigoCIIU}
          </span>
        )}

        {!disabled && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="shrink-0 text-red-400 hover:text-red-600 text-sm leading-none"
            aria-label="Eliminar actividad"
          >
            ✕
          </button>
        )}
      </div>

      {/* Fila inferior: ingreso, tarifa, impuesto */}
      <div className="grid grid-cols-3 gap-3 border-t border-gray-100 px-3 py-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Ingreso gravado</span>
          <MonetaryInput
            value={row.ingresoGravado}
            onChange={(n) => onIngresoChange(index, n)}
            disabled={disabled}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-right disabled:bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Tarifa x mil</span>
          <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-right text-gray-600">
            {row.tarifaXMil > 0 ? row.tarifaXMil.toFixed(2) : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Impuesto</span>
          <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-right font-medium text-gray-800">
            {formatCOP(row.valorImpuestoActividad)}
          </span>
        </div>
      </div>

    </div>
  )
}
