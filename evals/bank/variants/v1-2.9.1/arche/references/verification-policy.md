# Política de verificación y Definition of Done

## Principio

`DONE != CODE WRITTEN`

Una tarea está terminada cuando existe evidencia suficiente de:

`written + executed + tested + verified + evidence`

La profundidad depende del riesgo, complejidad y alcance.

## Verification loop

`IMPLEMENT → RUN → VERIFY → DIAGNOSE → FIX → RE-VERIFY`

Repite hasta cumplimiento, bloqueo real o decisión humana necesaria.

Cuando sea viable demuestra:

`código → ejecución → aplicación → comportamiento → resultado`

## Checks proporcionales

Selecciona según el cambio:
- typecheck/lint;
- unit/component;
- integration/contract;
- E2E/smoke;
- build;
- DB/migrations;
- logs/console;
- auth/permisos/seguridad;
- responsive/accesibilidad/visual QA;
- performance;
- evals IA;
- acceptance criteria.

No ejecutes checks inútiles por ceremonia.

## Verificación en navegador

Cuando el modo de fallo solo es observable en un navegador real (UI, navegación, formularios, responsive, autenticación, errores de consola o de red), complementa los checks deterministas, sin sustituirlos:

`IMPLEMENT → checks deterministas → navegador si hace falta → evidencia → DONE`

No la ejecutes en cambios triviales ni cuando un test ya demuestre el comportamiento. Usa el mecanismo que ofrezca el runtime (MCP de navegador, Playwright u otro), sin dar ninguno por hecho. No uses datos reales ni mutes estado para probar.

Cuando forme parte de la Definition of Done, reporta evidencia fresca del candidato exacto:

```text
BROWSER VERIFICATION
Route / Viewport / Flow
Console: errores relevantes
Network: peticiones fallidas inesperadas
Expected behavior: PASS | FAIL
Evidence: captura, snapshot o salida
```

Cautela: en emulación móvil el viewport de layout puede ensancharse, así que mide el desbordamiento contra el ancho emulado (`scrollWidth` frente a 375, no frente a `innerWidth`) o con captura.

## Remediación acotada

Si falla evidencia:
1. identifica el check/criterio concreto;
2. diagnostica causa;
3. aplica el fix mínimo suficiente;
4. repite checks afectados;
5. amplía verificación solo si el cambio puede haber afectado otras áreas.

No conviertas un fallo local en una reescritura amplia sin justificarla. Si la solución cambia alcance, producto, arquitectura o riesgo, vuelve al punto de decisión/spec.

## Evidencia fresca

La evidencia solo certifica el estado exacto de código/config/schema/artefactos que fue verificado.

Si el candidato cambia, invalida la evidencia afectada y repite lo necesario. Resultados verdes de un candidato anterior no certifican el actual.

## Independencia proporcional

- L1/L2 → puede verificar el mismo contexto;
- L3 → preferir contexto fresco cuando sea útil (subagente si la complejidad es relevante);
- L4 → revisión independiente/fresca según `execution-policy.md` → Fresh reviewer, más los gates humanos correspondientes.

La revisión independiente aporta evidencia; no concede autoridad de entrega.

Mecanismo concreto para invocar esa revisión (subagente, contexto que recibe, qué devuelve): `execution-policy.md` → Fresh reviewer.

## SPEC Coverage

Trazabilidad preferida:

`REQUIREMENT → ACCEPTANCE CRITERIA → CHECK → EVIDENCE`

Pregunta: **¿qué parte de lo prometido está demostrada y cuál no?**

No es obligatorio convertirlo en porcentaje.

## Eval Coverage

Para comportamiento probabilístico, representa capacidades y riesgos relevantes mediante casos de evaluación, rubrics/golden sets cuando aporten valor y regresiones. Testing determinista y evals son complementarios.

## Product Quality Bar

Una funcionalidad relevante debe revisar proporcionalmente:
- claridad y utilidad;
- coherencia;
- velocidad percibida;
- loading/empty/error states;
- copy;
- consistencia visual;
- responsive;
- accesibilidad;
- sensación de acabado.

`TECHNICALLY DONE != PRODUCT DONE`.

## Migraciones/refactors

Cuando el objetivo sea preservar comportamiento, protege un **oracle** independiente antes del cambio: characterization tests, contratos, snapshots útiles, E2E o evidencia equivalente.

No cambies simultáneamente implementación y oracle solo para hacer pasar la migración. Si el comportamiento esperado cambia, modifica spec/oracle explícitamente y deja trazabilidad.
