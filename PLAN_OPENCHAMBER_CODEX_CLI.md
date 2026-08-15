# Plan de integración: OpenChamber + Codex CLI nativo

**Estado del documento:** plan de implementación  
**Objetivo:** permitir que OpenChamber ejecute **Codex CLI directamente en el servidor** mediante `codex app-server`, sin usar OpenCode como provider/proxy de Codex.  
**Base recomendada:** `openchamber/openchamber` `main` actual, incorporando de forma selectiva patrones del trabajo de Claude Engine y código del PR de Codex.  
**Fecha de análisis:** 2026-08-15

---

## 1. Directiva principal

La integración objetivo es:

```text
Browser
   |
   | HTTPS / SSE / WS
   v
OpenChamber
   |
   | ExecutionTarget / Harness Router
   v
Codex Adapter
   |
   | JSON-RPC 2.0 / stdio
   v
codex app-server
   |
   v
Codex CLI runtime
   |
   v
Repositorio / Git / Docker / tests del servidor
```

La arquitectura **NO** debe ser:

```text
OpenChamber
   |
   v
OpenCode
   |
   v
Codex como provider/plugin
```

OpenCode puede mantenerse inicialmente como infraestructura heredada de OpenChamber para sesiones auxiliares, shell u otras funciones ya existentes, pero **no debe formar parte de la ruta de inferencia ni de ejecución agentic de Codex**.

---

## 2. Resultado esperado

Al terminar la integración, OpenChamber debe permitir:

1. Seleccionar `Codex` como motor/harness de una sesión.
2. Crear una sesión OpenChamber asociada a un `thread` real de Codex.
3. Ejecutar prompts mediante `turn/start`.
4. Recibir streaming de texto, reasoning, tool calls, comandos y cambios de archivos.
5. Interrumpir un turno mediante `turn/interrupt`.
6. Reanudar conversaciones mediante `thread/resume`.
7. Mostrar y resolver approvals de Codex desde la UI de OpenChamber.
8. Mantener la ejecución en el servidor aunque el navegador se cierre.
9. Reabrir la sesión posteriormente desde otro navegador/dispositivo.
10. Mantener Git, diff, files, terminal, worktrees y demás superficies de OpenChamber.
11. Integrar progresivamente Queue, Goal, MultiRun, MCP, subagents y OpenChamber Tool.
12. No degradar el flujo actual de OpenCode.

---

# 3. Evidencia y código de referencia

## 3.1 OpenChamber actual

Repositorio:

- https://github.com/openchamber/openchamber

Issues:

- External coding harnesses:  
  https://github.com/openchamber/openchamber/issues/1559

El issue plantea explícitamente convertir OpenChamber en una GUI común para OpenCode, Claude Code, Codex CLI, Gemini CLI, Kiro, Cursor Agent, etc.

---

## 3.2 PR Codex ya existente

### PR #884 — backend-agnostic harness + Codex

- https://github.com/openchamber/openchamber/pull/884
- Rama: `backend-agnostic-harness`

Este PR ya implementó:

- abstracción de backend;
- Codex `app-server`;
- JSON-RPC;
- session bindings;
- threads;
- turns;
- streaming;
- approvals;
- questions;
- modelos;
- reasoning effort;
- abort;
- restore/reconnect;
- superficies backend-aware.

Archivos especialmente útiles:

```text
packages/web/server/lib/harness/codex-appserver.js
packages/web/server/lib/harness/codex-backend.js
packages/web/server/lib/harness/jsonrpc-subprocess.js
packages/web/server/lib/harness/session-bindings.js
packages/web/server/lib/harness/backends.js
```

**Uso recomendado:** tratar este PR como **fuente de implementación Codex**, no como base completa del producto.

Razón: es un cambio grande y antiguo respecto al `main` actual, con más de 160 archivos modificados. Conviene portar las piezas Codex útiles a una arquitectura más moderna y acotada.

---

# 3.3 Trabajo de Claude Code como Engine

### PR #2410 — Claude Code como Engine top-level

- https://github.com/openchamber/openchamber/pull/2410
- Rama histórica: `cursor/engines-claude-code-1c6e`

Este PR introduce el patrón más útil para diseñar Codex como motor independiente:

```text
OpenChamber
   |
   v
ExecutionTarget
   |
   +--> OpenCode
   |
   +--> Claude Code
```

