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
            { type: 'pattern', value: { literal: '^\\d+$' }, message: 'Solo dígitos' },
            { type: 'minLength', value: { literal: 5 }, message: 'Mínimo 5 caracteres' },
            { type: 'maxLength', value: { literal: 11 }, message: 'Máximo 11 dígitos' },
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
            { type: 'maxLength', value: { literal: 9 }, message: 'Máximo 9 dígitos' },
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
          defaultValue: 'si',
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
          formula: {
            operation: 'conditional',
            condition: {
              operator: 'eq',
              left: { field: 'tieneAvisosTableros' },
              right: { literal: 'si' },
            },
            then: {
              operation: 'multiply',
              operands: ['totalImpuestoICA', 15],
              divisor: 100,
              postProcess: ['redondearMiles'],
            },
            else: {
              operation: 'add',
              operands: [0],
            },
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

        // ── Renglón 25 ─────────────────────────────────────────────────────────
        {
          id: 'totalImpuestoACargo',
          label: '25. Total Impuesto a Cargo (Renglón 20 + 21 + 22 + 23 + 24)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'add',
            operands: [
              'totalImpuestoICA',
              'impuestoAvisosTableros',
              'pagoUnidadesFinanciero',
              'sobretasaBomberil',
              'sobretasaSeguridad',
            ],
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },
      ],
    },
    {
      id: 'descuentosSanciones',
      label: 'Descuentos, Anticipos y Sanciones',
      order: 6,
      visibleWhen: null,
      fields: [
        // ── Renglón 26 ─────────────────────────────────────────────────────────
        {
          id: 'exencionExoneracion',
          label: '26. Menos: Valor de Exención o Exoneración Sobre el Impuesto y No Sobre los Ingresos',
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

        // ── Renglón 27 ─────────────────────────────────────────────────────────
        {
          id: 'retencionesAFavor',
          label: '27. Menos: Retenciones que le practicaron a favor de este municipio o distrito en este periodo',
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

        // ── Renglón 28 ─────────────────────────────────────────────────────────
        {
          id: 'autorretencionesAFavor',
          label: '28. Menos: Autorretenciones practicadas a favor de este municipio o distrito en este periodo',
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

        // ── Renglón 29 ─────────────────────────────────────────────────────────
        {
          id: 'anticipoAnioAnterior',
          label: '29. Menos: Anticipo Liquidado en el Año Anterior',
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

        // ── Renglón 30 ─────────────────────────────────────────────────────────
        {
          id: 'anticipoAnioSiguiente',
          label: '30. Anticipo del Año Siguiente (Si Existe, Liquide Porcentaje Según Acuerdo Municipal o Distrital)',
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

        // ── Renglón 31 ─────────────────────────────────────────────────────────
        {
          id: 'tipoSancion',
          label: '31. Más: Sanciones — Tipo',
          type: 'radio',
          colSpan: 12,
          clearable: false,
          source: { catalog: 'tiposSancionICA' },
          validations: [],
        },
        {
          id: 'sanciones',
          label: 'Valor de la Sanción',
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

        // ── Renglón 32 ─────────────────────────────────────────────────────────
        {
          id: 'saldoFavorPeriodoAnterior',
          label: '32. Menos: Saldo a Favor del Periodo Anterior Sin Solicitud de Devolución o Compensación',
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

        // ── Renglón 33 ─────────────────────────────────────────────────────────
        // (R25 + R30 + R31) - (R26 + R27 + R28 + R29 + R32); si < 0 → 0
        {
          id: 'totalSaldoCargo',
          label: '33. Total Saldo a Cargo (Renglón 25 - 26 - 27 - 28 - 29 + 30 + 31 - 32)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'net',
            positives: ['totalImpuestoACargo', 'anticipoAnioSiguiente', 'sanciones'],
            negatives: ['exencionExoneracion', 'retencionesAFavor', 'autorretencionesAFavor', 'anticipoAnioAnterior', 'saldoFavorPeriodoAnterior'],
            postProcess: ['redondearMiles', 'clampMin0'],
          },
          validations: [],
        },

        // ── Renglón 34 ─────────────────────────────────────────────────────────
        // Mismo balance que R33; si el resultado era negativo muestra el valor absoluto, si no → 0
        {
          id: 'totalSaldoFavor',
          label: '34. Total Saldo a Favor (Renglón 25 - 26 - 27 - 28 - 29 + 30 + 31 - 32)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'net',
            positives: ['totalImpuestoACargo', 'anticipoAnioSiguiente', 'sanciones'],
            negatives: ['exencionExoneracion', 'retencionesAFavor', 'autorretencionesAFavor', 'anticipoAnioAnterior', 'saldoFavorPeriodoAnterior'],
            postProcess: ['redondearMiles', 'negateClampMin0'],
          },
          validations: [],
        },
      ],
    },
    {
      id: 'pagos',
      label: 'Valor a Pagar',
      order: 7,
      visibleWhen: null,
      fields: [
        // ── Renglón 35 ─────────────────────────────────────────────────────────
        // Por ahora refleja directamente el saldo a cargo (R33).
        {
          id: 'valorAPagar',
          label: '35. Valor a Pagar',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'add',
            operands: ['totalSaldoCargo'],
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },

        // ── Renglón 36 ─────────────────────────────────────────────────────────
        {
          id: 'descuentoProntoPago',
          label: '36. Descuento Por Pronto Pago (Si Existe, Liquídelo Según el Acuerdo Municipal o Distrital)',
          type: 'number',
          colSpan: 12,
          defaultValue: 0,
          displayFormat: 'thousands',
          postProcess: ['redondearMiles'],
          disabledWhen: { operator: 'eq', left: { literal: true }, right: { literal: true } },
          validations: [
            { type: 'min', value: { literal: 0 }, message: 'No puede ser negativo' },
            { type: 'maxLength', value: { literal: 20 }, message: 'Máximo 20 dígitos' },
          ],
        },

        // ── Renglón 37 ─────────────────────────────────────────────────────────
        {
          id: 'interesesMora',
          label: '37. Intereses de Mora',
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

        // ── Renglón 38 ─────────────────────────────────────────────────────────
        // R35 - R36 + R37
        {
          id: 'totalAPagar',
          label: '38. Total a Pagar (Renglón 35 - 36 + 37)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'net',
            positives: ['valorAPagar', 'interesesMora'],
            negatives: ['descuentoProntoPago'],
            postProcess: ['redondearMiles', 'clampMin0'],
          },
          validations: [],
        },
      ],
    },
    {
      id: 'pagoVoluntario',
      label: 'Pago Voluntario',
      order: 8,
      visibleWhen: null,
      fields: [
        // ── Renglón 39 ─────────────────────────────────────────────────────────
        {
          id: 'pagoVoluntario',
          label: '39. Liquide el Valor del Pago Voluntario (Según Instrucciones del Municipio/Distrito)',
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

        // ── Renglón 40 ─────────────────────────────────────────────────────────
        // R38 + R39
        {
          id: 'totalAPagarConVoluntario',
          label: '40. Total a Pagar Con Pago Voluntario (Renglón 38 + 39)',
          type: 'calculated',
          colSpan: 12,
          displayFormat: 'thousands',
          formula: {
            operation: 'add',
            operands: ['totalAPagar', 'pagoVoluntario'],
            postProcess: ['redondearMiles'],
          },
          validations: [],
        },

        // ── Destino ─────────────────────────────────────────────────────────────
        {
          id: 'destinoAporteVoluntario',
          label: 'Destino de Mi Aporte Voluntario',
          type: 'text',
          colSpan: 12,
          validations: [],
        },
      ],
    },
    {
      id: 'firmantes',
      label: 'Información del Declarante y Firmante',
      order: 9,
      visibleWhen: null,
      fields: [
        // ── Información del declarante ──────────────────────────────────────────
        {
          id: 'declaranteTipoDocumento',
          label: 'Tipo de documento',
          type: 'select',
          source: { catalog: 'documentTypes' },
          colSpan: 6,
          validations: [{ type: 'required', message: 'Requerido' }],
        },
        {
          id: 'declaranteNumeroDocumento',
          label: 'Número de documento',
          type: 'text',
          colSpan: 6,
          validations: [{ type: 'required', message: 'Requerido' }],
        },
        {
          id: 'declaranteNombreCompleto',
          label: 'Nombre completo',
          type: 'text',
          colSpan: 12,
          validations: [{ type: 'required', message: 'Requerido' }],
        },

        // ── Información del contador o revisor fiscal ───────────────────────────
        {
          id: 'tipoFirmante',
          label: 'Información del contador o revisor fiscal',
          type: 'radio',
          colSpan: 12,
          clearable: true,
          source: { catalog: 'tiposFirmante' },
          validations: [],
        },
        {
          id: 'firmanteTipoDocumento',
          label: 'Tipo de documento',
          type: 'select',
          source: { catalog: 'documentTypes' },
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmanteNumeroDocumento',
          label: 'Número de documento',
          type: 'text',
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmantePrimerNombre',
          label: 'Primer nombre',
          type: 'text',
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmanteSegundoNombre',
          label: 'Segundo nombre',
          type: 'text',
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmantePrimerApellido',
          label: 'Primer apellido',
          type: 'text',
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmanteSegundoApellido',
          label: 'Segundo apellido',
          type: 'text',
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmanteCelular',
          label: 'Celular',
          type: 'text',
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmanteCorreoElectronico',
          label: 'Correo electrónico',
          type: 'text',
          colSpan: 6,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
        {
          id: 'firmanteTarjetaProfesional',
          label: 'Número de tarjeta profesional',
          type: 'text',
          colSpan: 12,
          disabledWhen: {
            operator: 'notIn',
            left: { field: 'tipoFirmante' },
            right: { literal: ['contador', 'revisorFiscal'] },
          },
          validations: [],
        },
      ],
    },
    {
      id: 'declaracion',
      label: 'Datos de la declaración',
      order: 10,
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
      order: 11,
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
    tiposSancionICA: [
      { value: 'extratemporaneidad', label: 'Extratemporaneidad' },
      { value: 'correccion', label: 'Corrección' },
      { value: 'inexactitud', label: 'Inexactitud' },
      { value: 'otra', label: 'Otra' },
    ],
    tiposFirmante: [
      { value: 'contador', label: 'Contador' },
      { value: 'revisorFiscal', label: 'Revisor Fiscal' },
    ],
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
