# Banco de evaluación mínimo de ĀRCHE (M6)

Mide si una variante del método (control `V0`, ĀRCHE 2.9.1 `V1`, y más adelante la candidata 2.10) se comporta
mejor o peor, y a qué coste, con **aserciones deterministas** y sin juez LLM. Es deliberadamente pequeño:
un runner sin dependencias, fixtures sintéticos y pocos casos. Spec y criterios de aceptación:
`docs/specs/arche-2-10/` en el repositorio `homaigo` (PR de revisión), SPEC §4.

## Uso

```bash
node --test tests/*.test.mjs                       # pruebas del propio runner (sin coste)
node evals/bank/runner/run.mjs --dry-run --unfrozen --variants V0,V1 --cases C1,C3,C3py,C6b   # sin coste
node evals/bank/runner/run.mjs --variants V0,V1 --cases C1 --n 1 --model haiku --cap 0.25 \
     --unfrozen --pass-env ANTHROPIC_API_KEY --accept-residual-risk --label humo
```

`--cap` es un tope duro del lote; cada ejecución lleva además `--max-budget-usd`. Sin `PREREG.json`
(`node evals/bank/runner/freeze.mjs`) todo resultado es de **desarrollo** y queda marcado `frozen:false`.

## Aislamiento: barreras comprobadas, no declaradas

Antes de ejecutar, el preflight prueba **desde el usuario del agente** (`runuser`, sin privilegios; no root):
credenciales del host ilegibles (`~/.claude/.credentials.json`, `.ssh`, `.aws`, `.config/gh`…), entorno saneado por
lista de permitidos (solo nombres, nunca valores), git sin credenciales con remotos bare locales, `/tmp` fuera de
cualquier repo, egreso de red, y que la autenticación funciona con lo declarado. En cada ejecución se re-comprueba
el pool de herramientas (sin conectores MCP), `cwd`, señuelos intactos, remoto sin cambios y escrituras fuera del
fixture. Una barrera fallida **impide arrancar**; un riesgo residual exige `--accept-residual-risk` y queda anotado.
Lo no verificable (sandbox del SO) se declara `unverified`.

La credencial de inferencia es inevitable: **usa una API key dedicada con límite de gasto** (`--pass-env`). El runner
no usa `IS_SANDBOX` ni ninguna variable como prueba de aislamiento.

## Métricas

Por ejecución: coste, tokens, turnos, duración, denegaciones de permiso, secuencia de herramientas. Por variante:
éxito, éxito a la primera y **CPT** = Σ coste de todos los intentos (incluido el retrabajo) ÷ tareas terminadas
correctamente. Cada caso con pruebas ocultas admite una ronda de retrabajo con la salida del fallo.

## Estructura

```
runner/    run.mjs · freeze.mjs · lib/{env,stream,assert,fixture,variants,isolation,exec}.mjs
cases/     C1 tooltip (Fast Path) · C3/C3py bug con tests en rojo (dos pilas) · C6b exportar CSV (no preguntar)
fixtures/  node-ts-app · python-lib (sintéticos, sin dependencias)
variants/  v1-2.9.1/ (copia fijada por hash de ĀRCHE 2.9.1)
```
