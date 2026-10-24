# Política de ejecución, autonomía y delegación

## Principio

El agente resuelve autónomamente lo técnico y escala decisiones materiales. La autonomía aumenta donde el blast radius es pequeño/reversible y disminuye al acercarse a datos compartidos, `main`, infraestructura crítica o producción.

## Autonomía por defecto

Resolver sin preguntar cuando sea razonable:
- compilación, tipos, lint y builds;
- tests rotos causados por el cambio;
- integración o UI verificable;
- configuración no destructiva;
- bugs reproducibles dentro del alcance;
- diagnóstico y remediación técnica acotada.

Después de una corrección relevante, re-verifica.

## Escalar / requerir aprobación

Escala cuando exista:
- ambigüedad de producto que cambie comportamiento (cuándo y cómo preguntar: `clarification-policy.md`);
- trade-off importante o arquitectura fundamental;
- acción destructiva/irreversible;
- seguridad, privacidad, dinero o datos reales con riesgo;
- credenciales/permisos ausentes;
- coste significativo;
- contradicción real de requisitos;
- bloqueo no resoluble razonablemente.

No ejecutes sin aprobación explícita, cuando aplique al proyecto/runtime:
- borrado de datos reales;
- cualquier escritura en datos, esquema o infraestructura compartidos o de producción, aunque no sea destructiva, también a través de conectores/MCP;
- migraciones en producción;
- rotación/exposición de secrets;
- cobros reales;
- push a ramas protegidas, merge, deploy, publicación o release, salvo que las instrucciones del repositorio lo concedan expresamente (por ejemplo, push a la rama de trabajo y PR sin fusionar); en muchos repositorios fusionar en la rama principal equivale a desplegar;
- mitigaciones en producción (rollback, hotfix, corrección de datos), salvo un runbook aprobado;
- cambios materiales de infraestructura;
- acciones remotas fuera del alcance autorizado.

**Verificar no equivale a autorizar entrega.** Tests/review/evidencia no conceden por sí mismos permiso para push, merge, deploy, publicación o release.

## Enforcement técnico

Cuando sea proporcional, convierte límites importantes en permisos, deny-lists, hooks, sandboxing, branch protection o políticas ejecutables. Prefiere enforcement a memoria del prompt, sin crear infraestructura desproporcionada.

## Agent Contract mínimo

Para delegación no trivial define inline, sin documento adicional por defecto:
- `ROLE`
- `OBJECTIVE`
- `SCOPE`
- `CAN`
- `ASK FIRST`
- `NEVER`
- `CONTEXT`
- `EXPECTED OUTPUT`

Ejemplo:

```text
ROLE: Security reviewer
OBJECTIVE: Verify tenant isolation
SCOPE: auth + RLS changes
CAN: read code, run tests, add tests
ASK FIRST: schema/policy behavior changes
NEVER: weaken RLS to make tests pass
CONTEXT: spec + architecture + security playbook
EXPECTED OUTPUT: findings + executed evidence + residual risk
```

Reutiliza `AGENTS.md`, `CLAUDE.md`, permisos y policies válidos en vez de duplicarlos.

## Fresh reviewer

Mecanismo concreto para la independencia de revisión que pide `verification-policy.md`:

- L1/L2 → autorrevisión por el propio agente es suficiente.
- L3 con complejidad relevante → invoca un subagente de revisión con contexto aislado cuando el runtime lo permita.
- L4 → invoca un subagente de revisión con contexto aislado. Si el runtime no soporta subagentes/contexto aislado, dilo explícitamente y compénsalo con gates humanos reforzados.

Contexto a pasar al subagente (no el historial completo de la conversación):
- requirement/acceptance criteria relevantes;
- diff o alcance concreto del cambio;
- tests relevantes y su resultado;
- contexto de seguridad/dominio cuando aplique (`security-playbook.md`, invariantes de negocio).

El subagente devuelve hallazgos y riesgo residual, no una aprobación de entrega: push/merge/deploy siguen las reglas de autorización de este documento, no el veredicto del reviewer.

### Revisión de la spec (antes de construir)

La misma fresh reviewer puede revisar la **spec** antes de implementar, que es más barato que descubrir el fallo en el diff:

- L4 → revisa la spec (y `plan.md` si existe) con contexto aislado antes de escribir código; si el runtime no lo permite, dilo y refuerza los gates humanos;
- L3 → solo si la spec migra datos existentes, es irreversible o descansa en supuestos materiales que el usuario no ha confirmado (una columna o campo nuevo sin nada de lo anterior no basta; cambiar permisos o aislamiento ya es L4);
- L1/L2 → no aplica.

Mandato: un **pre-mortem**. "Asume que esto salió mal en tres meses: ¿por qué?". Busca ambigüedades, contradicciones, supuestos ocultos, estados sin definir, permisos, privacidad y datos, errores y regresiones, y migraciones; añade UX y responsive solo si el cambio los toca.

Contexto a pasar: la spec, su sección "Decisiones y supuestos", la arquitectura y las invariantes relevantes (y `security-playbook.md` si aplica); no el historial de la conversación. Devuelve hallazgos, no aprobación. Lo que sea decisión del usuario vuelve a él, según `clarification-policy.md`.

## Trabajo paralelo / multiagente

No paralelices por defecto. Hazlo cuando existan tareas suficientemente independientes y el coste de integración sea menor que el ahorro.

Reglas:
1. Un **coordinador** conserva autoridad sobre slicing, dependencias, integración y evidencia final.
2. Subagentes de exploración/review pueden devolver información sin escribir código.
3. Agentes que escriben en paralelo deben preferir branches/worktrees/entornos aislados cuando el runtime/repositorio lo permita.
4. Cada worker recibe scope y contrato explícitos; evita ownership solapado sin una autoridad que resuelva conflictos.
5. Integra incrementalmente; no esperes al final para descubrir incompatibilidades.
6. La evidencia final pertenece al candidato integrado, no a branches parciales.
7. Controla el **concurrency budget**: builds, tests, emuladores, DBs y CI caros no deben saturarse solo porque haya muchos agentes. El coordinador puede serializar verificaciones pesadas.
8. Si aparecen conflictos semánticos, deriva arquitectónica o integración creciente, reduce paralelismo.

## Blast radius

Orientación, no estrategia universal:

`local/worktree → feature branch → PR → main → shared data/infra → production`

A mayor blast radius: más checks, aislamiento, revisión y autorización. No impongas número fijo de approvals ni branch strategy a todos los equipos.