Archivos/patrones importantes introducidos por este trabajo:

```text
packages/ui/src/types/harness.ts
packages/ui/src/lib/harness/*
packages/ui/src/stores/useHarnessStore.ts
packages/web/server/lib/harness/registry.js
packages/web/server/lib/harness/router.js
packages/web/server/lib/harness/routes.js
packages/web/server/lib/harness/session-bindings.js
packages/web/server/lib/harness/session-capabilities.js
packages/web/server/lib/harness/session-status.js
packages/web/server/lib/harness/session-messages.js
packages/web/server/lib/harness/translators/claude-code/*
```

La interfaz `ExecutionTarget` creada allí separa claramente la selección de motor de la selección de provider/model de OpenCode.

---

## 3.4 PRs Claude que resuelven problemas reutilizables

### Permissions + attachments + ordering

https://github.com/openchamber/openchamber/pull/2436

Útil para:

- mapping de eventos de herramientas;
- orden correcto `text -> tools -> final text`;
- PermissionCard;
- attachments;
- capability matrix.

### Queue + Stop + handoff + session titles

https://github.com/openchamber/openchamber/pull/2439

Útil para:

- sesión ocupada;
- queue de mensajes;
- abort;
- transición a idle;
- handoff entre motores;
- generación de título.

### Shell mode

https://github.com/openchamber/openchamber/pull/2454

Principio reutilizable:

> Shell es infraestructura del workspace/sesión y no necesariamente responsabilidad del motor agentic.

### Slash commands + MCP + subagents

https://github.com/openchamber/openchamber/pull/2461

Útil para diseñar:

- bridge MCP;
- capabilities;
- commands;
- subagents.

### Import de conversaciones nativas

https://github.com/openchamber/openchamber/pull/2466

Patrón útil:

```text
OpenChamber Session
      |
      +--> Harness Binding
              |
              +--> foreignSessionId
```

Para Codex:

```text
foreignSessionId = Codex threadId
```

### MultiRun + Goal + OpenChamber Tool

https://github.com/openchamber/openchamber/pull/2473

Útil para integrar Codex posteriormente en:

- MultiRun;
- Goal;
- OpenChamber MCP/control tool.

---

# 3.5 Integración Claude actual en `main`: NO copiar como arquitectura Codex

OpenChamber también incorporó recientemente:

- https://github.com/openchamber/opencode-claude

Esa integración funciona como:

```text
OpenChamber
   -> OpenCode
       -> @openchamber/opencode-claude
           -> OpenAI-compatible proxy
               -> Claude Agent SDK
                   -> Claude CLI
```

README:

- https://github.com/openchamber/opencode-claude/blob/main/README.md

Esta solución es útil como referencia de integración con un CLI externo, pero **no es el modelo objetivo de Codex**.

No crear:

```text
@openchamber/opencode-codex
```

para este proyecto.

---

# 3.6 Documentación oficial Codex

### App Server oficial

- https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md

`codex app-server` está diseñado específicamente para construir interfaces ricas alrededor de Codex.

Transportes documentados:

```text
stdio       -> JSONL, recomendado para proceso hijo local
websocket   -> experimental/no soportado para producción
unix socket -> control plane local
```

El primer MVP debe usar:

```bash
codex app-server
```

por `stdio`.

### Conceptos principales

Codex expone:

```text
Thread
  -> Turn
      -> Item
```

Mapping sugerido:

```text
OpenChamber session  <-> Codex thread
OpenChamber message  <-> Codex turn
OpenChamber part     <-> Codex item
```

### Métodos principales

```text
initialize
initialized

thread/start
thread/resume
thread/read
thread/list
thread/fork

turn/start
turn/interrupt

model/list

approval requests
question / request_user_input
```

### Generación de schemas

No hardcodear innecesariamente el protocolo.

Usar durante desarrollo:

```bash
codex app-server generate-ts --out ./generated/codex
codex app-server generate-json-schema --out ./generated/codex-schema
```

Estos schemas corresponden exactamente a la versión del Codex CLI instalada.

Referencia:

- https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md

### Daemon remoto

Referencia adicional:

- https://github.com/openai/codex/blob/main/codex-rs/app-server-daemon/README.md

No usar inicialmente. Puede evaluarse después para separar completamente el ciclo de vida de Codex de OpenChamber.

---

