# Workflow — Spec-Driven Development

## Objetivo
Convertir una feature/cambio relevante en una especificación implementable y verificable sin sobre-diseñar.

## Cuándo usarlo
Úsalo cuando el cambio tenga suficiente comportamiento, riesgo, alcance o ambigüedad como para beneficiarse de especificación previa. Cambios triviales pueden implementarse directamente con verificación proporcional.

## 1. Comprender antes de diseñar
- leer contexto y documentación relevante;
- inspeccionar el código afectado;
- descubrir restricciones reales;
- listar las decisiones materiales aún abiertas y resolverlas según `../references/clarification-policy.md` (Micro Grill / Grill Me);
- identificar vocabulario de dominio relevante, términos ambiguos, sinónimos o polisemia cuando puedan cambiar el comportamiento;
- identificar edge cases;
- revisar compatibilidad con decisiones existentes;
- detectar contratos, datos, permisos e integraciones afectadas.

No hagas preguntas cuyo resultado pueda obtenerse inspeccionando el repositorio.

Si el cambio contiene reglas de negocio relevantes, invariantes o conceptos cuyo significado varía por contexto, carga de forma proporcional el playbook `DDD / dominio complejo` de `../references/conditional-playbooks.md`. No introduzcas Value Objects, Aggregates, repositories o capas adicionales si no resuelven una complejidad concreta.

## 2. Clasificar riesgo
Usa `../references/risk-policy.md`.

Si el cambio afecta auth/authz, tenant isolation, datos sensibles, pagos, uploads, nueva superficie expuesta, trust boundaries o IA con tools/agentes, carga `../references/security-playbook.md` y convierte solo los riesgos materiales en requisitos/checks verificables.

El riesgo determina:
- necesidad de TDD;
- profundidad de tests;
- revisión fresca/independiente;
- aprobación humana;
- plan de rollback/migración;
- evidencia requerida.

### Complejidad de ejecución
Evalúa además, cualitativamente, **Spread / Novelty / Centrality / Duration**. Si es alta, refleja en `plan.md` cómo reducirla: slices, checkpoints, compatibility seams, exploración previa, ownership, worktrees o integración progresiva. No subas el nivel de riesgo solo porque el trabajo sea grande.

Si el cambio es una migración/refactor sustancial que pretende preservar comportamiento, carga el playbook `Migración / refactor mayor` y define el oracle antes de modificar implementación.

## 3. EDD cuando aporte valor
Expresa escenarios concretos Given/When/Then para comportamientos donde los ejemplos reduzcan ambigüedad. No fuerces EDD en cambios puramente cosméticos.

## 4. Crear `spec.md`
Debe describir principalmente **qué comportamiento queremos**:
- contexto/problema;
- objetivos;
- no-objetivos;
- actores/roles;
- decisiones y supuestos: lo que el usuario decidió, lo que se asume por default y lo que sigue abierto;
- requisitos funcionales;
- flujos y estados;
- reglas de negocio;
- permisos/privacidad;
- requisitos de seguridad y abuse/misuse cases relevantes cuando apliquen;
- edge cases y errores;
- NFR relevantes;
- acceptance criteria verificables;
- impacto UX/copy/accesibilidad cuando corresponda.

Evita introducir decisiones técnicas innecesarias en la spec.

### Revisión de la spec (condicional)
Antes de planificar, aplica la "Revisión de la spec" de `../references/execution-policy.md` (fresh reviewer, pre-mortem) cuando el cambio sea L4, o L3 que migre datos existentes, sea irreversible o descanse en supuestos materiales sin confirmar. No la apliques a cambios L1/L2 ni a specs pequeñas y claras. Incorpora los hallazgos a la spec y devuelve al usuario las decisiones que sean suyas.

## 5. Crear `plan.md`
Describe **cómo construirlo** respetando la arquitectura existente:
- componentes/módulos afectados;
- datos/schema/migraciones;
- contratos/APIs;
- integraciones;
- estrategia de implementación;
- estrategia de rollout/compatibilidad;
- testing y verificación;
- observabilidad;
- seguridad, controles y evidencia requerida;
- rollback cuando aplique;
- decisiones y trade-offs relevantes.

Evita re-arquitecturas fuera de alcance.

## 6. Crear `tasks.md`
Divide en trabajo pequeño y verificable, con orden lógico y dependencias.

Cada tarea relevante debe indicar:
- resultado esperado;
- criterio de finalización;
- verificaciones asociadas;
- si puede paralelizarse.

No conviertas cada microacción en una tarea.

## 7. Estrategia de evidencia
Traza cuando sea posible:
`REQUIREMENT → ACCEPTANCE CRITERIA → CHECK → EVIDENCE`.

Usa **SPEC Coverage** como pregunta de control: ¿qué criterios importantes tienen evidencia y cuáles siguen sin demostrar? No hace falta convertirlo en un porcentaje si no aporta valor.

Para capacidades probabilísticas, aplica el mismo principio como **Eval Coverage**: ¿qué comportamientos relevantes y riesgos están representados por casos de evaluación suficientes?

Selecciona tests y evals por riesgo real, no por ritual ni por perseguir cifras de coverage.

## Outputs
- `spec.md`
- `plan.md`
- `tasks.md`

Si el repositorio ya tiene una convención de specs (ubicación, nombres de archivo, formato de progreso), prevalece sobre estos nombres. No inventes una estructura nueva si ya existe una.

## Cierre
Antes de implementar, confirma que la sección "Decisiones y supuestos" no deja abierta ninguna decisión material que cambie comportamiento o tenga alto impacto. Las dudas menores pueden resolverse durante la implementación sin frenar el flujo, declarándolas como supuestos.
