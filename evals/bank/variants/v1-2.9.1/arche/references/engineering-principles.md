# Principios transversales de ingeniería

Aplica siempre el principio; implementa la práctica solo cuando el riesgo, complejidad y madurez la justifiquen.

1. **Trunk-based por defecto** — ramas pequeñas/cortas, integración frecuente, main saludable.
2. **Deploy ≠ Release** — flags/rollout cuando reduzcan riesgo; no montar infraestructura compleja sin necesidad.
3. **Preview environments** — demostrar `código → ejecución → comportamiento → evidencia` cuando sea viable.
4. **Contract-first boundaries** — tipos/schemas/OpenAPI/interfaces/eventos claros entre módulos y servicios.
5. **Schema evolution is code** — migraciones versionadas, reproducibles, verificables y reversibles cuando proceda.
6. **Observability from day one** — logs/errores/métricas/trazas útiles también para debugging de agentes.
7. **Security shift-left** — secrets, inputs, endpoints, auth/authz, uploads y dependencias durante todo el ciclo.
8. **Supply-chain awareness** — necesidad, mantenimiento, licencia, confianza, superficie de ataque y coste de reemplazo.
9. **Resilience by design** — retries, timeouts, idempotencia, fallbacks, circuit breakers y recuperación donde existan fallos parciales.
10. **Reliability measurable** — SLO/latencia/error/crash-free/health checks solo cuando aporten valor.
11. **Lightweight ADRs** — registrar decisiones arquitectónicas relevantes, no decisiones triviales.
12. **Executable specifications** — `requirement → acceptance criteria → check → evidence`.
13. **Agent-legible architecture** — estructura predecible, nombres explícitos, módulos pequeños, contratos claros, pocos patrones y menos magia.
14. **Product Quality Bar** — technically done no equivale a product done.
15. **Design QA** — jerarquía, spacing, tipografía, componentes, responsive, motion, estados y consistencia.
16. **Content design** — botones, labels, errores, empty states, onboarding, permisos, notificaciones y emails forman parte del producto.
17. **Performance budgets** — medir y fijar límites cuando el producto lo necesite; no optimizar a ciegas.
18. **Accessibility by default** — contraste, teclado/focus, semántica, lectores, targets táctiles, reduced motion y errores comprensibles.
19. **Reproducible test data** — seeds/fixtures/factories/usuarios y estados conocidos cuando mejoren QA/debugging.
20. **Data invariants** — proteger condiciones que nunca deben romperse en DB/backend/contratos/tests/permisos.
21. **Backup is not recovery** — probar restores y RPO/RTO cuando el riesgo lo requiera.
22. **Incident response** — detectar, clasificar, mitigar, rollback, comunicar, recuperar y evitar recurrencia.
23. **Dependency lifecycle** — actualizar, vigilar, eliminar dependencias inútiles y gestionar breaking changes.
24. **Experimentation** — experimentos solo con hipótesis y decisión asociada.
25. **Feedback loop** — uso + feedback + soporte + métricas vuelven al producto.
26. **Post-release review** — evaluar resultado real de features importantes.
27. **Privacy by design** — minimización, finalidad, retención, acceso, separación, consentimiento, eliminación/exportación y logs prudentes.
28. **AI quality / LLMOps** — prompts/modelos/retrieval/tools versionables y evaluables; seguridad, coste, latencia, observabilidad y fallback.
29. **Reproducible environments** — `clone → install → configure → seed → run → verify` con mínimo conocimiento tribal.
30. **Walking Skeleton → Vertical Slices** — demuestra primero el recorrido técnico esencial y construye después funcionalidades completas de extremo a extremo, evitando fases horizontales largas de “todo frontend” o “todo backend”.
31. **Architectural Fitness Functions** — cuando una regla arquitectónica sea importante y automatizable, conviértela en un check: límites de imports, acceso a datos, dependencias permitidas, contratos o invariantes estructurales.
32. **Explicit trust boundaries** — cliente, backend, dominio, datos y proveedores deben tener fronteras de confianza claras. Autorización, secretos, pagos, operaciones privilegiadas y validaciones críticas no deben descansar solo en el cliente.
33. **External providers behind adapters** — encapsula proveedores externos detrás de puertos/adaptadores cuando reduzca acoplamiento, facilite tests o haga razonable su reemplazo. No abstraigas por ritual.
34. **SPEC Coverage over vanity coverage** — prioriza saber qué requisitos y criterios de aceptación tienen evidencia suficiente. El code coverage puede ayudar, pero no sustituye la cobertura de comportamiento.
35. **Eval Coverage for probabilistic capabilities** — cuando haya IA, identifica comportamientos relevantes y casos de evaluación representativos. No persigas una cifra vacía; persigue cobertura suficiente de riesgos y capacidades.
36. **Modular Monolith First** — para productos pequeños/medianos, prefiere un monolito modular antes de distribuir el sistema, salvo razones claras de escala, aislamiento, equipos o despliegue independiente.
37. **Pragmatic DDD / Clean / Hexagonal** — usa lenguaje de dominio, límites y dependencias dirigidas cuando clarifiquen complejidad real. No fabriques capas, repositorios o factories sin una necesidad concreta.
38. **Agent contracts, not vague delegation** — al delegar trabajo relevante, especifica rol, objetivo, alcance, permisos, límites, contexto y output esperado. Reutiliza policies existentes y evita documentos ceremoniales.
39. **Scar → Rule** — un fallo relevante y generalizable debe poder convertirse en test, check, guardrail o instrucción persistente cuando eso reduzca recurrencia. No codifiques cada incidente puntual como burocracia.
40. **Blast-radius autonomy** — concede más autonomía donde el cambio es aislado y reversible; exige más protección y autorización al acercarse a main, datos compartidos, infraestructura crítica y producción.
41. **Agent/harness feedback loop** — cuando una skill, agente o instrucción falle de forma recurrente, mejora el harness con evidencia y vuelve a probarlo. Optimiza el sistema, no solo el código que produce.
42. **Domain language before data model** — cuando exista lógica de negocio relevante, modela primero comportamiento, reglas e invariantes usando el lenguaje del dominio; no dejes que tablas, DTOs o detalles de persistencia definan el modelo por defecto.
43. **Context boundaries before universal models** — si un mismo término cambia de significado, reglas o responsabilidades según el área del negocio, considera bounded contexts explícitos en lugar de forzar un único modelo compartido.