# 4. Decisión arquitectónica

## 4.1 Arquitectura objetivo

```text
                                  Browser
                                     |
                                     v
                               OpenChamber UI
                                     |
                               session-ui-store
                                     |
                              ExecutionTarget
                                     |
                     +---------------+---------------+
                     |                               |
                     v                               v
                OpenCode path                  Harness Router
                                                     |
                                           +---------+---------+
                                           |                   |
                                           v                   v
                                      Claude Code            Codex
                                           |                   |
                                     Agent SDK          Codex Adapter
                                                               |
                                                            JSON-RPC
                                                               |
                                                              stdio
                                                               |
                                                       codex app-server
                                                               |
                                                           Codex CLI
```

---

## 4.2 ExecutionTarget

Extender el concepto del Claude Engine:

```ts
type ExecutionTarget =
  | {
      harnessId: "opencode"
      providerId: string
      modelId: string
      agentName?: string
      variant?: string
    }
  | {
      harnessId: "claude-code"
      modelRef: string
      effort?: string
    }
  | {
      harnessId: "codex"
      modelRef: string
      effort?: string
      approvalPolicy?: string
      sandboxMode?: string
    }
```

Para la primera versión Codex, mantener el contrato mínimo:

```ts
type CodexExecutionTarget = {
  harnessId: "codex"
  modelRef: string
  effort?: string
}
```

Agregar opciones avanzadas después de validar el flujo principal.

---

# 5. Principios de implementación

## Regla 1 — Codex no pasa por OpenCode

Los prompts Codex deben seguir:

```text
ChatInput
  -> routeMessage()
      -> /api/harness/prompt
          -> codex translator
              -> codex app-server
```

Nunca:

```text
ChatInput
  -> OpenCode SDK
      -> provider Codex
```

---

## Regla 2 — mantener infraestructura compartida fuera del motor

Estas superficies deben seguir siendo responsabilidad de OpenChamber:

```text
Git
Diff
Files
Projects
Worktrees
Terminal
GitHub
Preview
Scheduler
Notes
UI state
```

El adapter Codex debe encargarse principalmente de:

```text
conversation/thread lifecycle
turn execution
streaming
tool events
reasoning
approvals/questions
usage
models
interrupt/resume
Codex-native MCP/session state
```

---

## Regla 3 — normalizar hacia el modelo que OpenChamber ya renderiza

No modificar toda la UI para entender eventos Codex.

Crear:

```text
Codex JSON-RPC notification
        |
        v
CodexEventTranslator
        |
        v
OpenChamber/OpenCode-shaped session/message/part events
        |
        v
existing sync reducer
```

Esto permite reutilizar:

- tool cards;
- reasoning UI;
- session status;
- notifications;
- queue;
- work status;
- transcript;
- subagent panels.

---

# 6. Estrategia de implementación recomendada

La integración debe dividirse en dos objetivos:

## Objetivo A — validar el runtime Codex

Antes de modificar mucho OpenChamber:

1. probar PR #884 en una instalación paralela;
2. comprobar que `codex app-server` funciona en el servidor;
3. validar auth;
4. validar streaming;
5. validar approvals;
6. validar resume;
7. identificar incompatibilidades con la versión actual del CLI.

Esto reduce el riesgo de portar código obsoleto.

## Objetivo B — integración mantenible sobre `main`

Después del spike:

1. partir de `main`;
2. introducir un harness mínimo;
3. incorporar Codex como tercer target;
4. portar solo el código necesario del #884;
5. implementar paridad progresiva.

---

# 7. Fase 0 — Preparación del entorno

## 7.1 Crear branch

```bash
git checkout main
git pull --ff-only

git checkout -b feat/codex-engine
```

## 7.2 Verificar herramientas

```bash
node --version
bun --version
git --version
codex --version
```

Codex debe ejecutarse con el mismo usuario Linux que ejecuta OpenChamber.

Verificar autenticación:

```bash
codex
```

o la forma de login disponible en la versión instalada.

No copiar manualmente tokens dentro de OpenChamber.

---

# 8. Fase 1 — Spike aislado con PR #884

Objetivo: confirmar que el código Codex existente sigue siendo compatible con la versión actual de `codex app-server`.

## 8.1 Clonar instancia separada

```bash
git clone https://github.com/openchamber/openchamber.git openchamber-codex-spike
cd openchamber-codex-spike
git checkout backend-agnostic-harness
bun install
```

