# DIGITALMAS.PRO · WORKFLOW

## Fuente de verdad
GitHub es la fuente técnica canónica. Los workspaces locales de cualquier agente o humano son únicamente copias de trabajo. Nunca sincronizar carpetas locales directamente entre herramientas; la sincronización ocurre exclusivamente a través de Git y GitHub.

## Roles
- **Andy**: dueño / coordinador general.
- **Messi**: estrategia, especificación, revisión y VAR.
- **Haaland**: GPT Work, ejecutor principal.
- **Mbappé**: Antigravity, ejecutor / relevo técnico.
- **Otros agentes / humanos**: relevos autorizados.

*Los nombres representan roles operativos dentro del flujo, no dependencias técnicas.*

## Regla de juego: Un solo jugador con la pelota
Nunca dos agentes o humanos deben modificar simultáneamente la misma branch. El nuevo jugador no comienza a trabajar hasta que el jugador anterior haya concluido su entrega y soltado la branch en GitHub.

## Propiedad canónica de HEAD
- **HEAD actual de la branch**: lo determina **GitHub**, nunca el archivo `HANDOFF.md`.
- **`checkpoint_head` en HANDOFF**: representa el último HEAD funcional que el jugador recibió y validó técnicamente.
- **No entrar en ciclos de actualización documental**: no se debe volver a editar ni commitear `HANDOFF.md` únicamente porque un commit documental posterior generó un nuevo hash de commit en Git.

## Antes de trabajar
1. `git fetch origin`
2. Leer `README.md`
3. Leer `WORKFLOW.md`
4. Leer `HANDOFF.md` del proyecto correspondiente
5. Comprobar branch activa
6. Comprobar `checkpoint_head` esperado
7. Verificar `git status` limpio
8. Ejecutar baseline técnico / tests si la jugada lo requiere

## Durante
- Una branch → un jugador activo.
- No modificar `main` directamente.
- No ampliar el alcance establecido en la jugada.
- No copiar carpetas legacy ni código de workspaces archivados.
- Máximo 3 subentregables sin generar un checkpoint.
- Cualquier cambio manual (diseño, copia, asset) requiere su respectivo commit.

## Checkpoint
1. Ejecutar y validar tests / suite de verificación.
2. `git commit` con mensaje descriptivo y convencional.
3. `git push` a la branch de trabajo.
4. Confirmar deploy preview en Netlify (si aplica).
5. Actualizar el `HANDOFF.md` del proyecto cuando cambie el objetivo, etapa, jugador, próximos 3 o se cierre un hito técnico relevante.

## Relevo
El receptor (IA o humano) debe poder continuar el trabajo utilizando únicamente:
**GitHub + WORKFLOW.md + HANDOFF.md + código + preview**.

## Producción
Nunca publicar ni mergear a `main` sin el gate / VAR de aprobación correspondiente.

## Public: Superficie entregable
`public/` es el último embudo y representa la superficie runtime publicable.
- **Permitido**: páginas reales, assets necesarios, CSS/JS de runtime, `404.html`, `robots.txt`, `sitemap.xml`, secciones privadas operativas autorizadas (`/dono`, `/control`).
- **Prohibido**: backups, versiones temporales (`archivo-final-v2`), screenshots de referencia, prototipos, basura legacy, assets huérfanos, documentación o fuentes de diseño.

## Vibe Modeling: Contrato
El desarrollo sigue el orden:
1. **Entender**: negocio, oferta, contexto real.
2. **Modelar**: comportamientos de decisión, datos, flujo.
3. **Decidir arquitectura mínima**: sin sobreingeniería.
4. **Definir estados, datos y responsabilidades**.
5. **Wireframe** (cuando aplique).
6. **Implementar**.
7. **Comprobar** (tests y baseline).
8. **Publicar**.
9. **Medir**.

La IA puede proponer mejoras, pero **no** decide unilateralmente la arquitectura permanente. Si un cambio altera arquitectura, modelo de datos, seguridad, integraciones o fuente de verdad, debe elevarse a Messi / Andy antes de implementarse.

## Cambios manuales
Las modificaciones manuales (por diseñador o humano) son bienvenidas pero deben seguir el mismo protocolo:
`git fetch` → checkout branch → edición → test → `git commit` → `git push` → actualización de `HANDOFF.md` si cambia el estado.

> Si está publicado pero no está en Git: **no existe canónicamente**.
