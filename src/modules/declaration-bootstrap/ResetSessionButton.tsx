import { useDeclarationSessionStore } from '@/orchestration/session'

// Botón de "cambiar declaración". Vive en este módulo porque
// iniciar/cambiar son la misma feature: ambas pasan por el modal.
//
// Al disparar reset(), status vuelve a 'pending', el gate en FormPage
// desmonta FormRenderer (lo que limpia el estado de RHF automáticamente)
// y reaparece el modal de bootstrap.

interface ResetSessionButtonProps {
  className?: string
  label?: string
}

export function ResetSessionButton({
  className = '',
  label = 'Cambiar declaración',
}: ResetSessionButtonProps) {
  const reset = useDeclarationSessionStore((s) => s.reset)
  return (
    <button
      type="button"
      onClick={reset}
      className={`text-xs font-medium text-blue-600 hover:underline ${className}`}
    >
      {label}
    </button>
  )
}
