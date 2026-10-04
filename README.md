# Auditor de Automotores

Auditor de automotores basado en el relato crudo de Cassandra. No toma la clasificación de Quirón como verdad.

## Arquitectura de tres filtros
1. **Detectar candidatos:** reduce el universo. No clasifica.
2. **Auditar candidatos:** exige relación contextual entre acción y automotor; clasifica SUSTRAIDO, INMEDIATO o HALLAZGO. Los descartados se conservan para revisar falsos negativos.
3. **Completar datos:** extracción final de patente, motor y chasis; marca/modelo se incorporarán después de validar reglas.

### Criterios
- INMEDIATO es una categoría propia: exige sustracción + recuperación/localización en la misma secuencia.
- HALLAZGO es recuperación/localización de un automotor previamente sustraído sin narrar una sustracción actual.
- Patentes, ruedas, autopartes, pertenencias, motos y menciones circunstanciales no deben confundirse con un automotor sustraído.
- Caso de regresión: una denuncia de Lesiones que dice “secuestro de la ropa” y “trasladado en auto particular” debe descartarse.

El objetivo durante el desarrollo es alta precisión y trazabilidad, no maximizar candidatos.
