import type { MunicipalityConfig } from '@/types/config.types'
import type { HydratedData } from '@/types/form.types'

// Fixture dev — reemplaza temporalmente al Data Orchestrator (Fase 4).
// NO formar parte del bundle de producción una vez que loadMunicipalityConfig
// devuelva configs reales desde JSON.

export const sampleConfig: MunicipalityConfig = {
  municipalityId: '11001',
  municipalityName: 'Bogotá D.C. (demo)',
  taxYear: { min: 2015, max: 2026 },
  apiHooks: [],
  payloadMap: { root: 'declaracion', fields: [] },
  steps: [
    {
      id: 'identificacion',
      label: 'Identificación del contribuyente',
      order: 1,
      visibleWhen: null,
      fields: [
        {
          id: 'tipoDocumento', label: 'Tipo de documento', type: 'select',
          source: { catalog: 'documentTypes' },
          validations: [
            { type: 'required', message: 'Tipo de documento requerido' },
          ],
        },
        {
          id: 'numeroDocumento', label: 'Número de documento', type: 'text',
          validations: [
            { type: 'required', message: 'Número de documento requerido' },
            { type: 'minLength', value: { literal: 5 }, message: 'Mínimo 5 caracteres' },
          ],
        },
        {
          id: 'tipoPersona', label: 'Tipo de persona', type: 'select',
          source: { catalog: 'personTypes' },
          validations: [
            { type: 'required', message: 'Tipo de persona requerido' },
          ],
        },
        {
          id: 'correoElectronico', label: 'Correo electrónico', type: 'text',
          // Visible solo para personas naturales — ejemplo de visibleWhen
          visibleWhen: {
            operator: 'eq',
            left: { field: 'tipoPersona' },
            right: { literal: 'natural' },
          },
          validations: [
            {
              type: 'pattern',
              value: { literal: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
              message: 'Correo inválido',
            },
          ],
        },
      ],
    },
    {
      id: 'declaracion',
      label: 'Datos de la declaración',
      order: 2,
      visibleWhen: null,
      fields: [
        {
          id: 'anioGravable', label: 'Año gravable', type: 'select',
          source: { catalog: 'annualPeriods' }, validations: [],
        },
        {
          id: 'tipoDeclaracion', label: 'Tipo de declaración', type: 'select',
          source: { catalog: 'declarationTypes' }, validations: [],
        },
        {
          id: 'fechaPresentacion', label: 'Fecha de presentación', type: 'date',
          validations: [],
        },
      ],
    },
    {
      id: 'totales',
      label: 'Totales',
      order: 3,
      visibleWhen: null,
      fields: [
        {
          id: 'ingresoGravado', label: 'Ingreso gravado', type: 'number',
          validations: [
            { type: 'required', message: 'Ingreso gravado requerido' },
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
          ],
        },
        {
          id: 'tarifaXMil', label: 'Tarifa x mil', type: 'number',
          defaultValue: 7,
          validations: [
            { type: 'required', message: 'Tarifa requerida' },
          ],
        },
        {
          id: 'valorImpuesto', label: 'Valor del impuesto', type: 'calculated',
          formula: {
            operation: 'multiply',
            operands: ['ingresoGravado', 'tarifaXMil'],
            divisor: 1000,
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },
      ],
    },
  ],
}

export const sampleHydratedData: HydratedData = {
  catalogs: {
    annualPeriods: [
      { value: '2024', label: '2024' },
      { value: '2025', label: '2025' },
    ],
    personTypes: [
      { value: 'natural', label: 'Natural' },
      { value: 'juridica', label: 'Jurídica' },
    ],
    sanctionTypes: [],
    declarationTypes: [
      { value: 'inicial', label: 'Inicial' },
      { value: 'correccion', label: 'Corrección' },
      { value: 'clausura', label: 'Clausura' },
    ],
    departments: [],
    cities: [],
    documentTypes: [
      { value: 'CC', label: 'Cédula de ciudadanía' },
      { value: 'NIT', label: 'NIT' },
    ],
  },
  municipality: null,
  contributor: null,
  previousDeclaration: null,
}
