import { Select } from '../ui/Select'
import type { SelectOption } from '@/types/api.types'

// Año (regla de dominio: 10 años atrás) y bimestre (catálogo del API)
// son independientes. Se mantiene el bimestre deshabilitado hasta elegir
// año como guía visual del orden semántico.

interface PeriodSectionProps {
  year: string
  bimesterId: string
  years: SelectOption[]
  bimesters: SelectOption[]
  onYearChange: (year: string) => void
  onBimesterChange: (bimesterId: string) => void
}

export function PeriodSection({
  year, bimesterId, years, bimesters, onYearChange, onBimesterChange,
}: PeriodSectionProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-gray-800">Periodo</legend>
      <Select
        id="bs-year"
        label="Año gravable"
        value={year}
        options={years}
        onChange={onYearChange}
      />
      <Select
        id="bs-bimester"
        label="Periodo"
        value={bimesterId}
        options={bimesters}
        onChange={onBimesterChange}
        disabled={!year}
      />
    </fieldset>
  )
}
