export interface ApiResponse<T> {
  success: boolean;
  result: T;
  message: string | null;
}

export interface PeriodoAnual {
  idPeriodoAnual: number;
  periodoAnual: string;
}

export interface TipoPersona {
  idTipoPersona: number;
  tipoPersona: string;
}

export interface TipoSancion {
  idTipoSancion: number;
  tipoSancion: string;
}

export interface TipoDeclaracion {
  idTipoDeclaracion: number;
  tipoDeclaracion: string;
}

export interface Departamento {
  idDepartamento: number;
  departamento: string;
}

export interface Ciudad {
  idCiudad: number;
  idDepartamento: number;
  ciudad: string;
}

export interface TipoDocumento {
  idTipoDocumento: number;
  tipoDocumento: string;
}

export interface Municipio {
  municipio: string;
  departamento: string;
  colorSitio: string;
  tieneRIT: boolean;
  porcentajeSobretasaBomberil?: number;
}

export interface ClasificacionMunicipio {
  idClasificacionMunicipio: number;
  tipoClasificacion: string | null;
}

export interface ActividadEconomica {
  idActividad: number;
  codigoCIIU: string;
  descripcion: string;
}

export interface DeclaracionIca {
  idTipoDeclaracion: number;
  numeroRadicado?: number | null;
  contribuyente: Contribuyente;
  periodoAnio: number;
  idPeriodoAnual?: number | null;
  baseGravable: BaseGravable;
  actividades?: ActividadDeclaracion[];
  generacionEnergiaKw: number;
  impuestoLey56: number;
  impuestoACargo: ImpuestoACargo;
  ajusteDeclaracion: AjusteDeclaracion;
  totalDeclaracion: TotalDeclaracion;
  descripcionAporteVoluntario?: string | null;
  declarante: Declarante;
  responsableLegal: ResponsableLegal;
}

export interface Contribuyente {
  codigoMunicipio?: string | null;
  idTipoDocumento: number;
  idTipoPersona?: number | null;
  numeroDocumento?: string | null;
  digitoVerificacion?: number | null;
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  nombreCompleto?: string | null;
  idCiudad: number;
  direccion?: string | null;
  correo?: string | null;
  telefono?: string | null;
  numeroEstablecimiento: number;
  idClasificacionMunicipio: number;
}

export interface BaseGravable {
  totalIngresosNacionales: number;
  ingresosFueraMunicipio: number;
  totalIngresosOrdinarios: number;
  ingresosDevolucionesDescuentos: number;
  ingresosExportaciones: number;
  ingresosVentaActivos: number;
  ingresosExcluidosNoGravados: number;
  ingresosExentosMunicipio: number;
  totalIngresosGravables: number;
}

export interface ActividadDeclaracion {
  idDeclaracion?: number | null;
  idActividad: number;
  ingresoGravado: number;
  tarifaXMil: number;
  valorImpuestoActividad: number;
}

export interface ImpuestoACargo {
  impuestoAvisosTableros: number;
  pagoUnidadesSectorFinanciero: number;
  sobretasaBomberil: number;
  idTipoJuegoPermitido?: number | null;
  impuestoJuegoPermitido: number;
  sobretasaSeguridad: number;
  estampillaSistematizacion: number;
  totalImpuestoACargo: number;
}

export interface AjusteDeclaracion {
  valorExencionExoneracionImpuesto: number;
  retencionesAFavor: number;
  autoretencionesAFavor: number;
  anticipoLiquidadoAnioAnterior: number;
  anticipoAnioSiguiente: number;
  idTipoSancion?: number | null;
  descripcionSancion?: string | null;
  valorSancion: number;
  saldoFavorPeriodoAnterior: number;
  saldoPagosRecibidos: number;
  totalAjusteDeclaracion: number;
}

export interface TotalDeclaracion {
  totalSaldoACargo: number;
  totalSaldoAFavor: number;
  descuentoProntoPago: number;
  interesMora: number;
  valorAporteVoluntario: number;
  totalDeclaracion: number;
}

export interface Declarante {
  idTipoDocumento: number;
  numeroDocumento?: string | null;
  nombreCompleto?: string | null;
}

export interface ResponsableLegal {
  idTipoRepresentante: number;
  idTipoDocumento: number;
  numeroDocumento?: string | null;
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  celular?: string | null;
  correoElectronico?: string | null;
  nroTarjetaProfesional?: string | null;
}