44. **Risk and execution complexity are orthogonal** — separa el daño potencial de la dificultad de ejecución. Usa riesgo para rigor/autorización y complejidad para slicing, contexto, coordinación e integración.
45. **Coordinator owns integration** — en trabajo paralelo, un coordinador debe mantener dependencias, resolución de solapes, integración y evidencia final; peers sin autoridad de integración tienden a generar conflictos.
46. **Frozen oracle for behavior-preserving change** — migraciones/refactors deben preservar una referencia independiente de comportamiento antes de cambiar la implementación; cambia el oracle solo cuando cambia explícitamente el requisito.
47. **Behavioral evals for the harness** — trata skills, prompts y políticas como software: evalúa comportamientos esperados y regresiones cuando el harness cambie materialmente.
48. **Intent-aware agentic governance** — para agentes con capacidad de actuar, permisos válidos no bastan: cuando el riesgo lo justifique, valida intención, límites acumulados, secuencias anómalas y auditabilidad.
49. **Uncertainty is distinct from risk and complexity, but is represented through unresolved decisions** — la incertidumbre no se mide con un nivel autoevaluado: es la lista de decisiones materiales aún sin resolver. Descubre lo descubrible, asume y declara lo reversible, pregunta lo material (`clarification-policy.md`).

## Preferencia general
**Prefer boring, explicit and agent-legible architecture over clever architecture.**