## 8.2 Validar

```bash
bun run type-check
bun run lint
bun run build
```

## 8.3 Prueba manual mínima

Validar:

```text
[ ] Codex detectado
[ ] crear sesión
[ ] enviar prompt
[ ] streaming visible
[ ] ejecutar command
[ ] tool cards visibles
[ ] modificar archivo
[ ] approval visible
[ ] approve once
[ ] reject
[ ] abort
[ ] reload navegador
[ ] reabrir sesión
[ ] continuar thread
```

## 8.4 Resultado esperado del spike

Producir un archivo:

```text
docs/codex-spike-findings.md
```

con:

- versión Codex;
- eventos recibidos;
- incompatibilidades;
- métodos obsoletos;
- bugs;
- cambios necesarios antes de portar.

No continuar al port si `thread/start -> turn/start -> streaming -> resume` no funciona.

---

# 9. Fase 2 — Introducir Harness mínimo sobre `main`

No portar los 269 archivos del Claude Engine.

Extraer solo el contrato necesario.

## 9.1 Crear estructura

```text
packages/web/server/lib/harness/
  registry.js
  router.js
  routes.js
  session-bindings.js
  session-capabilities.js
  session-status.js
  session-messages.js
  events/
    emit.js
  translators/
    codex/
```

UI:

```text
packages/ui/src/types/harness.ts
packages/ui/src/lib/harness/
packages/ui/src/stores/useHarnessStore.ts
```

---

## 9.2 Harness IDs

```ts
type HarnessId =
  | "opencode"
  | "codex"
```

Claude puede añadirse después si se desea. No es requisito para este proyecto.

---

## 9.3 Capability registry

Tomar como referencia:

- https://github.com/openchamber/openchamber/pull/2410

Capabilities iniciales Codex:

```text
prompt             full
abort              full
resume             full
streaming-text     full
streaming-tools    full
permissions        full
images             partial / validar
file-attachments   partial / validar
shell              full por infraestructura OpenChamber
slash-commands     partial
mcp                partial
subagents          partial
multirun           none inicialmente
goal               none inicialmente
openchamber-tool   none inicialmente
```

No marcar una capability `full` hasta tener prueba funcional.

---

# 10. Fase 3 — Session bindings

Crear una asociación persistente:

```json
{
  "sessionId": "ses_openchamber_123",
  "harnessId": "codex",
  "foreignSessionId": "thr_codex_abc",
  "directory": "/srv/repos/project",
  "target": {
    "harnessId": "codex",
    "modelRef": "..."
  }
}
```

Referencia Claude:

- PR #2410
- `packages/web/server/lib/harness/session-bindings.js`

Referencia Codex:

- PR #884

Reglas:

1. `sessionId` pertenece a OpenChamber.
2. `foreignSessionId` es el `threadId` de Codex.
3. El binding es persistente.
4. No cambiar de harness una sesión que ya ejecutó un turno.
5. Para cambiar de harness usar `handoff` y crear una sesión nueva.
6. Los writes deben ser atómicos.
7. No guardar credenciales en el binding.

---

# 11. Fase 4 — Cliente JSON-RPC Codex

Crear:

```text
packages/web/server/lib/harness/translators/codex/jsonrpc-subprocess.js
packages/web/server/lib/harness/translators/codex/app-server.js
```

Usar como referencia directa:

```text
PR #884
packages/web/server/lib/harness/jsonrpc-subprocess.js
packages/web/server/lib/harness/codex-appserver.js
```

---

## 11.1 Proceso

MVP:

```js
spawn(codexPath, ["app-server"], {
  cwd,
  stdio: ["pipe", "pipe", "pipe"]
})
```

No usar shell parsing.

No ejecutar:

```bash
codex exec ...
```

para la ruta principal.

---

## 11.2 Handshake

Secuencia:

```text
spawn
  |
  v
initialize
  |
  v
initialized
  |
  v
ready
```

Bloquear cualquier request hasta completar `initialize`.

---

## 11.3 Parser

`stdio` usa JSON line-delimited.

Implementar buffer:

```text
chunk
  -> append buffer
  -> split "\n"
  -> keep incomplete tail
  -> JSON.parse complete lines
```

Distinguir:

```text
response     -> has id
notification -> method, no id
request      -> method + id
```

