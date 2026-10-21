# Gestor de Tareas ICE

Aplicación web de una sola página para crear tareas y priorizarlas con el modelo ICE: puntuación = Impacto × Confianza / Esfuerzo, con valores enteros de 1 a 10. Google Gemini puede sugerir los tres valores a partir del título y la descripción de la tarea.

Stack: React, TypeScript (`strict`), Vite y Material UI. No hay backend: el navegador llama directamente a la API de Gemini.

## Comandos

- Instalar: `npm install` y `cp .env.example .env`. La clave de Gemini va en `VITE_GEMINI_API_KEY`; sin ella la app funciona, pero la sugerencia de IA muestra un error.
- `npm run dev`: servidor de desarrollo (normalmente en http://localhost:5173).
- `npm run check`: ejecuta `typecheck`, `lint` y `format:check`. Pásalo antes de dar un cambio por terminado.
- `npm run lint:fix` y `npm run format`: corrigen automáticamente lo que pueden.
- `npm run build`: comprueba los tipos y genera `dist/`.
- No hay tests ni framework de tests. Verifica con `npm run check` y probando la app con `npm run dev`.

## Arquitectura

### Capas

Todo el código está en `src/`, en carpetas planas por tipo de archivo:

- `types/`: tipos de dominio (`Task`, `NewTask`, `TaskUpdate`, `IceScore`, `IceScoreDraft`). Sin lógica.
- `utils/`: funciones puras (cálculo y validación ICE) y las constantes `MIN_ICE_VALUE` y `MAX_ICE_VALUE`.
- `services/`: comunicación con APIs externas. `aiIceService.ts` llama a Gemini con `fetch`, valida la respuesta y traduce cada fallo a un mensaje para el usuario.
- `hooks/`: estado y lógica de React. `useTaskManager` gestiona la lista, `useTaskForm` el formulario y `useIceSuggestion` la petición a la IA.
- `components/`: interfaz construida con componentes de MUI.
- `App.tsx`: raíz. Usa `useTaskManager`, elige entre la lista y el estado vacío y abre o cierra el formulario.
- `main.tsx`: punto de entrada y tema de MUI (`createTheme`).

### Reglas de dependencia

- `types/` no importa nada del proyecto; `utils/` solo importa `types/`.
- `services/` importa `utils/` y `types/`; nunca React ni componentes.
- `hooks/` importan `services/`, `utils/` y `types/`.
- Los componentes importan hooks, `utils/`, `types/` y otros componentes, pero nunca `services/`: llegan a la IA a través de un hook.
- Solo `App.tsx` y `TaskFormDialog` usan hooks con estado. El resto de componentes son de presentación: reciben datos y callbacks por props y no tienen estado.

### Flujo de datos

1. `useTaskManager` guarda `tasks` con `useState` y deriva `sortedTasks` (ICE descendente) con `useMemo`.
2. `App` pasa `sortedTasks` a `TaskList`, que pinta un `TaskItem` por tarea.
3. Las acciones de `TaskItem` (`onToggleStatus`, `onDelete`, `onEdit`) suben por callbacks hasta `App`.
4. `App` monta `TaskFormDialog` con la tarea que se edita, o con `null` para crear una nueva.
5. El diálogo usa `useTaskForm` (valores, ICE calculado y `taskToSave`) y `useIceSuggestion` (`loading`, `error` y `suggestion`).
6. «Sugerir ICE con IA»: `requestSuggestion(taskText)` → `getIceSuggestion` → Gemini. Una sugerencia válida rellena los tres valores con `applyIceScore`, y el usuario puede ajustarla.
7. «Guardar»: `onSave(NewTask)` → `App` llama a `createTask` o `updateTask` y cierra el diálogo.

## Dónde va el código nuevo

| Código nuevo               | Ubicación                                               | Forma                                                                 |
| -------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Componente                 | `src/components/Nombre.tsx`                             | Uno por archivo; `function Nombre` y `export default Nombre` al final |
| Lógica con estado          | `src/hooks/useAlgo.ts`                                  | `export function useAlgo()` que devuelve un objeto                    |
| Llamada a una API externa  | `src/services/algoService.ts`                           | Exportaciones con nombre; errores como subclase de `Error`            |
| Función pura               | `src/utils/verboAlgo.ts`                                | Exportación con nombre                                                |
| Tipo de dominio            | `src/types/Nombre.ts`                                   | `interface` o `type` exportado                                        |
| Campo nuevo del formulario | `useTaskForm`                                           | Nueva acción del reducer                                              |
| Variable de entorno        | `.env.example` y `ImportMetaEnv` en `src/vite-env.d.ts` | Prefijo `VITE_`                                                       |
| Colores o tipografía       | `createTheme` en `src/main.tsx`                         | Colores del tema, no valores sueltos en los componentes               |

Mantén las carpetas planas: no hay subcarpetas dentro de cada capa.

## Convenciones

- Identificadores en inglés; comentarios y textos de la interfaz en español.
- Escribe con tildes los textos y comentarios nuevos. Los existentes van sin tildes: no los corrijas si no te lo piden.
- Pon un comentario de una línea encima de cada componente, hook y función: `// nombreFuncion hace tal cosa.`
- Declara componentes, hooks, manejadores y funciones auxiliares con `function`. Usa funciones flecha solo en línea (JSX y callbacks).
- Anota el tipo de retorno de las funciones auxiliares y los manejadores; en componentes y hooks se deja inferir.
- Declara las props como `interface NombreProps` encima del componente y desestructúralas en la firma.
- Llama `onAlgo` a las props de callback y `handleAlgo` a los manejadores internos.
- Ordena alfabéticamente las props en JSX y las claves del objeto que devuelve cada hook.
- Escribe las constantes de módulo en `UPPER_SNAKE_CASE`. Las funciones auxiliares de un componente van a nivel de módulo, encima de él.
- Un componente no debe pasar de unas 150 líneas: si crece, extrae subcomponentes o lleva la lógica a un hook.
- Actualiza el estado sin mutarlo y con la forma funcional: `setTasks((currentTasks) => ...)`.
- Calcula los datos derivados con `useMemo` en lugar de guardarlos. La puntuación ICE nunca se guarda en la tarea: se calcula con `calculateIce`.
- Las operaciones asíncronas exponen `loading` y `error: string | null` desde su hook y ponen `error` a `null` al empezar. En la interfaz, la carga se muestra con `CircularProgress` y el error con `Alert severity="error"`.
- Los servicios lanzan su propia subclase de `Error` (como `AiIceServiceError`) con un mensaje legible para el usuario. El hook expone ese mensaje en `error`, o uno genérico si el error es de otro tipo.
- Trata como `unknown` los datos externos y valídalos antes de usarlos; usa `as` solo después de validar.
- Da estilos con la prop `sx` y los colores del tema (`primary.main`, `text.secondary`). No hay archivos CSS.

## Trampas y decisiones no evidentes

- La clave de Gemini se incrusta en el JavaScript del build, como cualquier variable `VITE_`. No publiques un build con una clave real ni guardes otros secretos en variables `VITE_`.
- No leas ni muestres `.env`: contiene la clave real. Documenta las variables nuevas en `.env.example`.
- No hay persistencia: las tareas viven en memoria y se pierden al recargar la página.
- `TaskFormDialog` solo se monta mientras está abierto (`isFormOpen && …`), y así su estado se reinicia en cada apertura. Si pasas a usar `open={isFormOpen}`, tendrás que reiniciar el estado a mano.
- En el formulario, los valores ICE empiezan en `null` (`IceScoreDraft`). «Guardar» sigue deshabilitado hasta que haya título y los tres valores; `getValidIceScore` convierte el borrador en un `IceScore`.
- Los valores ICE son enteros de 1 a 10. Valídalos siempre con `isValidIceValue` o `getValidIceScore`, también los que devuelve la IA.
- La sugerencia de IA usa el título y la descripción juntos (`taskText`); basta con que uno de los dos tenga texto.
- Las tareas completadas siguen en la lista, en su posición por ICE, con estilo atenuado.
- `npm run format:check` revisa todo el repositorio, también los `.md`: pasa `npm run format` después de editar la documentación.
- commitlint está en `devDependencies`, pero sin configuración ni hook: no valida los commits.

## Referencias visuales

- Bocetos de las pantallas: `design/app-screens.svg`, con una copia en `docs/app-screens.png`. Consúltalos antes de cambiar la interfaz.
