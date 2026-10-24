# Workflow — Release & Production Readiness

## Objetivo
Cerrar los gaps entre un MVP verificado y un producto seguro, observable y listo para producción; después lanzar y verificar.

No añadas features nuevas salvo que sean necesarias para readiness.

## 1. QA global
Usa `../references/verification-policy.md` como política común y revisa proporcionalmente:
- unit/integration/E2E/smoke;
- flujos completos entre features;
- navegadores/dispositivos;
- responsive;
- empty/loading/error states;
- edge cases;
- regresiones;
- accesibilidad;
- performance budgets;
- Design QA y microcopy;
- datos de prueba representativos;
- invariantes críticas;
- Product Quality Bar.

**Gate:** QA PASSED + PRODUCT QUALITY BAR PASSED.

## 2. Security
Carga `../references/security-playbook.md` cuando exista superficie de ataque material. Usa OWASP Top 10 como lente de riesgo y ASVS como fuente de requisitos verificables; para IA/agents usa además sus secciones GenAI/Agentic. No afirmes cumplimiento por ejecutar una lista o un scanner.

Revisa según riesgo:
- threat model;
- auth/authz/roles/RLS;
- inputs/endpoints/uploads;
- secrets;
- rate limiting/abuse;
- dependencias y supply chain;
- datos sensibles/logs;
- servicios externos;
- backups y restore;
- migraciones y rollback;
- invariantes críticas;
- controles ASVS pertinentes con evidencia cuando el riesgo lo justifique;
- tests negativos/aislamiento y revisión fresca en L4;
- scans/pentest/revisión especializada solo cuando aporten evidencia proporcional.

Reporta también riesgos residuales materiales.

**Gate:** SECURITY REVIEW PASSED.

## 3. Privacy & legal
Determina solo lo que aplica realmente al proyecto:
- RGPD/privacidad;
- términos/cookies/consentimiento;
- exportación/eliminación/retención;
- procesadores/subprocesadores;
- IA y servicios externos;
- requisitos Store;
- pagos/facturación.

No copies políticas genéricas sin análisis.

## 4. Observability & incident readiness
Asegura lo proporcional:
- error/crash tracking;
- logs/traces;
- health/performance;
- alertas;
- monitorización de dependencias;
- rollback;
- incident response/runbooks cuando aporten valor.

## 5. Analytics & cost control
Instrumenta solo lo útil para aprender:
- acquisition/activation/retention/conversion;
- funnels/feature usage;
- North Star cuando aplique.

Controla:
- hosting, DB, storage, bandwidth, emails, mapas, IA, APIs;
- coste por usuario/activo;
- límites, alerts, rate limits y degradación.

## 6. Beta
Cuando el riesgo/producto lo requiera:
- staging/TestFlight/testing;
- usuarios seleccionados;
- canal de feedback;
- bugs/métricas;
- feature flags/progressive rollout.

Separa **must fix before launch** de **can wait**.

**Gate:** BETA VALIDATED cuando aplique.

## 7. Commercial readiness
Cuando corresponda:
- naming/dominio/identidad;
- landing/pricing/free-premium;
- pagos;
- emails;
- onboarding;
- FAQ/soporte/contacto;
- stores/screenshots/copy;
- SEO/ASO.

## 8. Production Readiness Review
Comprueba como mínimo, cuando apliquen:
- Product/UX/Design/Architecture;
- Agentic Harness y automated verification;
- QA/Security/Privacy;
- backups + restore;
- observability/analytics/cost control;
- pagos/soporte/infraestructura;
- migration + rollback strategy;
- feature flags/rollout;
- SLO/reliability;
- supply-chain;
- accessibility/performance;
- incident response;
- test data/critical scenarios;
- AI evals.

**Gate:** READY FOR PRODUCTION.

## 9. Launch
Solo con autorización correspondiente:
- deploy producción;
- DB/migrations;
- DNS/stores;
- pagos/emails;
- monitoring/analytics;
- smoke tests;
- rollout progresivo cuando reduzca riesgo.

Si no se cumplen criterios, rollback.

El lanzamiento no termina con deploy exitoso: verifica en producción.

**Gate:** LAUNCHED & VERIFIED.

## Regla de autoridad
Tests/review/evidencia no autorizan por sí mismos push, merge, deploy, publicación ni release. Respeta permisos reales y approvals del runtime/repositorio/proyecto.
