# Security Playbook — AppSec, OWASP y AI Security

## Propósito
Aplicar seguridad de forma **proporcional, verificable y temprana** sin convertir ĀRCHE en una checklist de compliance.

Principios:
- security by design + shift-left;
- least privilege y deny-by-default cuando corresponda;
- trust boundaries explícitas;
- controles verificables por encima de declaraciones de confianza;
- automatizar checks repetibles, pero no asumir que una herramienta cubre el riesgo completo;
- **no afirmar cumplimiento OWASP/ASVS** salvo que exista un alcance definido, requisitos mapeados y evidencia suficiente.

## Cuándo cargar este playbook
Cárgalo cuando exista al menos uno de estos factores:
- aplicación/API expuesta a Internet o entrada no confiable relevante;
- autenticación, autorización, roles, RLS o multi-tenant;
- datos personales, sensibles o secretos;
- pagos, operaciones destructivas o privilegios elevados;
- uploads, webhooks, integraciones o ejecución asíncrona con impacto;
- cambio L4 de `risk-policy.md`;
- nueva trust boundary o superficie de ataque material;
- IA generativa con RAG, tools, MCP, agentes, memoria o acciones autónomas.

Para cambios triviales sin impacto de seguridad, no actives una auditoría completa.

## 1. Security preflight
Antes de diseñar o implementar un cambio relevante, identifica de forma ligera:
- activos que deben protegerse;
- actores legítimos y adversarios plausibles;
- entradas no confiables;
- trust boundaries;
- permisos/capabilities;
- datos sensibles y secretos;
- dependencias/proveedores;
- operaciones irreversibles o con dinero;
- abuso/misuse cases principales;
- impacto y reversibilidad si falla un control.

No generes un threat model formal por defecto. Hazlo cuando el riesgo o la arquitectura lo justifiquen.

## 2. OWASP Top 10 como lente de riesgo
Usa la versión estable actual de **OWASP Top 10** como awareness/risk lens. Baseline de esta skill: **OWASP Top 10:2025**.

Las baselines de este playbook (OWASP Top 10:2025, ASVS 5.0.0, OWASP GenAI LLM Top 10 2026 y OWASP Top 10 for Agentic Applications 2026) se verificaron el 2026-10-02. Son una referencia, no un techo: si hay una edición estable posterior, usa esa.

Revisa proporcionalmente:
1. Broken Access Control.
2. Security Misconfiguration.
3. Software Supply Chain Failures.
4. Cryptographic Failures.
5. Injection.
6. Insecure Design.
7. Authentication Failures.
8. Software or Data Integrity Failures.
9. Security Logging and Alerting Failures.
10. Mishandling of Exceptional Conditions.

El Top 10 **no es una especificación completa de controles ni una certificación**. Úsalo para descubrir riesgos que pueden haberse omitido.

Si existe acceso a fuentes actuales, verifica si hay una versión estable más reciente antes de fijar requisitos nuevos.

## 3. ASVS como fuente de requisitos verificables
Para controles técnicos concretos usa **OWASP ASVS** como referencia. Baseline de esta skill: **ASVS 5.0.0**.

Reglas:
- selecciona únicamente requisitos ASVS pertinentes al riesgo y superficie del cambio;
- referencia la versión junto al requisito cuando se persista en specs/auditorías;
- convierte los requisitos relevantes en checks/evidencia cuando sea viable;
- no copies cientos de requisitos a una spec;
- no declares "ASVS compliant" si no se ha definido alcance, nivel/criterio y verificado el conjunto correspondiente.

Patrón:

```text
SECURITY RISK
↓
CONTROL REQUIREMENT
↓
CHECK / TEST / SCAN / REVIEW
↓
EVIDENCE
↓
RESIDUAL RISK
```

## 4. Controles de aplicación a considerar
Selecciona por arquitectura y riesgo, no como checklist universal:
- autorización server-side, object-level y function-level;
- aislamiento tenant/RLS y tests negativos;
- autenticación, sesión, recuperación y MFA cuando proceda;
- validación de inputs y encoding/output handling;
- queries parametrizadas y prevención de injection;
- SSRF/egress restrictions cuando exista fetch de URLs o servicios internos;
- uploads: tipo/tamaño/contenido/storage/nombre/permisos;
- secrets fuera del código, rotación y scopes mínimos;
- criptografía con primitivas y librerías maduras, no diseño propio;
- CORS, CSP, headers y cookies seguras cuando apliquen;
- CSRF cuando exista autenticación basada en cookies y superficie afectada;
- rate limits, cuotas, anti-abuse y protección frente a consumo no acotado;
- manejo seguro de errores y exceptional conditions;
- logging/alerting útil sin filtrar secretos o datos innecesarios;
- integridad de software/datos, pipelines y artefactos;
- dependencias, lockfiles, provenance y supply chain;
- backups/restore y recuperación cuando la criticidad lo exija.

## 5. Security verification por riesgo
### L1–L2
Solo checks afectados: lint/typecheck, headers/config relevantes, visual/behavioral checks y revisión de exposición accidental cuando aplique.

