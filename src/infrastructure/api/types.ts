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