Codex puede enviar requests al cliente, por ejemplo approvals/questions.

---

## 11.4 Timeouts

Definir al menos:

```text
initialize timeout
request timeout
turn start timeout
shutdown timeout
```

No matar un turno simplemente porque lleve varios minutos ejecutándose.

---

# 12. Fase 5 — Thread lifecycle

## Crear

Si el binding no tiene `foreignSessionId`:

```text
thread/start
```

Guardar inmediatamente:

```text
foreignSessionId = thread.id
```

## Reanudar

Si existe:

```text
thread/resume
```

Si falla porque el thread no existe:

1. registrar error;
2. no fingir success;
3. ofrecer/recrear thread solo con política explícita;
4. conservar evidencia en logs.

---

# 13. Fase 6 — Prompt / Turn

Endpoint:

```http
POST /api/harness/prompt
```

Input:

```json
{
  "sessionId": "...",
  "directory": "...",
  "target": {
    "harnessId": "codex",
    "modelRef": "...",
    "effort": "high"
  },
  "message": {
    "text": "..."
  }
}
```

Flow:

```text
routeMessage
   |
   v
HarnessRouter
   |
   v
CodexTranslator.prompt
   |
   v
ensure thread
   |
   v
turn/start
```

Guardar:

```text
activeTurnId
sessionId
threadId
directory
```

---

# 14. Fase 7 — Event translation

Crear:

```text
packages/web/server/lib/harness/translators/codex/events.js
```

No permitir que los componentes UI consuman JSON-RPC Codex directamente.

Mapping aproximado:

```text
Codex                          OpenChamber
------------------------------------------------
thread/started                 session metadata
turn/started                   session busy
item/started text              message/part start
agentMessage delta             message.part.delta
reasoning delta                reasoning part delta
commandExecution started       tool part running
commandExecution completed     tool part completed
fileChange                     tool/file part
turn/completed                 session idle
turn/error                     session error + idle
```

El nombre exacto de los métodos debe obtenerse del schema generado por la versión instalada de Codex.

---

# 15. Fase 8 — Models y reasoning effort

No hardcodear el catálogo si Codex lo expone.

Usar:

```text
model/list
```

Cache corta:

```text
TTL: 1–5 min
```

UI:

```text
Harness = Codex
Model   = <model/list>
Effort  = <opciones soportadas>
```

Si la compatibilidad model/effort no está publicada de forma autoritativa, dejar que Codex valide y devolver su error real.

---

# 16. Fase 9 — Permissions / approvals

Codex puede enviar JSON-RPC requests al cliente.

Mapping:

```text
Codex requestApproval
      |
      v
CodexTranslator
      |
      v
OpenChamber permission.asked
      |
      v
PermissionCard
      |
  Once / Always / Reject
      |
      v
JSON-RPC response
```

Referencia:

- PR #884
- PR #2436

Requisitos:

```text
[ ] approval command
[ ] file read si aplica
[ ] file change
[ ] apply patch
[ ] deny
[ ] once
[ ] session-level allow si Codex lo soporta
```

Nunca auto-aprobar silenciosamente durante la primera versión.

---

# 17. Fase 10 — Questions / request_user_input

Codex puede solicitar input del usuario.

Mapping:

```text
Codex request
  -> OpenChamber question.asked
  -> QuestionCard
  -> respuesta
  -> JSON-RPC response
```

Validar:

- opciones múltiples;
- respuesta libre;
- cancel;
- browser reload mientras hay pregunta pendiente.

---

# 18. Fase 11 — Abort y recuperación

Endpoint:

```http
POST /api/harness/abort
```

Mapping:

```text
sessionId
 -> binding
 -> threadId / activeTurnId
 -> turn/interrupt
```

En cualquier salida:

```text
activeTurnId = null
session status = idle/error
```

Referencia de bug a evitar:

El review de PR #884 detectó riesgo de dejar la UI en `busy` cuando el proceso Codex muere inesperadamente.

Por tanto:

```text
onProcessExit:
  reject pending requests
  fail active turn
  clear activeTurnId
  emit session.error
  emit session.idle
  remove dead process
```

---

# 19. Fase 12 — Process lifecycle

## MVP recomendado

Un proceso:

```text
codex app-server
```

por sesión activa.

Ventajas:

