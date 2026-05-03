import type { MunicipalityConfig } from '@/types/config.types'
import type { FormValues } from '@/types/form.types'

// Extrae los `defaultValue` declarados en la config y los mezcla con los
// valores iniciales provistos externamente. Los valores externos tienen
// precedencia: si el coordinador ya trae un valor para un campo, no se pisa.
// Campos calculados no tienen valor en RHF, así que se saltan.
export function resolveDefaults(
  config: MunicipalityConfig,
  initialValues: FormValues = {}
): FormValues {
  const defaults: FormValues = {}

  for (const step of config.steps) {
    for (const field of step.fields) {
      if (field.type === 'calculated' || field.type === 'display') continue
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue
      }
    }
  }

  // initialValues tiene precedencia sobre los defaults declarados en config.
  return { ...defaults, ...initialValues }
}
