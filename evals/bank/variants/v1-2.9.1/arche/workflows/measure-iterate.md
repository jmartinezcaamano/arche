# Workflow — Measure & Iterate

## Objetivo
Convertir uso real, feedback y operación en aprendizaje y siguientes decisiones de producto.

## Entrada
Producto o feature lanzada y verificable en producción.

## 0. Cadena de medición

Para una feature relevante, deja explícita esta cadena idealmente durante la spec o el release, no después de observar datos sueltos:

`FEATURE → EXPECTED USER OUTCOME → EVENT/SIGNAL → METRIC → BASELINE → POST-RELEASE → DECISION`

Ejemplo:
```text
Feature: acta de comunidad asistida por IA
Outcome esperado: reducir el tiempo de gestión del administrador
Signal: generación de acta completada
Metric: tiempo_hasta_acta_minutos, tasa_completado, ediciones_manuales, feedback (👍/👎)
Baseline: proceso manual actual
Post-release: comparar métrica real vs. baseline tras N usos
Decision: mantener / ajustar / simplificar / retirar
```

Si la feature no tiene esta cadena definida, defínela ahora antes de sacar conclusiones de "funciona" o "no funciona" a partir de intuición o feedback aislado.

## 1. Observar
Reúne señales relevantes, no métricas por acumulación:
- usuarios/activación;
- engagement/retención;
- conversión/churn;
- uso de features;
- bugs/crashes;
- performance/SLO;
- feedback/reviews/soporte;
- costes;
- alertas de seguridad/dependencias;
- calidad, coste y latencia de IA cuando aplique.

## 2. Comparar contra la hipótesis
Para features importantes revisa:
- ¿se utiliza?;
- ¿resuelve el problema?;
- ¿mejora la métrica o señal esperada?;
- ¿crea fricción nueva?;
- ¿aumenta errores o soporte?;
- ¿debe mantenerse, corregirse, simplificarse o eliminarse?

Una feature no es exitosa solo por estar lanzada.

## 3. Aprender y priorizar
Patrón:
`USAGE + FEEDBACK + SUPPORT + METRICS → LEARN → PRIORITIZE`.

Distingue:
- bug/regresión;
- deuda técnica;
- mejora UX;
- oportunidad de producto;
- experimento;
- problema de negocio/monetización;
- incidente/operación.

## 4. Experimentación
Cuando exista suficiente tráfico y una decisión real detrás, usa A/B tests, cohortes, flags o variantes. Cada experimento debe responder una hipótesis y una decisión. No experimentes por ritual.

## 5. Volver al ciclo
Según el resultado:
- cambio trivial → implementación directa + verificación proporcional;
- feature relevante → SDD;
- problema de arquitectura/producto → vuelve al workflow correspondiente;
- incidente → mitiga/recupera primero y deja aprendizaje/regresión test cuando proceda.

Ciclo:
`Learn → Spec → Build → Verify → Release → Measure`.

## Reporte
- qué aprendimos;
- evidencia/métricas;
- qué decisión se deriva;
- prioridad recomendada;
- siguiente workflow.
