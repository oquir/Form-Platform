import { z } from 'zod'

// Único uso autorizado de Zod en el proyecto: validar respuestas externas.
// Estos schemas validan el SHAPE INTERNO (`result` ya desempacado por el gateway).
// El envelope `ApiResponse<T>` lo valida ApiGateway estructuralmente.

export const periodoAnualSchema = z.object({
  idPeriodoAnual: z.number(),
  periodoAnual: z.string(),
})

export const tipoDeclaracionSchema = z.object({
  idTipoDeclaracion: z.number(),
  tipoDeclaracion: z.string(),
})

export const departamentoSchema = z.object({
  idDepartamento: z.number(),
  departamento: z.string(),
})

export const ciudadSchema = z.object({
  idCiudad: z.number(),
  idDepartamento: z.number(),
  ciudad: z.string(),
})

export const tipoDocumentoSchema = z.object({
  idTipoDocumento: z.number(),
  tipoDocumento: z.string(),
})

export const tipoPersonaSchema = z.object({
  idTipoPersona: z.number(),
  tipoPersona: z.string(),
})

export const municipioSchema = z.object({
  municipio: z.string(),
  departamento: z.string(),
  colorSitio: z.string(),
  tieneRIT: z.boolean(),
  porcentajeSobretasaBomberil: z.number().optional(),
})

export const clasificacionMunicipioSchema = z.object({
  idClasificacionMunicipio: z.number(),
  // Nombre real del campo en backend (no `clasificacionMunicipio`).
  // Puede llegar `null` para clasificaciones sin etiqueta; el orchestrator
  // las filtra antes de pintar opciones.
  tipoClasificacion: z.string().nullable(),
})

export const contribuyenteSchema = z.object({
  codigoMunicipio: z.string().nullable().optional(),
  idTipoDocumento: z.number(),
  idTipoPersona: z.number().nullable().optional(),
  numeroDocumento: z.string().nullable().optional(),
  digitoVerificacion: z.number().nullable().optional(),
  primerNombre: z.string().nullable().optional(),
  segundoNombre: z.string().nullable().optional(),
  primerApellido: z.string().nullable().optional(),
  segundoApellido: z.string().nullable().optional(),
  nombreCompleto: z.string().nullable().optional(),
  idCiudad: z.number(),
  direccion: z.string().nullable().optional(),
  correo: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  numeroEstablecimiento: z.number(),
  idClasificacionMunicipio: z.number(),
})

export const baseGravableSchema = z.object({
  totalIngresosNacionales: z.number(),
  ingresosFueraMunicipio: z.number(),
  totalIngresosOrdinarios: z.number(),
  ingresosDevolucionesDescuentos: z.number(),
  ingresosExportaciones: z.number(),
  ingresosVentaActivos: z.number(),
  ingresosExcluidosNoGravados: z.number(),
  ingresosExentosMunicipio: z.number(),
  totalIngresosGravables: z.number(),
})

export const actividadDeclaracionSchema = z.object({
  idDeclaracion: z.number().nullable().optional(),
  idActividad: z.number(),
  ingresoGravado: z.number(),
  tarifaXMil: z.number(),
  valorImpuestoActividad: z.number(),
})

export const impuestoACargoSchema = z.object({
  impuestoAvisosTableros: z.number(),
  pagoUnidadesSectorFinanciero: z.number(),
  sobretasaBomberil: z.number(),
  idTipoJuegoPermitido: z.number().nullable().optional(),
  impuestoJuegoPermitido: z.number(),
  sobretasaSeguridad: z.number(),
  estampillaSistematizacion: z.number(),
  totalImpuestoACargo: z.number(),
})

export const ajusteDeclaracionSchema = z.object({
  valorExencionExoneracionImpuesto: z.number(),
  retencionesAFavor: z.number(),
  autoretencionesAFavor: z.number(),
  anticipoLiquidadoAnioAnterior: z.number(),
  anticipoAnioSiguiente: z.number(),
  idTipoSancion: z.number().nullable().optional(),
  descripcionSancion: z.string().nullable().optional(),
  valorSancion: z.number(),
  saldoFavorPeriodoAnterior: z.number(),
  saldoPagosRecibidos: z.number(),
  totalAjusteDeclaracion: z.number(),
})

export const totalDeclaracionSchema = z.object({
  totalSaldoACargo: z.number(),
  totalSaldoAFavor: z.number(),
  descuentoProntoPago: z.number(),
  interesMora: z.number(),
  valorAporteVoluntario: z.number(),
  totalDeclaracion: z.number(),
})

export const declaranteSchema = z.object({
  idTipoDocumento: z.number(),
  numeroDocumento: z.string().nullable().optional(),
  nombreCompleto: z.string().nullable().optional(),
})

export const responsableLegalSchema = z.object({
  idTipoRepresentante: z.number(),
  idTipoDocumento: z.number(),
  numeroDocumento: z.string().nullable().optional(),
  primerNombre: z.string().nullable().optional(),
  segundoNombre: z.string().nullable().optional(),
  primerApellido: z.string().nullable().optional(),
  segundoApellido: z.string().nullable().optional(),
  celular: z.string().nullable().optional(),
  correoElectronico: z.string().nullable().optional(),
  nroTarjetaProfesional: z.string().nullable().optional(),
})

export const declaracionIcaSchema = z.object({
  idTipoDeclaracion: z.number(),
  numeroRadicado: z.number().nullable().optional(),
  contribuyente: contribuyenteSchema,
  periodoAnio: z.number(),
  idPeriodoAnual: z.number().nullable().optional(),
  baseGravable: baseGravableSchema,
  actividades: z.array(actividadDeclaracionSchema).optional(),
  generacionEnergiaKw: z.number(),
  impuestoLey56: z.number(),
  impuestoACargo: impuestoACargoSchema,
  ajusteDeclaracion: ajusteDeclaracionSchema,
  totalDeclaracion: totalDeclaracionSchema,
  descripcionAporteVoluntario: z.string().nullable().optional(),
  declarante: declaranteSchema,
  responsableLegal: responsableLegalSchema,
})

export const actividadEconomicaSchema = z.object({
  idActividad: z.number(),
  codigoCIIU:  z.string(),
  descripcion: z.string(),
})

export const actividadesEconomicasResponseSchema = z.array(actividadEconomicaSchema)

export const periodosAnualesResponseSchema        = z.array(periodoAnualSchema)
export const tiposDeclaracionResponseSchema       = z.array(tipoDeclaracionSchema)
export const departamentosResponseSchema          = z.array(departamentoSchema)
export const ciudadesResponseSchema               = z.array(ciudadSchema)
export const tiposDocumentoResponseSchema         = z.array(tipoDocumentoSchema)
export const tiposPersonaResponseSchema           = z.array(tipoPersonaSchema)
export const clasificacionMunicipioResponseSchema = z.array(clasificacionMunicipioSchema)
export const declaracionIcaResponseSchema         = declaracionIcaSchema

