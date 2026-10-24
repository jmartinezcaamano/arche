# Workflow — Implement Spec

## Objetivo
Transformar una spec aprobada o un cambio claramente definido en software funcionando y verificado.

## Entrada
- `spec.md` / `plan.md` / `tasks.md`, o alcance equivalente claramente aprobado (sin decisiones materiales abiertas; si apareciera alguna al implementar, aplica "Reabrir" de `../references/clarification-policy.md`);
- estado real del repositorio;
- política de riesgo y verification harness disponibles.

## 1. Revalidar estado y alcance
Antes de cambiar código:
- confirma que la spec sigue siendo compatible con el repositorio actual;
- reconstruye el estado si la sesión fue retomada;
- identifica cambios concurrentes;
- clasifica/revalida el riesgo;
- reevalúa Spread/Novelty/Centrality/Duration si la ejecución resulta más transversal o larga de lo previsto;
- no amplíes alcance silenciosamente.

## 2. Implementar en incrementos pequeños
- si delegas una parte no trivial, aplica `../references/execution-policy.md`: Agent Contract mínimo, scope claro y contexto/skills exactos;
- si varios agentes escriben en paralelo, usa coordinador + aislamiento/worktrees cuando sea viable + integración incremental + concurrency budget; la evidencia final debe ejecutarse sobre el candidato integrado;
- respeta arquitectura y contratos;
- cuando una feature atraviese varias capas, prefiere un vertical slice funcional y verificable antes que completar capas horizontales por separado;
- respeta trust boundaries y adapters definidos por la arquitectura;
- ejecuta architectural fitness functions existentes y añade una solo si protege una regla crítica que merece automatización;
- TDD según `../references/risk-policy.md`;
- para TDD: Red → Green → Refactor;
- evita abstracciones prematuras;
- mantén main/branch saludable;
- versiona migraciones/schema;
- actualiza tests y documentación solo cuando el cambio lo justifique.

## 3. Ejecutar y verificar
Aplica `../references/verification-policy.md`. Ciclo fundamental:
`IMPLEMENT → RUN → VERIFY → DIAGNOSE → FIX → RE-VERIFY`.

Verifica proporcionalmente:
- typecheck/lint;
- unit/component;
- integration/contract;
- E2E/smoke;
- build;
- DB/migrations;
- logs/console;
- permisos/seguridad;
- responsive/accesibilidad;
- visual QA;
- performance;
- evals IA;
- acceptance criteria.

## 4. Remediación acotada
Aplica `../references/verification-policy.md`: evidencia concreta → causa → fix mínimo → re-check afectado. Si el remedio cambia producto, arquitectura, riesgo o alcance, vuelve al punto de decisión correspondiente.

Si el fallo revela un patrón generalizable, aplica `Scar → Rule`; no persistas anomalías aisladas.

## 5. Evidencia fresca e independencia
Sigue `../references/verification-policy.md`. Evidencia antigua no certifica un candidato modificado; la independencia de revisión aumenta con el riesgo.

## 6. Product Quality Bar
Aplica proporcionalmente la sección Product Quality Bar de `../references/verification-policy.md`; tests verdes no bastan para producto relevante.

## 7. Reconciliación as-built
Al cerrar una feature importante, comprueba deriva entre spec y comportamiento real. Si hubo una decisión legítima que cambió el diseño, actualiza documentación vigente dejando trazabilidad. No reescribas silenciosamente la historia.

## Definition of Done
Usa `../references/verification-policy.md`. No confundir evidencia de calidad con autorización para push/merge/deploy/release.

## Reporte
- qué cambió;
- qué checks pasaron y sobre qué candidato;
- criterios de aceptación cumplidos;
- riesgos/limitaciones restantes;
- documentación actualizada;
- siguiente paso.
