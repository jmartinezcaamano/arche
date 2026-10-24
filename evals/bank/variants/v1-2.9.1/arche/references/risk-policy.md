# Política de riesgo, TDD y evidencia

## Principio
**Risk determines rigor. Evidence over confidence. TDD is a tool, not a dogma.**

Todo requisito importante necesita una forma objetiva de demostrar que está bien implementado, use o no TDD.

## L1 — Cosmético / visual
Ejemplos: color, tipografía, spacing, copy, iconos, layout sin comportamiento.

- TDD: no requerido.
- Evidencia típica: lint/typecheck/build, validación visual, responsive y accesibilidad cuando aplique.

## L2 — Comportamiento de interfaz
Ejemplos: formularios, validaciones, navegación, modales, filtros, estados e interacción.

- TDD: opcional/recomendado según complejidad.
- Evidencia: component/unit, integration, E2E para flujos relevantes, visual QA.

## L3 — Dominio / datos / integraciones
Ejemplos: reglas de negocio, persistencia, APIs, cálculos, workflows, estados, integraciones, migraciones funcionales.

- TDD: requerido por defecto; excepción justificada.
- Evidencia mínima: unit de reglas, integration, edge cases, regresión, typecheck/lint/build, E2E cuando exista flujo crítico.

## L4 — Crítico
Ejemplos: auth, autorización, RLS, privacidad, seguridad, pagos, borrado de datos, operaciones irreversibles, migraciones críticas, aislamiento multi-tenant.

Incluye los **controles de seguridad en sí mismos**, aunque sean pequeños o vivan en CI, config o scripts: guards de secretos, validaciones de acceso, filtros de logs, reglas de bloqueo. Clasifica por lo que el cambio protege, no por dónde vive ni por su tamaño: un control que falla abre justo el hueco que promete cerrar, y además da falsa sensación de seguridad. Cambiar solo la presentación de un control (color, copy de un aviso) no lo convierte en L4, salvo que oculte o elimine el aviso.

- TDD: obligatorio salvo imposibilidad técnica documentada.
- Evidencia reforzada: unit + integration + E2E + negativos + permisos/seguridad + regresión + migraciones + revisión fresca/independiente.
- No cerrar solo porque “los tests pasan”.
- Cargar `security-playbook.md` para seleccionar controles y evidencia proporcionales.

## Regla de decisión
Antes de implementar un cambio relevante determina mentalmente o reporta cuando afecte decisiones:

```text
Risk: L1 / L2 / L3 / L4
Reason: ...
TDD: REQUIRED / RECOMMENDED / NOT REQUIRED
Verification: ...
Evidence: ...
```

No generes un artefacto nuevo por defecto. Si dudas entre niveles, usa inicialmente el superior hasta justificar lo contrario.


## Riesgo != complejidad de ejecución

Esta política clasifica **impacto si algo sale mal**. No uses L1–L4 como proxy de dificultad.

Antes de tareas sustanciales considera también, de forma cualitativa: **Spread** (amplitud), **Novelty** (novedad), **Centrality** (centralidad/acoplamiento) y **Duration** (trabajo largo/multifase). Una tarea L1/L2 puede tener alta complejidad y requerir slicing, checkpoints o integración progresiva sin necesitar controles L4.

## Fast Path

Cuando el cambio sea L1/L2 y de baja complejidad de ejecución (Spread/Novelty/Centrality/Duration bajos, alcance pequeño), el ciclo completo es:

`UNDERSTAND → EDIT → VERIFY → DONE`

sin `spec.md`/`plan.md` formales, sin DDD, sin cargar `security-playbook.md`, sin fresh reviewer.

El Fast Path no es una forma de rebajar controles de seguridad ni de saltarte evidencia: es la ausencia de ceremonia adicional cuando el propio riesgo/complejidad no la justifican. **No aplica a cambios cuyo propósito sea un control de seguridad**, por pequeños que sean (ver L4): esos llevan tests negativos y fresh reviewer. Si durante la ejecución el alcance crece o aparece un L3/L4, sal del Fast Path y reevalúa con la regla de decisión de más arriba.

## IA generativa
Testing determinista y evals son complementarios. Cuando el comportamiento sea probabilístico, define casos, golden set/rubrics si aportan valor y evalúa calidad, seguridad, groundedness, coste/latencia y regresiones relevantes.

## DONE
Una tarea llega a DONE solo al cumplir acceptance criteria y Quality Gates correspondientes al riesgo.
