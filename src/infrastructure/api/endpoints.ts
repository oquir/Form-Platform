// Mapa centralizado de endpoints — ningún otro módulo construye URLs directamente

export const ENDPOINTS = {
  // ── Catálogos globales ────────────────────────────────────────────────────
  LIST_ANNUAL_PERIODS:      '/AutoliquidableApi/ListaPeriodosAnuales',
  LIST_PERSON_TYPES:        '/AutoliquidableApi/ListaTiposPersonaNoConvencional',
  LIST_SANCTIONS:           '/AutoliquidableApi/ListaSanciones',
  LIST_DECLARATION_TYPES:   '/CommonApi/ListaTiposDeclaraciones',
  LIST_DEPARTMENTS:         '/CommonApi/ListaDepartamentos',
  LIST_CITIES:              '/CommonApi/ListaCiudades',
  LIST_DOCUMENT_TYPES:      '/CommonApi/ListaTiposDocumentos',

  // ── Dependientes de municipio ─────────────────────────────────────────────
  LIST_ECONOMIC_ACTIVITIES: (municipalityId: string) =>
    `/CommonApi/ListaActividadesEconomicas/${municipalityId}`,
  GET_MUNICIPALITY: (municipalityId: string) =>
    `/CommonApi/ConsultarMunicipio/${municipalityId}`,
  LIST_CLASIFICATION_TYPES: (municipalityId: string) =>
    `/AutoliquidableApi/ListaClasificacionMunicipio/${municipalityId}`,

  // ── Flujos condicionales ──────────────────────────────────────────────────
  GET_DECLARATION_DETAIL: '/AutoliquidableApi/ConsultarDetalleDeclaracionICA',
  VALIDATE_CONTRIBUTOR:   '/CommonApi/ConsultarContribuyente',
} as const
