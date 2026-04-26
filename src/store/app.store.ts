import { create } from 'zustand'

// Estado de aplicación — municipio activo y flags de inicialización
// Zustand elegido sobre Context API: sin re-renders innecesarios,
// sin Provider wrapping, selectors por defecto

interface AppState {
  municipalityId: string | null
  isAppReady: boolean
}

interface AppActions {
  setMunicipalityId: (id: string) => void
  setAppReady: (ready: boolean) => void
  reset: () => void
}

const INITIAL_STATE: AppState = {
  municipalityId: null,
  isAppReady: false,
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...INITIAL_STATE,

  setMunicipalityId: (id) => set({ municipalityId: id }),
  setAppReady: (ready) => set({ isAppReady: ready }),
  reset: () => set(INITIAL_STATE),
}))

// Selectores — los componentes consumen piezas, no el store entero
export const selectMunicipalityId = (s: AppState & AppActions) => s.municipalityId
export const selectIsAppReady     = (s: AppState & AppActions) => s.isAppReady
