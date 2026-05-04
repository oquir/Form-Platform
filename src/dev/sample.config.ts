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
      //
      // Layout: grid de 12 columnas. La fila de identificación cambia su
      // composición según la rama:
      //   - no-NIT: [tipoDocumento(6) + numeroDocumento(6)]
      //   - NIT:    [tipoDocumento(4) + nit(4) + dv(4)] → razonSocial(12)
      // El cambio dinámico de tipoDocumento (6→4) se expresa con `colSpanWhen`.
      fields: [
        // ── Excepción al estándar: encabeza el step para que el contribuyente
        //    decida primero si encaja en persona natural/jurídica antes de
        //    elegir tipo de documento. Fila completa.
        {
          id: 'idTipoPersona',
          label: 'Si NO es persona natural NI persona jurídica, marque:',
          type: 'radio',
          source: { catalog: 'personTypes' },
          colSpan: 12,
          // Opcional por requerimiento — solo aplica a contribuyentes que
          // no encajan en las dos categorías estándar.
          validations: [],
        },

        // ── Identificación documental (rama dinámica) ───────────────────────
        {
          id: 'tipoDocumento', label: 'Tipo de documento', type: 'select',
          source: { catalog: 'documentTypes' },
          colSpan: 6,
          // Cuando el contribuyente es NIT, el campo se encoge a 4 para dar
          // espacio a NIT + DV en la misma fila.
          colSpanWhen: [
            {
              when: {
                operator: 'eq',
                left: { field: 'tipoDocumento' },
                right: { literal: '2' },
              },
              value: 4,
            },
          ],
          validations: [
            { type: 'required', message: 'Tipo de documento requerido' },
          ],
        },

        // Persona natural: número de documento ocupa la otra mitad.
        {
          id: 'numeroDocumento', label: 'Número de documento', type: 'text',
          colSpan: 6,
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

        // Persona jurídica (NIT, id 2): NIT + DV completan la fila junto a tipoDocumento.
        {
          id: 'nit', label: 'NIT', type: 'text',
          colSpan: 4,
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
          colSpan: 4,
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
        // Razón social: fila completa debajo del trío tipoDocumento/NIT/DV.
        {
          id: 'razonSocial', label: 'Razón social', type: 'text',
          colSpan: 12,
          visibleWhen: {
            operator: 'eq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [
            { type: 'required', message: 'Razón social requerida' },
          ],
        },

        // ── Persona natural: nombres y apellidos en parejas ─────────────────
        {
          id: 'primerNombre', label: 'Primer nombre', type: 'text',
          colSpan: 6,
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
          colSpan: 6,
          visibleWhen: {
            operator: 'neq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [],
        },
        {
          id: 'primerApellido', label: 'Primer apellido', type: 'text',
          colSpan: 6,
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
          colSpan: 6,
          visibleWhen: {
            operator: 'neq',
            left: { field: 'tipoDocumento' },
            right: { literal: '2' },
          },
          validations: [],
        },

        // ── Ubicación geográfica (cascada departamento → ciudad) ────────────
        // El catálogo `cities` trae cada opción con `parentValue` = idDepartamento;
        // `filterBy` deja al engine filtrar declarativamente sin lógica en UI.
        {
          id: 'idDepartamento', label: 'Departamento', type: 'select',
          source: { catalog: 'departments' },
          colSpan: 6,
          validations: [
            { type: 'required', message: 'Departamento requerido' },
          ],
        },
        {
          id: 'idCiudad', label: 'Ciudad', type: 'select',
          source: { catalog: 'cities', filterBy: { field: 'idDepartamento' } },
          colSpan: 6,
          validations: [
            { type: 'required', message: 'Ciudad requerida' },
          ],
        },
        {
          id: 'direccion', label: 'Dirección', type: 'text',
          colSpan: 12,
          validations: [
            { type: 'required', message: 'Dirección requerida' },
          ],
        },
        {
          id: 'numeroEstablecimientos', label: 'Número de establecimientos', type: 'number',
          colSpan: 6,
          validations: [
            { type: 'required', message: 'Número de establecimientos requerido' },
            { type: 'min', value: { literal: 1 }, message: 'Debe ser al menos 1' },
          ],
        },
        {
          id: 'idClasificacionMunicipio', label: 'Clasificación de la persona', type: 'select',
          source: { catalog: 'municipalityClassifications' },
          colSpan: 6,
          validations: [
            { type: 'required', message: 'Clasificación requerida' },
          ],
        },

        // ── Comunes: siempre visibles ───────────────────────────────────────
        {
          id: 'telefono', label: 'Teléfono', type: 'text',
          colSpan: 6,
          validations: [
            { type: 'required', message: 'Teléfono requerido' },
            { type: 'pattern', value: { literal: '^\\d{7,15}$' }, message: 'Solo dígitos (7-15)' },
          ],
        },
        {
          id: 'correoElectronico', label: 'Correo electrónico', type: 'text',
          colSpan: 6,
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
      id: 'baseGravable',
      label: 'Base Gravable',
      order: 3,
      visibleWhen: null,
      fields: [
        // ── Renglón 8 ──────────────────────────────────────────────────────
        {
          id: 'totalIngresosNacionales',
          label: '8. Total Ingresos Ordinarios y Extraordinarios del Periodo en Todo el País',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
        // ── Renglón 9 ──────────────────────────────────────────────────────
        {
          id: 'ingresosFueraMunicipio',
          label: '9. Menos: Ingresos Fuera de Este Municipio o Distrito',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
        // ── Renglón 10 (calculado: 8 − 9, redondeado) ─────────────────────
        {
          id: 'totalIngresosOrdinarios',
          label: '10. Total Ingresos Ordinarios y Extraordinarios en Este Municipio (Renglón 8 − 9)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'subtract',
            operands: ['totalIngresosNacionales', 'ingresosFueraMunicipio'],
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },
        // ── Renglón 11 ─────────────────────────────────────────────────────
        {
          id: 'ingresosDevolucionesDescuentos',
          label: '11. Menos: Ingresos Por Devolución, Rebajas, Descuentos',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
        // ── Renglón 12 ─────────────────────────────────────────────────────
        {
          id: 'ingresosExportaciones',
          label: '12. Menos: Ingresos Por Exportaciones',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
        // ── Renglón 13 ─────────────────────────────────────────────────────
        {
          id: 'ingresosVentaActivos',
          label: '13. Menos: Ingresos Por Venta de Activos Fijos',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
        // ── Renglón 14 ─────────────────────────────────────────────────────
        {
          id: 'ingresosExcluidosNoGravados',
          label: '14. Menos: Ingresos Por Actividades Excluidas o No Sujetas y Otros Ingresos No Gravados',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
        // ── Renglón 15 ─────────────────────────────────────────────────────
        {
          id: 'ingresosExentosMunicipio',
          label: '15. Menos: Ingresos Por Otras Actividades Exentas en Este Municipio o Distrito (Por Acuerdo)',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
        // ── Renglón 16 (calculado: 10 − 11 − 12 − 13 − 14 − 15, redondeado) ─
        // Referencia totalIngresosOrdinarios (calculado): funciona porque
        // evaluateRules propaga computed → currentValues antes de este campo.
        {
          id: 'totalIngresosGravables',
          label: '16. TOTAL INGRESOS GRAVABLES (Renglón 10 Menos 11, 12, 13, 14 y 15)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'subtract',
            operands: [
              'totalIngresosOrdinarios',
              'ingresosDevolucionesDescuentos',
              'ingresosExportaciones',
              'ingresosVentaActivos',
              'ingresosExcluidosNoGravados',
              'ingresosExentosMunicipio',
            ],
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },
      ],
    },
    {
      id: 'actividadesGravadas',
      label: 'Actividades Gravadas',
      order: 4,
      visibleWhen: null,
      fields: [
        {
          id: 'actividades',
          label: 'Actividades económicas gravadas',
          type: 'activityTable',
          colSpan: 12,
          maxRows: 15,
          defaultValue: [
            { idActividad: null, codigoCIIU: '', descripcion: '', ingresoGravado: 0, tarifaXMil: 0, valorImpuestoActividad: 0 },
          ],
          // El cálculo por fila lo ejecuta el componente usando evaluateFormula,
          // mismo mecanismo que los campos `calculated` globales.
          rowCalculations: [
            {
              target: 'valorImpuestoActividad',
              formula: {
                operation: 'multiply',
                operands: ['ingresoGravado', 'tarifaXMil'],
                divisor: 1000,
                postProcess: ['redondearMiles'],
              },
            },
          ],
          validations: [
            {
              type: 'custom',
              value: { literal: 'actividadesMinUnaSeleccionada' },
              message: 'Debe seleccionar al menos una actividad económica',
            },
            {
              type: 'custom',
              value: { literal: 'actividadesSumaMatchGravable' },
              message: 'La suma de ingresos gravados por actividad debe ser igual al Total Ingresos Gravables (Renglón 16)',
            },
          ],
        },

        // ── Renglón 18 — solo municipios con generación de energía ───────────
        // Capacidad instalada (kW/MW): valor técnico, sin formato de miles ni redondeo.
        // Deshabilitado por defecto; quitar `disabledWhen` en el config del municipio.
        {
          id: 'generacionEnergiaCapacidadInstalada',
          label: '18. Generación de Energía / Capacidad Instalada',
          type: 'number',
          colSpan: 6,
          defaultValue: 0,
          disabledWhen: { operator: 'eq', left: { literal: true }, right: { literal: true } },
          validations: [],
        },

        // ── Renglón 19 — solo municipios cubiertos por Ley 56 de 1981 ────────
        // Valor monetario: aplica formato de miles y redondeo.
        // Deshabilitado por defecto; quitar `disabledWhen` en el config del municipio.
        {
          id: 'impuestoLey56',
          label: '19. Impuesto Ley 56 1981',
          type: 'number',
          colSpan: 6,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          disabledWhen: { operator: 'eq', left: { literal: true }, right: { literal: true } },
          validations: [],
        },

        // ── Renglón 17 — campo calculado auxiliar ─────────────────────────────
        // Suma valorImpuestoActividad de todas las filas del ActivityTable.
        // No se muestra (visibleWhen imposible) pero el engine lo computa y lo
        // deja disponible en currentValues para que el renglón 20 del step
        // siguiente pueda usarlo en su fórmula.
        {
          id: 'totalImpuestoActividades',
          label: '17. Total Impuesto ICA por Actividades',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          visibleWhen: { operator: 'eq', left: { literal: false }, right: { literal: true } },
          formula: {
            operation: 'sumField',
            source: 'actividades',
            sourceField: 'valorImpuestoActividad',
          },
          validations: [],
        },
      ],
    },
    {
      id: 'liquidacion',
      label: 'Liquidación del Impuesto',
      order: 5,
      visibleWhen: null,
      fields: [
        // ── Renglón 20 ─────────────────────────────────────────────────────────
        {
          id: 'totalImpuestoICA',
          label: '20. Total Impuesto de Industria y Comercio (Renglón 17 + 19)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'add',
            operands: ['totalImpuestoActividades', 'impuestoLey56'],
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },

        // ── Renglón 21 ─────────────────────────────────────────────────────────
        // Si el contribuyente tiene avisos y tableros se liquida el 15% del R20.
        {
          id: 'tieneAvisosTableros',
          label: '21. Impuesto de Avisos y Tableros (15% Renglón 20) — ¿Tiene avisos y tableros?',
          type: 'radio',
          colSpan: 12,
          defaultValue: 'no',
          clearable: false,
          source: { catalog: 'yesNo' },
          validations: [],
        },
        {
          id: 'impuestoAvisosTableros',
          label: 'Valor Impuesto de Avisos y Tableros',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          visibleWhen: {
            operator: 'eq',
            left: { field: 'tieneAvisosTableros' },
            right: { literal: 'si' },
          },
          formula: {
            operation: 'multiply',
            operands: ['totalImpuestoICA', 15],
            divisor: 100,
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },

        // ── Renglón 22 ─────────────────────────────────────────────────────────
        {
          id: 'pagoUnidadesFinanciero',
          label: '22. Pago Por Unidades Comerciales Adicionales del Sector Financiero',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },

        // ── Renglón 23 ─────────────────────────────────────────────────────────
        // Porcentaje proviene del endpoint de configuración del municipio
        // (municipality.tarifaSobretasa). Típicamente 2%, 3% o 5%.
        {
          id: 'sobretasaBomberil',
          label: '23. Sobretasa Bomberil (Ley 1575 de 2012)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'multiply',
            operands: ['totalImpuestoICA', { hydrated: 'municipality.tarifaSobretasa' }],
            divisor: 100,
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },

        // ── Renglón 24 ─────────────────────────────────────────────────────────
        {
          id: 'sobretasaSeguridad',
          label: '24. Sobretasa de Seguridad (Ley 1421 de 2011) (Si la hay, Liquídela Según el Acuerdo Municipal o Distrital)',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },
      ],
    },
    {
      id: 'declaracion',
      label: 'Datos de la declaración',
      order: 6,
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
      order: 7,
      visibleWhen: null,
      fields: [
        {
          id: 'ingresoGravado', label: 'Ingreso gravado', type: 'number',
          validations: [
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
    municipalityClassifications: [],
    yesNo: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
    ],
  },
  municipality: null,
  contributor: null,
  previousDeclaration: null,
}
