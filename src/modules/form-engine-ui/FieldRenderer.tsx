import { Controller, useFormContext } from 'react-hook-form'
import type { FormValues } from '@/types/form.types'
import type { ResolvedField } from '@/types/engine.types'
import { getFieldComponent } from '@/modules/form-fields'
import { applyTransforms } from '@/engines/rule-engine'
import { useFormEngine } from '@/context/FormEngineContext'

interface FieldRendererProps {
  field: ResolvedField
}

// Único punto donde RHF y el field-registry se encuentran. Los componentes
// del registry no conocen RHF; aquí se les inyectan value/onChange/onBlur.
export function FieldRenderer({ field }: FieldRendererProps) {
  const { control } = useFormContext<FormValues>()
  const { hydrated } = useFormEngine()
  /* eslint-disable react-hooks/static-components */
  const Component = getFieldComponent(field.type)

  if (!field.isVisible) return null

  // grid-column inline: Tailwind no puede compilar `md:col-span-{n}` con un
  // valor dinámico (purge). El wrapper aplica el span sobre el grid de 12
  // columnas declarado por StepRenderer; en mobile el grid es de 1 col,
  // así que el span se aplica solo desde md hacia arriba.
  const wrapperStyle = { gridColumn: `span ${field.colSpan} / span ${field.colSpan}` }

  // calculated y display no son estado de formulario: se renderizan con
  // los valores ya resueltos por los engines (computedValue / displayItems).
  if (field.type === 'calculated' || field.type === 'display') {
    return (
      <div style={wrapperStyle}>
        <Component
          id={field.id}
          name={field.id}
          label={field.label}
          value={field.computedValue}
          onChange={() => {}}
          onBlur={() => {}}
          disabled
          options={field.options}
          error={field.error}
          displayItems={field.displayItems}
          displayFormat={field.displayFormat}
        />
      </div>
    )
  }

  return (
    <div style={wrapperStyle}>
      <Controller
        control={control}
        name={field.id}
        render={({ field: rhf, fieldState }) => {
          const handleBlur = () => {
            if (field.postProcess?.length) {
              const rounded = applyTransforms(rhf.value, field.postProcess, hydrated)
              if (rounded !== rhf.value) rhf.onChange(rounded)
            }
            rhf.onBlur()
          }

          return (
            <Component
              id={field.id}
              name={rhf.name}
              label={field.label}
              value={rhf.value}
              onChange={rhf.onChange}
              onBlur={handleBlur}
              disabled={field.isDisabled}
              options={field.options}
              error={fieldState.error?.message}
              maxLength={field.maxLength}
              min={field.min}
              displayFormat={field.displayFormat}
              maxRows={field.maxRows}
              rowCalculations={field.rowCalculations}
              clearable={field.clearable}
            />
          )
        }}
      />
    </div>
  )
}
