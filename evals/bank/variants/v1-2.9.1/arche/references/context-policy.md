# Higiene de contexto

Política operativa ligera para sesiones largas o repositorios grandes. No es una metodología nueva: son hábitos de uso de herramientas para mantener el contexto útil y barato.

- busca antes de leer en bruto: localiza con grep/glob/search antes de abrir archivos completos;
- lee solo lo relevante para la tarea actual, no todo el módulo "por si acaso";
- no pegues logs o salidas enormes en el contexto principal si un resumen basta;
- consulta documentación externa actual solo cuando la corrección dependa de la versión o del comportamiento de una dependencia o API (sintaxis cambiante, deprecaciones); si la evidencia del repositorio basta, no la recuperes, y pide solo el fragmento necesario;
- delega exploración amplia en subagentes de solo lectura cuando no necesite escribir código;
- resume y cierra una investigación terminada en vez de dejarla dispersa en el historial;
- persiste solo aprendizajes duraderos (ver `Scar → Rule` en `SKILL.md`; persistirlos en la skill o en `AGENTS.md` requiere aprobación), no cada paso intermedio o comando ejecutado;
- si el runtime señala que se acerca una compactación de contexto o el trabajo cruza sesiones, deja antes un checkpoint corto (ver "Checkpoint ligero" en `SKILL.md`) cuando sea factible.

El objetivo es mantener el contexto enfocado en la tarea, no maximizar cobertura de lectura.
