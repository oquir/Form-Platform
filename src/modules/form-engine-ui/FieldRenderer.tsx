import { Controller, useFormContext } from 'react-hook-form'
import type { FormValues } from '@/types/form.types'
import type { ResolvedField } from '@/types/engine.types'
import { getFieldComponent } from '@/modules/form-fields'

interface FieldRendererProps {
  field: ResolvedField
}

// Único punto donde RHF y el field-registry se encuentran. Los componentes
// del registry no conocen RHF; aquí se les inyectan value/onChange/onBlur.
export function FieldRenderer({ field }: FieldRendererProps) {
  const { control } = useFormContext<FormValues>()
  const Component = getFieldComponent(field.type)

  if (!field.isVisible) return null

  // calculated y display no son estado de formulario: se renderizan con
  // los valores ya resueltos por los engines (computedValue / displayItems).
  if (field.type === 'calculated' || field.type === 'display') {
    return (
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
      />
    )
  }

  return (
    <Controller
      control={control}
      name={field.id}
      render={({ field: rhf, fieldState }) => (
        <Component
          id={field.id}
          name={rhf.name}
          label={field.label}
          value={rhf.value}
          onChange={rhf.onChange}
          onBlur={rhf.onBlur}
          disabled={field.isDisabled}
          options={field.options}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
