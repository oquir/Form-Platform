interface Env {
  apiBaseUrl: string
  isDev: boolean
  isProd: boolean
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
  }
}

// Se evalúa una vez al arrancar la app — falla rápido si falta configuración
export const env = validateEnv()
