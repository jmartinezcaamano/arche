# Política de clarificación (Grill Me)

## Principio

> Uncertainty is distinct from risk and complexity, but is represented through unresolved decisions rather than a self-assessed numeric/ordinal level.

- No hay escala de incertidumbre ni etiqueta que el agente se ponga a sí mismo: la incertidumbre es la lista de **decisiones materiales aún sin resolver**.
- Baja con la exploración y con cada respuesta; no se clasifica una vez al principio.
- Cada eje tiene su palanca: el riesgo gobierna el rigor, la complejidad la orquestación, las decisiones abiertas la conversación y la spec.

Do not ask what you can discover. Do not ask what does not matter. Do not decide for the user what materially changes the product. When a decision is material, conversation is part of execution.

## Cuándo cargar esta política

Cuando, tras descubrir lo descubrible, queda al menos una decisión material o dudas de si lo es. Si no queda ninguna, no la cargues: procede.

## 1. Descubrir primero

Repo, specs, `AGENTS.md`, historial, schema y patrones existentes. Lo que se puede descubrir no se pregunta.

## 2. Decisiones abiertas

Lista las decisiones pendientes y trata cada una así:

- **descubrible** → descúbrela;
- **reversible, de bajo impacto y con default convencional** → asúmela y decláralo (paso 4);
- **material** → pregúntala.

Es material si, de equivocarte, el daño es real: el usuario lo notaría y costaría más que un commit corregirlo, o expone datos personales a quien hoy no los ve, o toca permisos, dinero o un contrato de UX.

- Una decisión reversible con default convencional no es material, aunque dudes entre niveles de riesgo: asúmela y decláralo. Si ya tienes un default recomendado y se corrige barato, no es una pregunta.
- El riesgo y la irreversibilidad suben el listón (en L4 o ante algo irreversible, pregunta antes); un riesgo provisional por prudencia no convierte por sí solo una decisión en material.

## 3. Cómo preguntar

El número y el peso de las decisiones materiales deciden la forma, no un nivel:

- **ninguna** → procede y declara los supuestos;
- **pocas (1–3)** → *Micro Grill*: un solo mensaje, agrupado;
- **muchas, estructurales (entidades, permisos, flujos) o con señales contradictorias** → *Grill Me*: rondas cortas, de unas 3–5 preguntas como orientación y no como límite, empezando por las que desbloquean a las demás.

Cada pregunta:
- va en lenguaje de producto y, cuando ayude, como escenario concreto ("si un vecino deja la comunidad, ¿el gestor sigue viendo sus documentos?");
- ofrece 2–3 alternativas con su consecuencia y un **default recomendado**;
- dice qué cambia según la respuesta; si nada cambia, no se pregunta.

Si el usuario domina el producto pero no los términos técnicos, invítalo a narrar el comportamiento con sus palabras y pregunta solo los huecos.

## 4. Supuestos a la vista

Antes de construir, declara en pocas líneas lo que asumes, para que el usuario lo corrija barato. En SDD van en la sección "Decisiones y supuestos" de la spec; fuera de SDD, en el mensaje previo a editar o en el PR. No crees un documento aparte. En Fast Path y cambios pequeños, los supuestos van en el reporte final, bien visibles y corregibles; no añadas un mensaje previo solo para declararlos.

## 5. Cuándo parar

Para cuando no queden decisiones materiales abiertas o las restantes sean defaults aceptados. Cierra con una confirmación: "esto es lo que voy a construir y estos son los supuestos; ¿qué corriges?". Es una respuesta, no otra ronda.

- Si el usuario delega ("lo estándar", "decide tú"), acepta los defaults, no repreguntes y decláralos.
- Si una ronda no cambia las decisiones abiertas, deja de preguntar.
- Si el usuario ya aportó una spec exhaustiva, no repreguntes lo que dice.

## 6. Reabrir

Si durante la ejecución aparece una decisión material, detente en el siguiente punto seguro (o continúa solo con lo independiente) y pregunta. No la entierres en el código ni la resuelvas con un test verde: pasar tests solo demuestra que el código hace lo que asumiste.

## 7. Sin canal para preguntar

En ejecuciones sin interlocutor (headless, CI) y en subagentes:

- elige lo más reversible y evita lo irreversible o lo que toque datos, permisos o dinero;
- registra supuestos y preguntas abiertas donde quedarán a la vista (spec, PR o resumen final);
- los subagentes no preguntan al usuario: devuelven sus preguntas al coordinador.
