---
name: revisar-pr
description: Revisa una pull request de este repositorio y devuelve un informe con veredicto, criterios de aceptación, hallazgos con evidencia y estado de la CI y de los commits. Úsala cuando se pida revisar o validar una PR. No la uses para explicar código, revisar cambios que no están en una PR ni resolver issues.
argument-hint: [numero-pr]
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(npx commitlint *)
  - mcp__github__pull_request_read
  - mcp__github__list_pull_requests
  - mcp__github__issue_read
  - mcp__github__get_file_contents
  - mcp__github__actions_list
  - mcp__github__get_job_logs
---

Revisa una pull request de `bsebe/proyecto_curso` y devuelve un informe.

PR indicada: «$ARGUMENTS». Si está vacía, revisa la PR abierta de la rama actual.

## Límites

- Solo lees e informas. No comentes en la PR, no la apruebes, no pidas cambios, no la mergees, no edites archivos y no hagas push.
- Usa solo las herramientas de `allowed-tools`, aunque tengas otras disponibles.
- Si algo debería publicarse en GitHub, inclúyelo en el informe: lo decide el usuario en la conversación principal.
- Si te falta un dato o una herramienta, no lo supongas: anótalo en «Pendientes de verificar».

## Procedimiento

1. **Lee la PR.**
   - Sin número: saca la rama actual con `git log -1 --format=%D` (va tras `HEAD ->`) y busca su PR abierta con `mcp__github__list_pull_requests` (`head: "bsebe:<rama>"`, `state: "open"`). Si no hay ninguna, para y dilo.
   - Con `mcp__github__pull_request_read`: `get` (título, descripción, rama base y SHA de base y de cabeza), `get_commits` y `get_files`.
   - Lee con `mcp__github__issue_read` la issue que la descripción cierra con «Closes #n». Si no hay, anótalo y sigue.
   - CI del último commit: `get_check_runs` y `get_status`. Si un check ha fallado, busca su ejecución con `mcp__github__actions_list` (`list_workflow_runs`, filtrando por la rama) y lee los jobs fallidos con `mcp__github__get_job_logs` (`failed_only: true`, `return_content: true`). Quédate solo con las líneas del error.
   - Código: si los dos SHA están en local (`git log -1 <sha>` los encuentra), usa `git diff <sha-base>...<sha-cabeza>`; si no, `get_diff`. Read y Grep leen la copia de trabajo: úsalos solo si `HEAD` es el último commit de la PR. Si no, lee los archivos con `mcp__github__get_file_contents` y `sha: <sha-cabeza>`.
2. **Reúne las reglas.** Lee el `CLAUDE.md` de la rama base y aplica las reglas que afecten a los archivos cambiados. Cita la línea de CLAUDE.md en cada hallazgo que se apoye en una regla.
3. **Comprueba los criterios de aceptación.** Para cada criterio de la issue, decide si se cumple, no se cumple o no se puede verificar, con evidencia: `archivo:línea` del código de la PR, salida de la CI o SHA del commit. Un criterio no se puede verificar cuando la evidencia no está a tu alcance (por ejemplo, uno visual, o `npm run check` sin CI); di qué haría falta.
4. **Comprueba el proceso.** Además de lo que diga CLAUDE.md sobre ramas y pull requests:
   - La rama base es `dev`.
   - La rama sigue el formato `feature/<numero>-<descripcion>`, con el número de la issue que cierra.
   - La descripción incluye «Closes #n».
   - Cada mensaje de commit pasa commitlint: `npx commitlint --extends @commitlint/config-conventional --from <sha-base> --to <sha-cabeza>`. Se usa `--extends` porque el repositorio aún no tiene `commitlint.config.cjs`. Si los commits no están en local, no lo des por bueno: anótalo en pendientes (se traen con `git fetch origin pull/<n>/head`).
   - La CI está en verde: todos los checks del último commit han terminado con éxito. Si no hay checks, la CI está «sin CI», no «en verde».
5. **Señala lo que queda fuera de alcance**: cambios que la issue no pide y que no hacen falta para sus criterios.
6. **Distingue errores de riesgos.**
   - Error demostrado: la evidencia lo muestra sin suposiciones (una línea que incumple una regla citada, un check en rojo, un commit que commitlint rechaza, un criterio que el código no cumple).
   - Riesgo sin demostrar: algo plausible que no has podido comprobar. Di qué lo confirmaría.
   - No inventes hallazgos ni rellenes la lista. Si no hay defectos, dilo.
7. **Devuelve el informe.** Lee `${CLAUDE_SKILL_DIR}/formato-informe.md` y responde con el informe en ese formato. Es lo único que llega a la conversación principal: no incluyas el diff ni logs completos.