- cwd aislado;
- fallos aislados;
- approvals aislados;
- implementación ya probada en #884.

Añadir idle timeout:

```text
30 min
```

aproximadamente.

## Optimización posterior

Evaluar:

```text
1 app-server daemon / unix socket
```

solo cuando el MVP sea estable.

La documentación oficial ya incluye un daemon experimental:

- https://github.com/openai/codex/blob/main/codex-rs/app-server-daemon/README.md

No introducirlo en la primera fase.

---

# 20. Fase 13 — Persistencia y reconnect

Caso obligatorio:

```text
1. usuario inicia tarea
2. cierra browser
3. tarea continúa
4. abre browser 20 minutos después
5. sesión aparece
6. estado/resultados aparecen
7. puede enviar siguiente turno
```

Para esto se necesitan dos niveles:

```text
OpenChamber binding persistence
Codex thread persistence
```

No depender de una conexión WebSocket/browser viva para mantener el turno.

---

# 21. Fase 14 — Shell

Seguir principio del PR #2454:

- https://github.com/openchamber/openchamber/pull/2454

Shell es infraestructura del workspace.

Por tanto:

```text
! npm test
```

puede seguir usando el sistema actual de terminal/shell de OpenChamber.

No es obligatorio convertirlo en `turn/start`.

La ejecución agentic de Codex sí debe ir por Codex.

---

# 22. Fase 15 — Queue

Referencia:

- https://github.com/openchamber/openchamber/pull/2439

Política:

```text
si turn activo:
    nuevo mensaje -> queue

cuando turn completed/failed/aborted:
    session idle
    -> enviar siguiente queue item
```

No intentar ejecutar dos `turn/start` simultáneos para el mismo thread salvo que Codex documente explícitamente ese comportamiento.

---

# 23. Fase 16 — Session handoff

Permitir:

```text
OpenCode session
    |
    | Handoff to Codex
    v
new OpenChamber session
    |
    v
Codex thread
```

No cambiar `harnessId` de una sesión usada.

La nueva sesión puede recibir:

```text
seedFromSessionId
```

y un resumen/transcript del origen.

Referencia:

- PR #2439
- PR #2466

---

# 24. Fase 17 — MultiRun

Solo después de estabilizar chat normal.

Referencia:

- https://github.com/openchamber/openchamber/pull/2473

Objetivo:

```text
MultiRun
   |
   +-- OpenCode model
   |
   +-- Codex model A / high
   |
   +-- Codex model B / medium
```

Cada ejecución:

```text
worktree independiente
ExecutionTarget independiente
session binding independiente
Codex thread independiente
```

No compartir thread entre worktrees.

---

# 25. Fase 18 — Goal Mode

Después de MultiRun básico.

Necesario mapear usage/turn lifecycle:

```text
Codex usage
   |
   v
OpenChamber goal accounting
```

Goal debe continuar enviando nuevos `turn/start` al mismo thread hasta:

```text
complete
failed
aborted
budget exhausted
turn cap
```

Referencia de patrón:

- https://github.com/openchamber/openchamber/pull/2473

---

# 26. Fase 19 — MCP

No implementar MCP dos veces.

Primero determinar:

```text
¿Codex app-server ya arranca los MCP configurados por Codex?
```

Si sí, preferir configuración nativa Codex.

OpenChamber solo debe:

- mostrar capacidad;
- proporcionar configuración cuando corresponda;
- mapear approvals/questions;
- inyectar OpenChamber Tool si se desea.

Referencia oficial:

- https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md

Referencia del patrón Claude:

- https://github.com/openchamber/openchamber/pull/2461

---

# 27. Fase 20 — OpenChamber Tool

Objetivo final:

```text
Codex
  -> MCP
     -> OpenChamber Control Tool
```

Esto permite a Codex interactuar con capacidades del control plane.

Referencia:

- https://github.com/openchamber/openchamber/pull/2473

Implementarlo después de que MCP Codex sea estable.

---

# 28. Fase 21 — Import de sesiones Codex

Opcional.

Codex ya mantiene threads persistentes.

Investigar primero:

```text
thread/list
thread/read
```

Antes de leer archivos internos de `~/.codex`.

Preferencia:

```text
Codex API pública/app-server
```

sobre:

```text
parsear archivos internos de Codex
```

Import:

