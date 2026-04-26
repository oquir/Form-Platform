import { QueryClient } from '@tanstack/react-query'

// Tiempos de stale por categoría de datos (ver architecture docs)
export const STALE_TIMES = {
  GLOBAL_CATALOGS: Infinity,          // ListaTiposDeclaraciones, etc. — inmutables en sesión
  MUNICIPALITY_DATA: 1000 * 60 * 30,  // Actividades económicas — 30 min
  CONDITIONAL: 0,                      // ConsultarContribuyente — siempre fresh
} as const

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIMES.MUNICIPALITY_DATA,
      gcTime: 1000 * 60 * 60,   // 1 hora antes de limpiar cache inactivo
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
