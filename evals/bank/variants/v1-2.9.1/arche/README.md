# ĀRCHE v2.9.1 — Skill completa para Claude Code

ĀRCHE orquesta el ciclo completo: idea → producto → arquitectura → V0 → SDD → implementación → verificación → producción → aprendizaje, con proceso proporcional al riesgo **y** a la complejidad de ejecución.

## Qué cambia en v2.9.1

Corrección tras una revisión independiente (pre-mortem) de la 2.9. No añade conceptos; cierra huecos de autorización y alinea textos.

- **Autorización con conectores** (`SKILL.md`, `execution-policy.md`): que un conector o MCP esté conectado no autoriza acciones con efectos externos. Cualquier escritura en datos, esquema o infraestructura compartidos o de producción, aunque no sea destructiva, requiere aprobación explícita. Este hueco lo introdujo la propia 2.9 al generalizar la resolución de capacidades.
- **Merge, deploy y release** (`execution-policy.md`): solo con autorización explícita o si las instrucciones del repositorio lo conceden; en muchos repositorios fusionar en la rama principal equivale a desplegar. Las mitigaciones en producción también requieren autorización salvo runbook aprobado.
- **Delegación en skills instaladas** (`SKILL.md`, `spec-driven-development.md`): solo si respetan las convenciones del repositorio; ĀRCHE conserva las decisiones abiertas y la revisión de spec. La convención de specs del repositorio prevalece sobre los nombres por defecto.
- **Cambios al propio harness** (`SKILL.md`, `context-policy.md`): modificar esta skill, `AGENTS.md`/`CLAUDE.md` o permisos requiere aprobación humana.
- **Regla de entrada proporcional** (`SKILL.md`): la inspección amplia del repositorio es para iniciar o retomar, no para cada cambio.
- **Coherencia:** revisión independiente con una sola fuente (`execution-policy.md`) y niveles L1–L4 en todas partes; la categoría "L3 que cambia permisos" desaparece (ya es L4); el reporte incluye los supuestos tomados; fecha de verificación de las baselines OWASP/ASVS.
- **Evals:** E23, E27 y E28 alineados con el texto; E29 (conector contra datos reales) y E30 (merge = deploy); protocolo ajustado a la práctica y registro de resultados en `evals/results-2.9.md`.

## Qué cambia en v2.9

Versión con alcance deliberadamente reducido. Antes de escribirla se midió v2.8 con 11 casos ejecutados por evaluadores de contexto limpio que solo leían la skill. Resultado: v2.8 ya preguntaba bien ante ambigüedad visible, ya convertía lecciones recurrentes en checks y ya delegaba con contrato. El único hueco estructural demostrado fue que nadie revisaba la spec antes de construir. Lo que no respaldó la medición no entró.

- **Revisión de la spec antes de construir** (`execution-policy.md`, `spec-driven-development.md`): la fresh reviewer revisa también la spec, con mandato de pre-mortem, en L4, y en L3 solo si cambia permisos o aislamiento, migra datos existentes, es irreversible o descansa en supuestos sin confirmar.
- **Decisiones abiertas** (`SKILL.md`, `references/clarification-policy.md`, principio 49): *Uncertainty is distinct from risk and complexity, but is represented through unresolved decisions rather than a self-assessed numeric/ordinal level.* Preguntas agrupadas (Micro Grill / Grill Me) con alternativas, default recomendado y qué cambia según la respuesta; las decisiones reversibles con default se asumen y se declaran; confirmación por reproducción, reapertura y modo sin canal para preguntar.
- **Capacidades** (`SKILL.md`): la resolución se generaliza a cualquier necesidad (la capacidad más barata, segura y ya disponible; instalar o habilitar una nueva requiere aprobación humana y mínimo privilegio).
- **Verificación en navegador y documentación bajo demanda** (`verification-policy.md`, `context-policy.md`): el navegador es un check condicional tras los deterministas, con bloque de evidencia solo cuando forma parte de la DoD; la documentación externa actual se consulta solo cuando la corrección depende de ella. Ninguna regla nombra un MCP ni un runtime.
- **Evals** (E22–E28 y protocolo en `evals/README.md`): repeticiones por caso, expectativas escritas antes de ver resultados y comparación contra la versión anterior.
- **Versión y precedencia** (`SKILL.md`): si conviven varias copias de ĀRCHE, prevalece la del repositorio.

Durante la validación la primera redacción hizo preguntar de más en un cambio L2 reversible (2 de 4 ejecuciones, frente a 0 de 4 en v2.8) y disparaba la revisión de spec por cualquier columna nueva. Ambas reglas se acotaron y se re-midieron.

**Pasada final sobre esta versión:** 16 ejecuciones (E22 ×2, E22 contraejemplo, E23 ×2, E24 ×2, E25, E26 ×2, E27, E27 contraejemplo, E28 y regresión de E01, E19 y E21) cumplieron las expectativas escritas antes de verlas. Observación abierta: en E27 contraejemplo el agente hizo una pregunta que la política consideraría evitable (había un default reversible); se deja anotada sin cambiar la regla por un solo caso.

**Límites de la evidencia:** las ejecuciones son simuladas ("describe qué harías"), con pocas repeticiones, y los casos los escribió quien escribió los cambios. El problema de partida (que el agente pregunte poco en uso real) no se reprodujo en simulación; lo resolverán mejor casos reales.

**Fuera de v2.9:** cláusula de ambigüedad en Fast Path (sin casos que la justifiquen), aprendizaje controlado, campos nuevos en Agent Contracts y equipos o verificadores especializados: v2.8 ya cubría en la práctica lo que pretendían.

