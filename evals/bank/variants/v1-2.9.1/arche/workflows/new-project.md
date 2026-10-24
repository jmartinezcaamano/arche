# Workflow — New Project

## Objetivo
Transformar una idea en un proyecto suficientemente definido para comenzar a construir sin diseñar de más.

## Entrada
Una idea nueva, un problema, una oportunidad o un producto aún no definido.

## Principio
**Problema y producto antes que código.** Utiliza grilling para descubrir contradicciones, supuestos débiles y decisiones prematuras.

## 1. Discovery
Descubre y cuestiona, según relevancia:
- problema real y contexto;
- usuario objetivo y quién paga;
- B2C / B2B / B2B2C;
- alternativas actuales y competencia;
- propuesta de valor y diferenciación;
- frecuencia de uso;
- hipótesis críticas;
- monetización cuando corresponda;
- riesgos de producto, negocio y adopción;
- qué debemos validar antes de construir;
- qué NO construiremos.

No bloquees el avance por falta de información perfecta. Distingue decisiones necesarias ahora de decisiones que pueden esperar.

**Gate intermedio:** IDEA VALIDATED ENOUGH TO DESIGN.

## 2. Product definition
Define lo mínimo necesario para alinear producto:
- visión;
- Jobs to be Done;
- casos de uso principales;
- user journeys críticos;
- roles;
- funcionalidades esenciales y secundarias;
- MVP;
- fuera de alcance;
- modelo de negocio cuando corresponda;
- criterios de éxito y señales de aprendizaje.

**Output recomendado:** `docs/product/product.md`.

## 3. UX & design direction
Define primero experiencia y sistema visual, no todas las pantallas.

### UX
- plataforma: web / mobile / ambas;
- enfoque mobile-first o web-first;
- navegación;
- onboarding;
- flujos críticos;
- empty/loading/error/success states;
- feedback al usuario;
- accesibilidad;
- capacidades especiales: cámara, GPS, QR, archivos, notificaciones, pagos, offline, etc.

### Diseño
- personalidad;
- referencias;
- principios visuales;
- tipografía;
- color;
- spacing/densidad;
- iconografía;
- motion;
- dark mode cuando aplique;
- Design System inicial cuando aporte valor.

**Output recomendado:** `docs/product/design.md`.

## 4. Technical architecture
No existe un stack obligatorio. Selecciona la solución más simple que cumpla necesidades reales.

Si existe `../references/technology-baseline.md`, úsalo como punto de partida preferido, no como obligación. Primero decide necesidades y después tecnología. La decisión final debe quedar en `docs/product/architecture.md`.

Evalúa proporcionalmente:
- frontend y backend;
- base de datos;
- auth y permisos;
- storage;
- APIs e integraciones;
- IA/RAG/agentes;
- mobile/offline/sync;
- observabilidad;
- seguridad y privacidad;
- escalabilidad;
- coste;
- estrategia de deploy;
- Agentic Development Harness necesario.

Prefiere arquitectura explícita, modular y legible por agentes. Como default, considera monolito modular antes que microservicios. Usa DDD/Clean/Hexagonal de forma pragmática cuando el dominio o las integraciones lo justifiquen.

Si existe complejidad de dominio relevante, define primero el **lenguaje ubicuo** y busca polisemia: un mismo término puede significar cosas distintas en áreas diferentes. Cuando cambien significado, reglas o responsabilidades, considera **bounded contexts** en lugar de diseñar un modelo universal. Modela comportamiento e invariantes antes de dejar que el schema o la persistencia dicten el dominio. Carga el playbook `DDD / dominio complejo` de `../references/conditional-playbooks.md` solo cuando aporte valor.

Haz explícitas las **trust boundaries** y evita que autorización, secretos, pagos, validaciones críticas u operaciones privilegiadas dependan únicamente del cliente.

Cuando reduzca acoplamiento o riesgo, coloca proveedores externos detrás de adapters/ports. Identifica además qué reglas arquitectónicas críticas merecen convertirse en checks automatizados para prevenir deriva.

**Output recomendado:** `docs/product/architecture.md`.

## 5. Requisitos del Agentic Harness
Antes de cerrar la definición, identifica qué necesitará un agente para poder construir y verificar de forma autónoma:
- comandos reproducibles;
- testing;
- preview/dev environment;
- logs/console;
- seeds/fixtures cuando apliquen;
- guardrails;
- contexto operativo portable en `AGENTS.md` cuando el runtime lo soporte; `CLAUDE.md` para instrucciones específicas/vendor o convención existente; solo si aporta valor;
- mecanismos de verificación real.

## Gate final
**PROJECT DEFINED** cuando existe claridad suficiente de producto, UX, arquitectura y harness para comenzar el bootstrap sin improvisar decisiones fundamentales.

## Reporte
Resume:
- decisiones tomadas;
- incertidumbres que pueden esperar;
- riesgos principales;
- artefactos creados/actualizados;
- siguiente gate: HARNESS READY + V0 VERIFIED.
