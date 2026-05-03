import type { ResolvedStep } from '@/types/engine.types'
import { FieldRenderer } from './FieldRenderer'

interface StepRendererProps {
  step: ResolvedStep
}

export function StepRenderer({ step }: StepRendererProps) {
  return (
    <section aria-labelledby={`step-${step.id}-title`} className="flex flex-col gap-4">
      <h2 id={`step-${step.id}-title`} className="text-lg font-semibold text-gray-900">
        {step.label}
      </h2>
      {/* Grid de 12 columnas — denominador común para layouts de 2 (6+6),
          3 (4+4+4) o filas completas (12). El ancho efectivo de cada field
          lo decide el FormEngine vía ResolvedField.colSpan. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {step.fields.map((f) => (
          <FieldRenderer key={f.id} field={f} />
        ))}
      </div>
    </section>
  )
}
