import type { FieldComponent } from './types'

// Field read-only — render de pares label/valor ya resueltos por el FormEngine
// (resolveBindings). No participa de RHF: ver FieldRenderer.

export const DisplayField: FieldComponent = ({ id, label, displayItems }) => {
  const items = displayItems ?? []

  return (
    <section
      aria-labelledby={`${id}-label`}
      className="rounded-md border border-gray-200 bg-white p-4 md:col-span-2"
    >
      <h3 id={`${id}-label`} className="mb-3 text-sm font-semibold text-gray-800">
        {label}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Sin datos disponibles.</p>
      ) : (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex flex-col">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {it.label}
              </dt>
              <dd className="text-sm text-gray-900">{it.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
