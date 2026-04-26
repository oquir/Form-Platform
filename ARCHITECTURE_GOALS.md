# Objetivos Arquitectónicos

- Form Engine dinámico
- Rule Engine desacoplado
- Data Orchestrator
- Integración con React Hook Form
- Mapping flexible a payload

## Restricciones
- NO hardcodear
- NO lógica en componentes

## Validaciones
- NO usar Zod para validaciones del formulario
- Las validaciones deben ser dinámicas y basadas en configuración
- Implementar un Validation Engine propio

- Zod se usará exclusivamente para:
  - Validar respuestas de API
  - Garantizar integridad de datos externos