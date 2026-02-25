# AGENTS.md

## Fuente de verdad del proyecto

- `README.md` es la referencia principal para:
  - descripcion funcional del producto;
  - instrucciones de uso local;
  - estrategia de testing;
  - deploy en GitHub Pages.
- Evitar duplicar en este archivo instrucciones operativas que ya vivan en `README.md`.
- Si cambia el flujo de uso, testing o deploy, primero actualizar `README.md` y luego ajustar este `AGENTS.md` solo si cambia metodologia.

## Metodologia de trabajo

- Idioma: Espanol (salvo pedido explicito).
- Antes de editar archivos, describir en una frase el objetivo tecnico del cambio.
- Mantener la solucion simple, estatica y portable (sin build innecesario).
- Hacer cambios chicos y trazables por bloque funcional.
- No reescribir historial de commits salvo pedido explicito.

## Validacion y criterio de tests

- Siempre probar en local como default (`http://127.0.0.1:4173`).
- Seleccion de nivel de test segun impacto:
  - Solo docs/meta: validacion minima, sin E2E obligatorio.
  - Cambio acotado de bajo riesgo: `npm run test:e2e:quick`.
  - Cambio funcional o de riesgo medio/alto: `npm run test:e2e`.
- Si hay duda, usar el camino seguro: suite completa.
- Playwright MCP se usa para validacion manual complementaria (no reemplaza E2E automatizado).
- Si se realiza ronda manual con MCP, dejar el browser abierto para QA del usuario y recolectar logs de esa misma sesion ante fallas.

## Commits y publicacion

- Un commit por bloque de cambio relevante (feature, fix, docs, refactor).
- Despues de cada commit, push inmediato (`git push`).
- Mantener `main` deployable en GitHub Pages en todo momento.
