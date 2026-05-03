import { createContext, useContext } from 'react'
import type { HydratedData } from '@/types/form.types'

interface FormEngineContextValue {
  hydrated: HydratedData
}

const FormEngineContext = createContext<FormEngineContextValue | null>(null)

export function FormEngineProvider({
  hydrated,
  children,
}: {
  hydrated: HydratedData
  children: React.ReactNode
}) {
  return (
    <FormEngineContext.Provider value={{ hydrated }}>
      {children}
    </FormEngineContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFormEngine(): FormEngineContextValue {
  const ctx = useContext(FormEngineContext)
  if (!ctx) throw new Error('useFormEngine must be used inside FormEngineProvider')
  return ctx
}
