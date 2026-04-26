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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {step.fields.map((f) => (
          <FieldRenderer key={f.id} field={f} />
        ))}
      </div>
    </section>
  )
}
