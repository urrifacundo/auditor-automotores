# Auditor de Automotores

Auditor específico para detectar automotores (no motovehículos) a partir del relato crudo de Cassandra.

## V1
El primer botón clasifica candidatos en:
- SUSTRAIDO: automotor efectivamente sustraído sin recuperación en la misma secuencia.
- INMEDIATO: sustracción + recuperación/localización en la misma secuencia narrativa.
- HALLAZGO: hallazgo/recuperación de un automotor previamente sustraído, sin sustracción actual narrada.

La carátula de Quirón es evidencia auxiliar, nunca la fuente de verdad.

## Principio de diseño
Alta precisión antes que cantidad. Patente, ruedas, autopartes, pertenencias, tentativa y motovehículos no deben confundirse con sustracción de un automotor completo.

## Próxima etapa
Validar esta V1 contra el lote 1–10 de enero, revisar desacuerdos y convertir los errores reales en reglas de regresión. Luego incorporar el segundo botón para extraer marca, modelo, patente, motor y chasis.
