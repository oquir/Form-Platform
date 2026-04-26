import { create } from 'zustand'
import type { DeclarationSession } from '@/types/session.types'

// Store en memoria — sin persist middleware: al recargar, status vuelve
// a 'pending' y el modal reaparece (decisión de producto).

type Status = 'pending' | 'ready'

interface DeclarationSessionState {
  status: Status
  session: DeclarationSession | null
}

interface DeclarationSessionActions {
  commit: (session: DeclarationSession) => void
  reset: () => void
}

const INITIAL_STATE: DeclarationSessionState = {
  status: 'pending',
  session: null,
}

export const useDeclarationSessionStore = create<
  DeclarationSessionState & DeclarationSessionActions
>((set) => ({
  ...INITIAL_STATE,
  commit: (session) => set({ status: 'ready', session }),
  reset: () => set(INITIAL_STATE),
}))

type Slice = DeclarationSessionState & DeclarationSessionActions

export const selectSessionStatus  = (s: Slice) => s.status
export const selectSession        = (s: Slice) => s.session
export const selectIsSessionReady = (s: Slice) => s.status === 'ready'