## Qué cambia en v2.8

Versión de corrección a partir de un fallo real en uso: un guard de secretos para `.env` añadido al CI se trató como ajuste de configuración (Fast Path, bash sin tests, sin fresh reviewer) y salió con tres fallos (secreto aceptado por nombre, fuga de valores multilínea en el log, aprobación si faltaba el archivo), detectados después por una revisión externa. La política L4 ya exigía el rigor necesario; lo que faltaba era impedir la mala clasificación.

- **Controles de seguridad = L4** (`risk-policy.md`): un control de seguridad es L4 aunque sea pequeño o viva en CI/config/scripts. Se clasifica por lo que protege, no por dónde vive.
- **Fast Path excluye controles de seguridad** (`risk-policy.md`), por pequeños que sean.
- **Carga del security playbook** (`SKILL.md`): mención explícita de estos controles.
- **Caso canónico nuevo** (E21): control de seguridad pequeño en CI, con contraejemplo (cambiar solo la presentación de un aviso sigue siendo L1) para evitar sobreclasificación.
- **Verificado** con un evaluador de contexto limpio que solo leyó la skill: clasifica E21 como L4 sin Fast Path, mantiene E19 (tooltip) en Fast Path y deja el contraejemplo en L1.

## Qué cambia en v2.7

Versión de mecanismo: cierra huecos de la v2.6 entre "decirlo en prosa" y "tener un mecanismo concreto para hacerlo", sin convertir la skill en un plugin con hooks (eso queda fuera de alcance, ver más abajo).

- **Fresh reviewer con mecanismo concreto** (`execution-policy.md`): define cuándo y cómo invocar un subagente de revisión con contexto aislado según nivel de riesgo, qué contexto recibe y qué devuelve. Antes era solo una recomendación abstracta en `verification-policy.md`.
- **Resolución de capacidades / delegación en skills instaladas** (`SKILL.md`): antes de ejecutar un workflow interno (SDD, security review...), comprueba si el runtime ya trae una skill instalada equivalente y delega ahí; el conocimiento interno de ĀRCHE pasa a ser fallback portable, no una segunda fuente de verdad que pueda divergir.
- **Fast Path explícito** (`risk-policy.md`): nombra el camino corto (`UNDERSTAND → EDIT → VERIFY → DONE`) para L1/L2 de baja complejidad, con aviso explícito de que no es una forma de rebajar seguridad ni evidencia.
- **Checkpoint ligero** (`SKILL.md`): breadcrumb opcional y barato (`docs/product/checkpoint.md`) para acelerar la recuperación de contexto entre sesiones, con regla de invalidación si contradice `HEAD`/evidencia real.
- **Higiene de contexto** (`references/context-policy.md`, nuevo): hábitos de uso de herramientas para sesiones largas — buscar antes de leer, delegar exploración amplia, resumir, checkpoint antes de compactar.
- **Cadena de medición explícita** (`measure-iterate.md`): `FEATURE → EXPECTED OUTCOME → EVENT/SIGNAL → METRIC → BASELINE → POST-RELEASE → DECISION`, definida antes del lanzamiento, no después.
- **4 casos canónicos nuevos** (E17–E20) para cubrir delegación en skills instaladas, fresh reviewer real, Fast Path y checkpoint desactualizado.

### Fuera de alcance en v2.7 (deliberado)

No incluye hooks técnicos (bloqueos deterministas de comandos), un runner automatizado de evals, ni el reempaquetado como plugin (CORE/RUNTIME/EVALS separados). Son mejoras reales pero de otra naturaleza — infraestructura y scripts con su propio ciclo de prueba, no ediciones de metodología — y quedan para una fase posterior una vez el contenido de esta versión esté validado en uso.

## Estructura

```text
arche/
├── SKILL.md
├── README.md
├── workflows/
│   ├── new-project.md
│   ├── bootstrap-project.md
│   ├── spec-driven-development.md
│   ├── implement-spec.md
│   ├── release.md
│   └── measure-iterate.md
├── references/
│   ├── execution-policy.md
│   ├── verification-policy.md
│   ├── engineering-principles.md
│   ├── clarification-policy.md
│   ├── conditional-playbooks.md
│   ├── context-policy.md
│   ├── gates.md
│   ├── risk-policy.md
│   ├── security-playbook.md
│   └── technology-baseline.md
└── evals/
    ├── README.md
    └── canonical-cases.md
```

## Instalación

Importa/copia la carpeta `arche` completa preservando su estructura. El ZIP distribuido contiene **una única carpeta superior `arche/`** y `arche/SKILL.md` incluye YAML válido con `name` y `description`.

## Uso

```text
$arche
$arche quiero crear una aplicación para...
$arche continuemos este proyecto
$arche implementa esta feature
$arche prepara el proyecto para producción
```

El usuario no necesita escoger workflows o playbooks internos.

## Filosofía

- El humano decide lo importante; el sistema ejecuta y demuestra.
- Principle always. Implementation when justified.
- Risk determines rigor; execution complexity determines orchestration.
- Evidence over confidence.
- Verificar no equivale a autorizar entrega.
- Repo + artefactos verificables son fuente de verdad.
- Delegación/paralelización cuando aporta valor, no por ceremonia.
- Mantener `SKILL.md` pequeño: decisiones en core, conocimiento en referencias.
- ĀRCHE aprende, pero no se convierte en una enciclopedia.
- Prosa cuando el agente debe razonar; mecanismo concreto cuando la garantía debe ser real (fresh reviewer, checkpoint, delegación en skills instaladas).
