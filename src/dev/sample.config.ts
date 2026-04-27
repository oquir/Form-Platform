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
      id: 'datosMunicipio',
      label: 'Información del municipio',
      order: 1,
      visibleWhen: null,
      fields: [
        {
          id: 'datosMunicipioInfo',
          label: 'Datos del municipio',
          type: 'display',
          bindings: [
            { label: 'Municipio',    path: 'municipality.municipalityName' },
            { label: 'Departamento', path: 'municipality.departmentName'   },
          ],
          validations: [],
        },
      ],
    },
    {
      id: 'identificacion',
      label: 'Identificación del contribuyente',
      order: 2,
      visibleWhen: null,
      // Lógica condicional: tipoDocumento === '2' (NIT) bifurca el formulario
      // entre persona jurídica (razón social + DV) y persona natural (nombres
      // y apellidos). El número se modela como dos campos sibling con visibilidad
      // mutuamente excluyente para reflejar que son valores semánticamente distintos
      // (CC/CE numérico vs NIT con DV).
      fields: [
        {
          id: 'tipoDocumento', label: 'Tipo de documento', type: 'select',
          source: { catalog: 'documentTypes' },
          validations: [
            { type: 'required', message: 'Tipo de documento requerido' },
          ],
        },

        // ── Rama: NIT (id 2) ────────────────────────────────────────────────
        {
          id: 'nit', label: 'NIT', type: 'text',
          visibleWhen: {
            operator: 'eq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [
            { type: 'required', message: 'NIT requerido' },
            { type: 'pattern', value: { literal: '^\\d+$' }, message: 'Solo dígitos' },
          ],
        },
        {
          id: 'dv', label: 'DV', type: 'text',
          visibleWhen: {
            operator: 'eq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [
            { type: 'required', message: 'DV requerido' },
            { type: 'pattern', value: { literal: '^\\d$' }, message: 'Un solo dígito' },
          ],
        },
        {
          id: 'razonSocial', label: 'Razón social', type: 'text',
          visibleWhen: {
            operator: 'eq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [
            { type: 'required', message: 'Razón social requerida' },
          ],
        },

        // ── Rama: persona natural (cualquier tipo distinto a 2) ─────────────
        {
          id: 'numeroDocumento', label: 'Número de documento', type: 'text',
          visibleWhen: {
            operator: 'neq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [
            { type: 'required', message: 'Número de documento requerido' },
            { type: 'minLength', value: { literal: 5 }, message: 'Mínimo 5 caracteres' },
          ],
        },
        {
          id: 'primerNombre', label: 'Primer nombre', type: 'text',
          visibleWhen: {
            operator: 'neq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [
            { type: 'required', message: 'Primer nombre requerido' },
          ],
        },
        {
          id: 'segundoNombre', label: 'Segundo nombre', type: 'text',
          visibleWhen: {
            operator: 'neq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [],
        },
        {
          id: 'primerApellido', label: 'Primer apellido', type: 'text',
          visibleWhen: {
            operator: 'neq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [
            { type: 'required', message: 'Primer apellido requerido' },
          ],
        },
        {
          id: 'segundoApellido', label: 'Segundo apellido', type: 'text',
          visibleWhen: {
            operator: 'neq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [],
        },

        // ── Comunes: siempre visibles ───────────────────────────────────────
        {
          id: 'telefono', label: 'Teléfono', type: 'text',
          validations: [
            { type: 'required', message: 'Teléfono requerido' },
            { type: 'pattern', value: { literal: '^\\d{7,15}$' }, message: 'Solo dígitos (7-15)' },
          ],
        },
        {
          id: 'correoElectronico', label: 'Correo electrónico', type: 'text',
          validations: [
            { type: 'required', message: 'Correo requerido' },
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
      order: 3,
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
      order: 4,
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
