interface StepNavigatorProps {
  currentIndex: number
  totalSteps: number
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
}

export function StepNavigator({
  currentIndex, totalSteps, isFirst, isLast, onPrev, onNext,
}: StepNavigatorProps) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-xs text-gray-500">
        Paso {currentIndex + 1} de {totalSteps}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  )
}
