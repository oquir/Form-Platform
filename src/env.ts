interface Env {
  apiBaseUrl: string
  isDev: boolean
  isProd: boolean
  // Valores fiscales — se usan para calcular mínimos de sanción.
  // No son críticos para el arranque; si faltan el cálculo devuelve 0 como mínimo.
  uvtValue: number
  smmlvValue: number
  tasaInteresAnual: number
}

function validateEnv(): Env {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

  if (!apiBaseUrl) {
    throw new Error(
      '[env] VITE_API_BASE_URL is not defined. Check your .env file.'
    )
  }

  return {
    apiBaseUrl,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    uvtValue:          Number(import.meta.env.VITE_UVT_VALUE          ?? 0),
    smmlvValue:        Number(import.meta.env.VITE_SMMLV_VALUE        ?? 0),
    tasaInteresAnual:  Number(import.meta.env.VITE_TASA_INTERES_ANUAL ?? 0),
  }
}

// Se evalúa una vez al arrancar la app — falla rápido si falta configuración
export const env = validateEnv()