```text
Codex thread
  -> create OpenChamber shell session
  -> binding.foreignSessionId = threadId
```

---

# 29. Seguridad

## No guardar

```text
ChatGPT access token
refresh token
Codex auth blobs
API keys
cookies
```

en:

```text
OpenChamber settings
session bindings
logs
browser localStorage
```

Codex debe poseer su autenticación.

---

## Logging

No loggear payload JSON-RPC completo por defecto.

PR #884 recibió específicamente feedback sobre riesgo de loggear:

- código;
- paths;
- reasoning;
- command output;
- user questions.

Usar:

```text
INFO  lifecycle IDs/status
DEBUG payloads redactados
```

Debug solo mediante flag explícito.

---

# 30. Failure model

Nunca convertir error en empty success.

Distinguir:

```text
Codex CLI missing
Codex not authenticated
app-server failed
thread missing
turn rejected
approval rejected
JSON-RPC timeout
process died
Codex overloaded
unsupported method
schema mismatch
```

Errores de transporte deben preservar la sesión.

---

# 31. Compatibilidad de protocolo

`app-server` evoluciona.

No copiar tipos manualmente y asumir estabilidad.

Durante CI/dev:

```bash
codex app-server generate-ts --out generated/codex
```

Opcionalmente registrar versión:

```text
codex --version
generated schema version/hash
```

Crear adapter fino entre schema Codex y dominio OpenChamber.

---

# 32. Tests mínimos por módulo

## JSON-RPC

```text
[ ] fragmented stdout chunks
[ ] multiple messages per chunk
[ ] malformed line
[ ] request/response correlation
[ ] notification
[ ] server request
[ ] timeout
[ ] process exit
[ ] stderr
```

## Codex lifecycle

```text
[ ] initialize
[ ] thread/start
[ ] thread/resume
[ ] turn/start
[ ] turn/completed
[ ] turn/interrupt
```

## Events

```text
[ ] text
[ ] reasoning
[ ] command
[ ] file edit
[ ] final message
[ ] error
```

## Permissions

```text
[ ] once
[ ] always/session
[ ] reject
[ ] process dies while waiting
```

## Binding

```text
[ ] create
[ ] persist
[ ] reload
[ ] foreignSessionId
[ ] conflict harness
[ ] prune
```

---

# 33. Test E2E obligatorio

Usar un repositorio fixture.

## E2E-01 conversación

```text
Prompt: identifica stack del proyecto
Expected:
- stream
- final response
- thread persisted
```

## E2E-02 modificación

```text
Prompt: crea un archivo fixture
Expected:
- tool/file event
- archivo real
- Git diff visible
```

## E2E-03 command

```text
Prompt: ejecuta tests
Expected:
- command card
- stdout/stderr
- completion
```

## E2E-04 approval

Forzar acción que requiera approval.

## E2E-05 abort

Ejecutar tarea larga y abortar.

## E2E-06 reconnect

```text
start task
close browser
wait
reopen
verify result
```

## E2E-07 restart OpenChamber

```text
complete Codex thread
restart OpenChamber
open same session
send follow-up
verify thread/resume
```

## E2E-08 concurrent sessions

```text
3 OpenChamber Codex sessions
3 app-server processes
3 repos/worktrees
```

No debe mezclarse cwd, output ni approvals.

---

# 34. Gates por fase

Después de cada fase:

```bash
bun run type-check
bun run lint
bun run build
```

Y tests focalizados.

No esperar al final para integrar 100+ archivos.

---

# 35. Estrategia de commits

Recomendación:

```text
1. feat(harness): add execution target contracts
2. feat(harness): add registry and session bindings
3. feat(codex): add JSON-RPC subprocess client
4. feat(codex): add app-server lifecycle
5. feat(codex): add thread and turn execution
6. feat(codex): map streaming events
7. feat(codex): add approvals and questions
8. feat(ui): add Codex engine selection
9. feat(codex): add model and effort controls
10. fix(codex): harden reconnect and process exit
11. feat(codex): add queue and abort parity
12. feat(codex): add MultiRun
13. feat(codex): add Goal
14. feat(codex): add MCP/OpenChamber tool
```

Evitar un único PR de 15k–30k líneas como los experimentos previos.

---

# 36. Orden recomendado para el agente

## Milestone 1 — MVP

Debe terminar con:

```text
Codex selectable
thread/start
turn/start
stream text
tool cards
file modifications
abort
resume
persistent binding
```

