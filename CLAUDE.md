# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working style (project rules)

Actúa como un arquitecto de software senior.

- Primero diseña, luego implementa.
- Divide en capas desacopladas.
- Prioriza escalabilidad.
- Evita soluciones simples (cuando comprometan escalabilidad/desacoplo).
- Justifica decisiones técnicas.

Producto: sistema web de declaraciones del Impuesto ICA para múltiples municipios de Colombia. El formulario es **completamente config-driven** (multi-step wizard); nada del dominio se hardcodea en componentes. Ver `PROJECT.md`, `DOMAIN.md`, `ARCHITECTURE_GOALS.md`, `API.md` para reglas de negocio (tipos de declaración, sanciones, redondeo 499→0 / 500→1000, máx. 15 actividades, año gravable hasta 10 años atrás, etc.).

## Commands

- `npm run dev` — Vite dev server.
- `npm run build` — `tsc -b && vite build` (typecheck es parte del build; no hay script `typecheck` aparte).
- `npm run lint` — ESLint flat config.
- `npm run preview` — sirve el build.

No hay framework de tests configurado todavía.

`.env` requiere `VITE_API_BASE_URL` — `src/env.ts` falla rápido al arranque si falta.

Path alias: `@/*` → `src/*` (definido en `vite.config.ts` y `tsconfig.app.json`; usar siempre el alias en imports).

## Arquitectura

Capas estrictas, dependencias siempre hacia abajo. Las capas inferiores no conocen las superiores.

```
pages / router  →  modules (UI)  →  orchestration  →  engines (puros)  →  types / config
                                          ↓
                                  infrastructure (API, queries, schemas)
```

### `src/engines/` — núcleo puro (sin React, sin fetch, sin RHF)

Tres motores independientes y deterministas. Son el corazón del sistema y deben permanecer libres de side effects.

- **`form-engine/`** — transforma `MunicipalityConfig` + resultado de reglas en `ResolvedFormSchema` (steps/fields listos para render). Funciones puras (`resolveSchema`, `resolveStep`, `resolveOptions`).
- **`rule-engine/`** — evalúa visibilidad, fórmulas y visibilidad de pasos. Input: `MunicipalityConfig + FormValues + HydratedData + context`. Output: `RuleEvalResult { visibility, computed, stepVisibility }`. Incluye `condition-evaluator`, `formula-evaluator`, `operand-resolver` y `transform-runner` (transformaciones registrables vía `registerTransform`).
- **`validation-engine/`** — validador propio basado en config. **Prohibido usar Zod para validar el formulario** (ver `ARCHITECTURE_GOALS.md`). Validadores se registran en `validators-registry.ts`; existen variantes `primitive`, `array`, `date`, `cross-field`, `custom`. Custom rules/conditions se registran con `registerCustomValidator` / `registerCustomCondition`.

Zod se usa **exclusivamente** en `infrastructure/schemas/` para validar respuestas de API.

### `src/orchestration/` — pegamento entre engines y UI

- `form-state/useFormSession.ts` — combina React Hook Form + navegación entre pasos visibles. **No conoce** ValidationEngine; la composición validación-→-avance la hace el coordinator (`FormRenderer`).
- `data/`, `wizard/`, `hooks/` — orquestación de hidratación de datos y flujo del wizard.

### `src/modules/` — UI dinámica

- `form-engine-ui/FormRenderer.tsx` — coordinator. En mount calcula un schema base; bajo `FormProvider` un `ReactiveStepView` interno usa `useWatch` para reevaluar reglas/schema en cada cambio sin recrear el form context. Al avanzar, llama `validateStep` y mapea errores a RHF (`setError`).
- `form-fields/registry.ts` — Open/Closed: añadir un nuevo `FieldType` = añadir entrada en el registry. El `FieldRenderer` no se modifica. Tipos actuales: `text`, `number`, `select`, `date`, `hidden`, `calculated`, `activityTable`.
- `activity-table/` — módulo específico para la tabla de actividades económicas (máx. 15, impacta cálculos de impuesto).

### `src/infrastructure/` — I/O

- `api/ApiGateway.ts` — singleton axios. **Ningún módulo importa axios directamente**; todo HTTP pasa por el gateway.
- `queries/` — hooks de React Query separados por naturaleza: `global` (catálogos cacheables agresivamente), `municipality` (dependientes del municipio), `conditional` (corrección, validación contribuyente).
- `schemas/api-responses.schemas.ts` — Zod runtime validation de respuestas externas.

### `src/config/registry/` — extensibilidad

- `municipality.registry.ts` — loaders **lazy** (dynamic import) por municipio. Agregar municipio = añadir entrada en el registry; **cero cambios en engines**.
- `transform.registry.ts` — transformaciones invocables desde reglas declarativas.

### `src/types/` — contratos

`config.types.ts` (config declarativa que escriben los analistas), `engine.types.ts` (`ResolvedFormSchema`, `ResolvedStep` que producen los engines), `form.types.ts` (`FormValues`, `HydratedData`), `api.types.ts`. Modificar tipos cruza varias capas — pensarlo dos veces.

## Reglas no negociables

- **No hardcodear** dominio en componentes ni en engines. Todo lo específico de un municipio vive en su JSON de config.
- **No lógica en componentes**: la UI consume `ResolvedFormSchema`; la lógica vive en engines puros.
- Engines son puros y deterministas — no introducir React, fetch, ni async ahí.
- Validaciones del formulario: **Validation Engine propio**, nunca Zod. Zod solo para boundaries externos (respuestas API).
- HTTP exclusivamente vía `ApiGateway`. React Query envuelve las llamadas en `infrastructure/queries/`.
- Composition root único: `App.tsx` (orden importa: `QueryClientProvider` → `RouterProvider`).
