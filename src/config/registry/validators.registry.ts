import { registerCustomValidator } from '@/engines/validation-engine'

// Al menos una fila debe tener actividad seleccionada antes de avanzar.
// Necesario porque la tabla siempre arranca con una fila vacía por defecto.
registerCustomValidator('actividadesMinUnaSeleccionada', (value) => {
  if (!Array.isArray(value)) return false
  return value.some((row) => row && typeof row === 'object' &&
    (row as Record<string, unknown>).idActividad != null
  )
})

// Valida que la suma de ingresos gravados declarados en el ActivityTable
// coincida con el total de ingresos gravables calculado en la Base Gravable
// (renglón 16). Si difieren, el contribuyente tiene inconsistencia entre
// los dos pasos y no debe poder avanzar.
registerCustomValidator('actividadesSumaMatchGravable', (value, ctx) => {
  if (!Array.isArray(value)) return true

  const sumaActividades = value.reduce<number>((acc, row) => {
    if (row && typeof row === 'object') {
      const n = (row as Record<string, unknown>).ingresoGravado
      return acc + (typeof n === 'number' ? n : 0)
    }
    return acc
  }, 0)

  const gravable = ctx.values['totalIngresosGravables']
  const totalGravable = typeof gravable === 'number' ? gravable : 0

  return sumaActividades === totalGravable
})
