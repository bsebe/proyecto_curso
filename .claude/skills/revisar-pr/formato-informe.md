# Formato del informe

Escribe el informe en español y en Markdown, con las secciones de la plantilla en este orden. Cita la evidencia como `ruta:línea`, nombre del check o SHA corto del commit. Si una sección no tiene contenido, escribe «Nada».

## Veredicto

- **Aprobable**: se cumplen todos los criterios verificables, el proceso es correcto y no hay errores demostrados.
- **Aprobable con cambios**: no hay errores de gravedad alta, pero hay errores de gravedad media o baja que conviene corregir antes de mergear.
- **No aprobable**: algún criterio no se cumple, la CI está en rojo o hay un error demostrado de gravedad alta.

Lo que no se ha podido verificar no rebaja el veredicto por sí solo, pero el motivo del veredicto lo menciona.

## Gravedad

- **Alta**: rompe un criterio de aceptación, la CI o el comportamiento de la aplicación.
- **Media**: incumple una regla de CLAUDE.md o del proceso sin romper nada.
- **Baja**: detalle o mejora que no bloquea.

## Plantilla

```markdown
## Revisión de la PR #{número}: {título}

**Veredicto: {Aprobable | Aprobable con cambios | No aprobable}.** {Motivo principal en una o dos frases.}

Issue: #{n} · Rama: `{rama}` → `{base}` · Último commit: `{sha corto}`

### Criterios de aceptación

| Criterio             | Estado                                      | Evidencia                      |
| -------------------- | ------------------------------------------- | ------------------------------ |
| {Texto del criterio} | {Se cumple / No se cumple / No verificable} | {`ruta:línea`, check o commit} |

### Hallazgos

{De mayor a menor gravedad. Si no hay: «No he encontrado defectos.»}

1. **[{Alta | Media | Baja}] {Título breve}** · {Error demostrado | Riesgo sin demostrar | Fuera de alcance}
   - Evidencia: {`ruta:línea`, check o commit}.
   - Impacto: {qué falla o qué podría fallar, y para quién}.
   - Comprobación sugerida: {cómo confirmarlo o comprobar el arreglo}.

### CI, commits y proceso

- CI: {En verde | En rojo | En curso | Sin CI}. {Checks y resultado; si falla, el paso y la línea del error.}
- Commits: {n}. commitlint: {todos pasan | los que fallan, con el error}.
- Rama base `dev`: {sí | no}. Formato de rama: {sí | no}. «Closes #n»: {sí | no}.

### Pendientes de verificar

- {Qué falta}: {por qué no se ha podido verificar} → {cómo verificarlo}.
```
