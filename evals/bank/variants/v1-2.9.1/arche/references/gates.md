# Gates de ĀRCHE

Un gate se supera con **evidencia**, no por intención. No exijas artefactos que no aporten valor.

## 1. PROJECT DEFINED
Debe existir claridad suficiente sobre:
- problema/usuario/propuesta de valor;
- alcance y MVP;
- UX/dirección de diseño;
- arquitectura y decisiones importantes;
- riesgos principales;
- requisitos básicos del Agentic Harness.

## 2. HARNESS READY
El repositorio ofrece contexto, comandos, límites y mecanismos suficientes para que un agente pueda construir, ejecutar, verificar, diagnosticar y corregir con autonomía proporcional.

## 3. V0 VERIFIED
Existe una aplicación real visible que demuestra el recorrido técnico esencial y ha sido ejecutada/verificada. Compilar por sí solo no basta.

## 4. MVP VERIFIED
El conjunto mínimo de funcionalidades resuelve el problema principal y cada feature relevante dispone de evidencia suficiente contra sus acceptance criteria.

## 5. QA / SECURITY / READINESS
Se han cerrado proporcionalmente los gaps de:
- calidad global/product quality;
- security;
- privacy/legal;
- observability;
- analytics;
- cost control;
- beta cuando aplique;
- commercial readiness.

## 6. READY FOR PRODUCTION
Production Readiness Review superada. Incluye cuando aplique:
- rollback/migrations;
- backups + restore;
- incident response;
- permissions/secrets;
- monitoring/alerts;
- feature rollout;
- SLO/reliability;
- accessibility/performance;
- AI evals;
- soporte y operación.

## 7. LAUNCHED & VERIFIED
El sistema fue desplegado/publicado con autorización válida y verificado en producción mediante smoke/health/critical checks. Un deploy exitoso sin verificación no supera el gate.

## 8. MEASURE & ITERATE
Existen señales reales de uso/operación suficientes para aprender, priorizar y volver al workflow apropiado.

## Regla de degradación
Si nueva evidencia invalida un gate —regresión, fallo de seguridad, migración problemática, restore fallido, etc.— considera el gate no demostrado hasta resolver y re-verificar.
