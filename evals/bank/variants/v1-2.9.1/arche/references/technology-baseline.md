# Baseline tecnológico preferido

Este archivo recoge **preferencias blandas** para acelerar decisiones en proyectos nuevos. No es un stack obligatorio.

Regla:

> Necesidades → dominio → NFR → restricciones → arquitectura → tecnología.

Si una preferencia no encaja, se cambia. La decisión final de cada proyecto vive en `docs/product/architecture.md` y prevalece sobre este baseline.

## Preferencias actuales

### Lenguaje
- **TypeScript** como lenguaje principal cuando encaje con la plataforma y el producto.

### UI
- **React** como capa de interfaz para productos web/universales cuando aporte valor.
- **Expo universal** como preferencia provisional para proyectos que busquen compartir una base relevante entre PWA/web, iOS y Android. Validar siempre compatibilidad con requisitos de plataforma, rendimiento, offline, mapas, cámara, notificaciones y distribución.

### Datos
- **PostgreSQL** como decisión estructural preferida para datos relacionales y dominio transaccional.
- **Neon** como proveedor PostgreSQL preferido sujeto a pruebas de requisitos, regiones, branching, conexiones, observabilidad, coste, backups/recovery y lock-in razonable.

### Offline / local data
- **IndexedDB** como preferencia web/PWA para persistencia local/offline cuando sea suficiente.
- **SQLite** como preferencia nativa/mobile para persistencia local/offline cuando el producto lo necesite.

## Regla de decisión

Para cada proyecto, ĀRCHE debe clasificar cada tecnología como:
- `ADOPT` — encaja y se usa;
- `ADAPT` — encaja con ajustes;
- `REPLACE` — existe una opción claramente mejor para ese proyecto;
- `DEFER` — la decisión puede esperar.

No preguntes al humano por defaults que puedan resolverse técnicamente sin cambiar producto, coste, riesgo o arquitectura de forma relevante. Escala solo los trade-offs que importen.