No incluir:

```text
Goal
MultiRun
MCP
Import
OpenChamber Tool
```

---

## Milestone 2 — Usabilidad

```text
approvals
questions
queue
session title
model list
effort
attachments
proper errors
reconnect hardening
```

---

## Milestone 3 — Paridad avanzada

```text
MultiRun
Goal
MCP
subagents
OpenChamber Tool
session import
usage/quota
```

---

# 37. Definition of Done del MVP

No considerar el MVP terminado hasta cumplir:

```text
[ ] Codex CLI se ejecuta en el servidor
[ ] navegador es solo cliente
[ ] no existe provider Codex dentro de OpenCode
[ ] Codex aparece como harness/engine independiente
[ ] se puede crear thread
[ ] se puede ejecutar turn
[ ] streaming correcto
[ ] tools visibles
[ ] cambios de archivos visibles en Git
[ ] abort funciona
[ ] approvals funcionan
[ ] session binding persiste
[ ] reload funciona
[ ] OpenChamber restart + resume funciona
[ ] cerrar navegador no cancela trabajo
[ ] OpenCode sessions existentes no sufren regresión
```

---

# 38. Criterio para no desviarse

Durante el desarrollo, cualquier propuesta que introduzca:

```text
OpenCode Provider: Codex
OpenAI-compatible Codex proxy dentro de OpenCode
opencode-codex plugin
Codex vía provider/model de OpenCode
```

debe rechazarse para este proyecto.

La única excepción es reutilizar OpenCode como infraestructura interna temporal de OpenChamber para funciones no-agentic ya existentes.

La ejecución AI debe ser siempre:

```text
OpenChamber
   -> Codex app-server
       -> Codex CLI
```

---

# 39. Evaluación final de las fuentes

## Fuente más útil para arquitectura

Claude Engine:

- https://github.com/openchamber/openchamber/pull/2410

Aporta:

```text
ExecutionTarget
Harness registry
Harness routes
Session bindings
Capabilities
Queue/stop integration pattern
MultiRun/Goal integration pattern
```

## Fuente más útil para implementación Codex

PR #884:

- https://github.com/openchamber/openchamber/pull/884

Aporta:

```text
JSON-RPC subprocess
codex app-server lifecycle
threads
turns
events
approvals
models
effort
resume
```

## Fuente de verdad del protocolo

OpenAI Codex:

- https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md

El agente debe validar siempre el comportamiento actual contra esta documentación y contra los schemas generados por el CLI instalado.

---

# 40. Primera tarea concreta para el agente

Antes de editar `main`, ejecutar exactamente este bloque de trabajo:

```text
TASK: Codex App-Server Compatibility Spike

1. Registrar:
   - git SHA de OpenChamber main
   - codex --version
   - node --version
   - bun --version

2. Generar:
   codex app-server generate-ts --out /tmp/codex-schema

3. Comparar schema actual con:
   PR #884 codex-appserver.js

4. Ejcutar un cliente mínimo:
   initialize
   thread/start
   turn/start
   recoger notifications
   turn completed
   thread/resume
   segundo turn

5. Probar:
   approval
   interrupt

6. Crear:
   docs/codex-app-server-spike.md

6. No modificar todavía UI ni session stores.

Acceptance:
   thread/start -> turn/start -> streaming -> completed -> resume
   debe funcionar de extremo a extremo.
```

Solo después de ese acceptance gate debe comenzar el port a OpenChamber.

---

# 41. Resumen ejecutivo para el agente

La integración **no debe construirse desde cero**.

Hay dos trabajos previos complementarios:

```text
Claude Engine work
        +
PR #884 Codex
        =
OpenChamber Codex Engine
```

Usar Claude Engine como patrón de **control plane/harness**.

Usar PR #884 como patrón de **Codex transport/runtime**.

No usar `opencode-claude` como patrón arquitectónico para Codex, porque ese proyecto introduce Claude como provider de OpenCode y el objetivo de este proyecto es que **Codex CLI sea un motor independiente controlado directamente por OpenChamber**.

La implementación debe priorizar un MVP pequeño y mantenible, introduciendo el menor número posible de abstracciones hasta que el flujo real:

```text
Browser -> OpenChamber -> codex app-server -> Codex CLI
```

esté probado en el servidor.
