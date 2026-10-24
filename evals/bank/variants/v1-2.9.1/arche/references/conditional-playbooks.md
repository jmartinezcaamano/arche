# Playbooks condicionales

No los actives por defecto. Detecta si el proyecto/cambio necesita alguno y añade sus controles a spec/plan/gates de forma proporcional.

## Seguridad / AppSec
Cuando exista superficie de ataque relevante, auth/authz, multi-tenant, datos sensibles, pagos, uploads, cambios L4 o IA con capacidad de actuar, carga `security-playbook.md`. No dupliques aquí su checklist; selecciona controles por riesgo.

## IA / RAG / agentes
Considera:
- propósito y riesgo de cada capability;
- modelo/prompt/versionado;
- contexto permitido/prohibido;
- RAG/retrieval y groundedness;
- tools con permisos mínimos;
- structured outputs/validación;
- prompt injection/exfiltración/tool misuse;
- límites de pasos/tokens/coste;
- evals/golden set/rubrics;
- trazas, latencia, coste y fallback;
- human escalation;
- si existe input no confiable, RAG, tools, MCP o acciones autónomas, aplica también las secciones GenAI/Agentic de `security-playbook.md`.

## Pagos
Considera:
- proveedor y webhooks;
- idempotencia;
- estados de pago;
- retries/timeouts;
- reconciliación;
- seguridad/PCI scope;
- errores y reembolsos;
- test mode;
- evidencias E2E;
- autorización explícita antes de cobros reales.

## Mobile / App Store / Play Store
Considera:
- permisos;
- deep links/push;
- offline/conectividad;
- secure storage;
- builds/signing;
- TestFlight/internal testing;
- store privacy/disclosures;
- screenshots/metadata;
- crash reporting;
- actualización/compatibilidad.

## Offline / sincronización
Considera:
- source of truth;
- modelo local;
- colas y reintentos;
- conflictos y resolución;
- idempotencia;
- borrados/tombstones;
- conectividad parcial;
- recovery;
- tests deterministas de sync.

## Multi-tenant
Considera:
- tenant boundaries;
- RLS/authz;
- queries/scoping;
- storage paths;
- cache/log isolation;
- background jobs;
- exports/imports;
- tests negativos de aislamiento.

## i18n
Considera:
- locale source;
- formatos fecha/número/moneda;
- pluralización;
- longitud de textos/layout;
- fallback;
- contenido dinámico/IA;
- SEO/store metadata cuando aplique.

## Datos sensibles / compliance
Considera:
- minimización;
- clasificación de datos;
- base legal/consentimiento;
- cifrado;
- acceso mínimo;
- auditabilidad;
- retención/eliminación/exportación;
- proveedores/subprocesadores;
- logs sin datos innecesarios;
- threat model y revisión legal específica.

## Webhooks / jobs / asíncrono
Considera:
- autenticidad/firma;
- idempotencia;
- retries/backoff;
- timeouts;
- ordering;
- dead-letter/replay;
- observabilidad;
- duplicados;
- jobs largos y cancelación.

## Alta disponibilidad / criticidad
Solo cuando esté justificado:
- SLO/SLA;
- redundancy;
- health checks;
- backpressure/rate limiting;
- failover;
- backups + restore;
- RPO/RTO;
- capacity/load testing;
- incident runbooks;
- chaos/recovery drills proporcionales.

## Migración / refactor mayor
Actívalo cuando el objetivo sea sustituir tecnología, reorganizar arquitectura o transformar muchas unidades preservando comportamiento. La dificultad depende más de fronteras/contratos/estado que del número de líneas.

Considera:
- definir comportamiento que debe permanecer y cambios permitidos;
- establecer un **oracle** independiente antes de modificar: characterization tests, contratos, E2E, snapshots útiles o comparación contra sistema anterior;
- congelar ese oracle durante el tramo que pretende preservar comportamiento; si cambia el requisito, cambia spec/oracle explícitamente;
- dividir por slices/compatibility seams y mantener el sistema ejecutable entre pasos;
- adapters/dual-run/shadow/comparison cuando reduzcan riesgo;
- checkpoints de integración y regresión tempranos;
- rollback/compatibilidad de datos cuando aplique;
- si se paraleliza, usar coordinador, ownership claro y worktrees/branches aislados;
- medir progreso por comportamiento preservado/migrado, no por archivos reescritos.

No reescribas tests/oracles junto a la implementación solo para obtener verde.

## DDD / dominio complejo
Actívalo solo cuando exista complejidad real de negocio: reglas, invariantes, vocabulario ambiguo, múltiples subdominios o cambios frecuentes de comportamiento. No lo uses para CRUD sencillo por ceremonia.

Considera proporcionalmente:
- **lenguaje ubicuo**: usa en specs, código y conversaciones los mismos términos que el dominio; detecta sinónimos, polisemia y conceptos ambiguos antes de diseñar;
- **bounded contexts**: permite que el mismo término tenga modelos distintos cuando su significado o reglas cambian entre contextos; evita un modelo universal forzado;
- **domain before persistence**: modela primero comportamiento e invariantes; decide schema, ORM o documentos después;
- **Value Objects** cuando un concepto tenga invariantes y semántica por valor (p. ej. Email, Money, Capacity), evitando primitives inválidos por construcción cuando compense;
- **Entities** cuando importe identidad y ciclo de vida;
- **Aggregates / Aggregate Roots** solo para límites reales de consistencia inmediata; protege invariantes a través del root y evita agregados gigantes;
- **Application Services / Use Cases** para orquestar IO/transacción y coordinación, manteniendo reglas de negocio relevantes en el dominio;
- **ports/adapters y repositories** únicamente en fronteras que necesiten desacoplamiento, testabilidad o reemplazo;
- **mappers explícitos** cuando dominio y persistencia tengan formas distintas, evitando contaminar el modelo con detalles del proveedor;
- **BDD/EDD** para probar el lenguaje y las reglas con escenarios concretos antes de implementar;
- **tests de dominio** rápidos y centrados en comportamiento/invariantes cuando esas reglas puedan verificarse sin infraestructura.

Prefiere modelos ricos solo donde exista comportamiento real. Un objeto de datos simple puede seguir siendo simple. DDD debe reducir complejidad accidental, no crearla.

