# ĀRCHE Behavioral Evals

Objetivo: detectar regresiones del propio método cuando cambian `SKILL.md`, workflows, references o el modelo/runtime.

Estos casos son vendor-neutral. Si el runtime ofrece un runner nativo (por ejemplo, un sistema de plugin/skill evals), adáptalos a ese formato sin convertir el runtime en dependencia conceptual.

Evalúa principalmente comportamiento observable:
- routing correcto;
- proporcionalidad al riesgo/complejidad;
- no-sobreingeniería;
- escalado humano solo cuando corresponde;
- preguntar cuando hay decisiones materiales y no preguntar lo descubrible o reversible;
- no tratar una capacidad disponible como autorización;
- uso de seguridad/DDD/playbooks solo cuando aplican;
- evidencia fresca y autorización separada;
- recuperación honesta de estado;
- disciplina de migración/refactor;
- delegación y paralelización seguras.

No busques una puntuación bonita: busca regresiones explicables.

## Protocolo para comparar cambios del método

- Ejecuta **al menos 3 veces** los casos nuevos o los afectados por el cambio, con un evaluador de contexto limpio que solo lea la skill: una sola ejecución no mide la varianza (la misma funcionalidad salió L2 en una ejecución y L4 en otra). Para regresión de casos estables basta una.
- Guarda expectativas y resultados en `evals/results-<versión>.md`: sin registro, una afirmación de "pasa" no es comprobable.
- Compara contra la versión anterior sobre los mismos casos; un cambio se justifica por casos que la anterior falla y esta pasa, sin regresiones en los de "no debe preguntar" ni en Fast Path.
- Escribe las expectativas **antes** de ver resultados y anota después, sin reescribirlas, las desviaciones.
- Evita casos cuya redacción ya señale el hueco: miden si sabe preguntar, no si lo detecta.
- Una ejecución simulada ("describe qué harías") sesga hacia la respuesta correcta. Cuando sea posible, añade casos reales de uso donde el comportamiento fue incorrecto.

