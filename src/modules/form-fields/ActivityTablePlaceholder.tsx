import type { FieldComponent } from './types'

// Stub Fase 2 — la tabla real (modules/activity-table) se ensambla en Fase 3
// cuando ValidationEngine y cálculos por fila estén disponibles.
export const ActivityTablePlaceholder: FieldComponent = ({ label }) => {
  return (
    <div className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
      <span className="font-medium">{label}</span>
      <p>Tabla de actividades — se conecta en Fase 3.</p>
    </div>
  )
}
