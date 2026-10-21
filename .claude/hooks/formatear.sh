#!/usr/bin/env bash
# formatear.sh formatea con Prettier el archivo que Claude Code acaba de editar (hook PostToolUse).

# Extrae tool_input.file_path del JSON que llega por la entrada estándar.
file_path=$(node -e '
  try {
    const input = JSON.parse(require("fs").readFileSync(0, "utf8"));
    process.stdout.write(input.tool_input?.file_path ?? "");
  } catch {
    // Sin JSON válido no hay ruta que formatear.
  }
')

if [ -z "$file_path" ]; then
  exit 0
fi

# npx debe encontrar el Prettier del proyecto, no descargar otra versión.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 2

if ! output=$(npx prettier --write --ignore-unknown --no-color "$file_path" 2>&1); then
  echo "Prettier no ha podido formatear $file_path:" >&2
  echo "$output" >&2
  exit 2
fi
