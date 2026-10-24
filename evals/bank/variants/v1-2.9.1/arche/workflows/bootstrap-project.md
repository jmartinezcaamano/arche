# Workflow — Bootstrap Project

## Objetivo
Transformar un proyecto definido en un **V0 ejecutable, desplegado y verificable**, dejando preparado el entorno para trabajo autónomo de agentes.

## Entrada
`product.md`, `design.md`, `architecture.md` o evidencia equivalente suficiente.

## 1. Preparar el Agentic Development Harness
La autonomía procede de **contexto + herramientas + límites + verificación**.

### Verification harness
Crea solo los comandos necesarios y repetibles, por ejemplo:
- typecheck;
- lint;
- unit/integration tests;
- E2E cuando aporte valor;
- build;
- seed/reset seguro;
- ejecución local/preview.

No todos los proyectos requieren todos los comandos.

### Verificación real
Cuando sea viable, permite comprobar:
`código → ejecución → aplicación → comportamiento → resultado`.

Esto puede incluir navegación, formularios, API, DB, logs, consola, screenshots, responsive y flujos críticos.

### Contexto del agente
Mantén contexto suficiente pero conciso. Prefiere `AGENTS.md` para instrucciones operativas portables cuando el runtime lo soporte y no exista una convención previa incompatible; usa `CLAUDE.md` para instrucciones específicas de Claude o cuando ya sea la autoridad del proyecto. Incluye solo comandos, límites, convenciones, arquitectura no obvia y verificación. No dupliques documentación de producto o arquitectura que ya tenga una fuente canónica.

Cuando el proyecto vaya a usar agentes especializados, prepara el contexto para que las delegaciones puedan recibir un **Agent Contract mínimo** (rol, objetivo, scope, permisos/límites, contexto y output esperado) sin crear archivos por cada agente salvo que exista reutilización real.

### Guardrails
Define qué puede hacerse autónomamente y qué exige autorización. Convierte los guardrails relevantes en enforcement técnico cuando el runtime lo permita sin añadir infraestructura desproporcionada.

Configura la autonomía según **blast radius**: mayor libertad en local/worktree/feature branches reversibles; más checks, protección o aprobación al acercarse a main, datos compartidos, infraestructura crítica o producción. No impongas una estrategia de ramas universal: adapta branch protections y approvals al tamaño del equipo y al riesgo.

### Paralelización
Carga `../references/execution-policy.md` si el trabajo requiere varios agentes. No paralelices por defecto. Hazlo solo con tareas suficientemente independientes, contratos claros, aislamiento cuando exista escritura concurrente, un coordinador responsable de integración y un concurrency budget para evitar saturar builds/tests/CI.

**Gate:** HARNESS READY.

## 2. Bootstrap técnico
Si `architecture.md` todavía no ha fijado alguna elección tecnológica, consulta `../references/technology-baseline.md` como preferencia blanda y resuelve la decisión según necesidades reales. Una vez decidida, `architecture.md` es la autoridad del proyecto.

Crear o completar, según proyecto:
- repositorio y estructura;
- stack y dependencias;
- configuración y env examples sin secrets;
- base de datos;
- auth cuando corresponda;
- TypeScript strict o equivalente;
- linting/formatting;
- testing;
- CI;
- design tokens/base UI;
- navegación;
- backend mínimo;
- observabilidad básica;
- deploy/preview.

## 3. V0 / Walking Skeleton
El V0 demuestra el recorrido técnico esencial, no el MVP.

Después del walking skeleton, favorece **vertical slices**: incrementos pequeños que atraviesen las capas necesarias y terminen en comportamiento real verificable. Evita construir largas capas horizontales desconectadas salvo que exista una razón técnica clara.

Debe probar, cuando aplique:
`UI → navegación → backend → datos → deploy`

y/o:
`usuario → autenticación → aplicación → API → DB`.

Cuando existan reglas arquitectónicas críticas automatizables, añade **fitness functions** proporcionales al riesgo (por ejemplo límites de imports, acceso a DB solo desde capas permitidas o proveedores externos detrás de adapters).

Debe:
- ejecutarse;
- estar desplegado o ser verificable en preview;
- poder probarse;
- reflejar la dirección visual inicial;
- tener navegación real;
- conectarse a infraestructura real/controlada;
- superar las verificaciones definidas;
- no presentar errores relevantes en consola/logs.

## Verification loop
`CREATE → INSTALL → BUILD → TEST → RUN → OPEN → VERIFY → DIAGNOSE → FIX → RE-VERIFY`

No cierres por compilar. Corrige autónomamente fallos razonables y repite hasta evidencia suficiente o bloqueo real.

## Gate final
**V0 VERIFIED**.

## Reporte
Indica:
- qué quedó ejecutable;
- comandos de verificación;
- URL/preview cuando exista;
- evidencia obtenida;
- limitaciones conscientes;
- siguiente paso recomendado.