### L3
Añade según caso:
- tests negativos;
- authz/permissions tests;
- integration/contract tests;
- secret/dependency scanning;
- validación de inputs/outputs;
- checks de configuración e infraestructura afectada.

### L4
Exige evidencia reforzada:
- tests negativos y de aislamiento;
- fresh/independent review (mecanismo y alternativa si el runtime no lo permite en `execution-policy.md`);
- threat model proporcional;
- controles ASVS pertinentes mapeados a evidencia;
- scans automáticos pertinentes (p. ej. SAST/SCA/secrets/IaC) cuando la tecnología lo permita;
- DAST/pentest o revisión manual especializada cuando el impacto lo justifique;
- rollback/recovery y autorización humana para acciones de alto impacto.

Una herramienta verde no demuestra por sí sola que el sistema sea seguro.

## 6. Supply chain y dependencias
Antes de introducir una dependencia/proveedor relevante considera:
- necesidad;
- mantenimiento y reputación;
- licencia;
- vulnerabilidades conocidas;
- permisos/scopes;
- datos enviados;
- lock/version pinning cuando corresponda;
- coste de sustitución;
- actualización y respuesta ante advisories.

Cuando sea útil, automatiza SCA/dependency alerts y secret scanning en CI.

## 7. GenAI / LLM security
Si el producto incorpora LLMs, RAG o capacidades generativas, además del AppSec tradicional usa la versión estable actual del **OWASP GenAI LLM Top 10**. Baseline de esta skill: **OWASP GenAI LLM Top 10 2026**.

Considera especialmente:
- prompt injection directa e indirecta;
- disclosure/exfiltración de información sensible;
- improper output handling: nunca trates output del modelo como input confiable para HTML, SQL, shell, APIs o acciones;
- poisoning de datos/retrieval/contexto;
- supply chain de modelos, datasets, prompts, tools y plugins;
- excessive agency y permisos excesivos;
- límites de consumo, coste y disponibilidad;
- evaluación de seguridad dentro de Eval Coverage.

Los controles deterministas deben vivir fuera del modelo siempre que sea posible: autorización, scopes, validación, límites, schemas y confirmaciones no deben depender solo de instrucciones del prompt.

## 8. Agentic AI / tools / MCP
Si un agente puede actuar, ejecutar tools, usar MCP, persistir memoria o coordinar otros agentes, carga además la versión estable actual del **OWASP Top 10 for Agentic Applications**. Baseline de esta skill: **2026**.

Modela al menos:
- goal hijacking;
- tool misuse;
- identity & privilege abuse;
- agentic supply-chain / MCP trust;
- unexpected code execution;
- memory/context poisoning;
- inter-agent communication no confiable;
- cascading failures;
- human-agent trust exploitation;
- rogue/misaligned behavior.

Controles preferidos:
- capabilities explícitas y mínimo privilegio;
- allowlists de tools/acciones y schemas estrictos;
- separación entre reasoning/output y autorización real;
- confirmación humana para acciones irreversibles, dinero, datos sensibles o blast radius alto;
- sandboxing cuando exista ejecución de código o contenido no confiable;
- límites de pasos, tiempo, coste y egress;
- provenance/validación de MCP, tools, memory y mensajes inter-agente;
- logs auditables de acciones críticas;
- kill switch / cancelación / rollback cuando el caso lo justifique.

### Runtime governance basado en intención
Cuando un agente pueda producir efectos reales, una tool call válida sintácticamente y permitida por scope puede seguir siendo peligrosa. Para casos de riesgo medio/alto considera una capa externa al modelo que evalúe:
- intención de la acción frente a la petición del usuario y reglas del negocio;
- target, volumen, frecuencia y magnitud;
- secuencias de acciones a través de varios turnos/agentes, no solo cada llamada aislada;
- límites acumulados de dinero, mensajes, registros, borrados, egress, tokens o coste;
- anomalías de comportamiento y cambios bruscos respecto al patrón esperado;
- audit trail suficiente para reconstruir quién/qué/por qué ejecutó una acción.

Patrón preferido cuando se justifique:

`USER INTENT → AGENT PROPOSES ACTION → POLICY/INTENT GATE → AUTHORIZATION/BUSINESS RULE → EXECUTE → AUDIT`

Mantén controles deterministas para límites duros. Una segunda IA/policy engine puede ayudar a juzgar intención, pero no debe ser la única barrera para acciones críticas.

## 9. Security Coverage
No persigas una cifra genérica de "security coverage". Usa trazabilidad:

```text
THREAT / SECURITY REQUIREMENT
↓
CONTROL
↓
CHECK
↓
EVIDENCE
```

En specs relevantes, identifica qué riesgos importantes tienen evidencia y cuáles quedan como riesgo residual aceptado, mitigado o pendiente.

## 10. Gate de seguridad
`SECURITY REVIEW PASSED` significa:
- riesgos materiales identificados;
- controles requeridos implementados;
- checks proporcionales ejecutados sobre el candidato actual;
- hallazgos críticos/altos resueltos o explícitamente bloqueando release;
- riesgos residuales relevantes reportados;
- evidencia fresca para el estado que se pretende liberar.

No significa "no existen vulnerabilidades".
