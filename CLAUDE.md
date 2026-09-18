@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> The `@AGENTS.md` import above is the block `next dev` manages. Because `AGENTS.md`
> exists and hosts the markers, `next dev` upserts `AGENTS.md` and **skips**
> `CLAUDE.md` (see `node_modules/next/dist/server/lib/generate-agent-files.js:99`),
> so the content below is safe from being overwritten.

## Commands

| Comando         | Qué hace                                   |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Dev server en http://localhost:3000        |
| `npm run build` | Build de producción (corre `tsc` también)  |
| `npm start`     | Sirve el build                             |
| `npm run lint`  | ESLint (flat config, `eslint.config.mjs`)  |

No hay suite de tests ni runner configurado. Para verificar cambios: `npm run build`
(hace typecheck) + `npm run lint` + probar en el navegador.

La app **no arranca** sin `.env.local` válido: `src/lib/env.ts` valida con Zod al
importarse y tira un error explícito si faltan las vars o si quedaron los valores
de ejemplo de `.env.example`. El setup completo de Supabase (migraciones, Auth,
bucket) está en `README.md`; el detalle del schema y de cada política de RLS, en
`supabase/README.md`.

## Idioma

El dominio, los identificadores, los comentarios y los mensajes de usuario están
en **castellano rioplatense** (voseo: "Probá", "Elegí"). Solo las APIs de
framework/librería quedan en inglés. Código nuevo sigue esa convención: una función
que lista avisos se llama `listarAvisos`, no `listAds`.

## Arquitectura

### Next.js 16 · lo que cambió respecto de versiones previas

- **`src/proxy.ts` reemplaza a `middleware.ts`.** Exporta `default async function proxy(request)`
  y su `config.matcher`. Algunos comentarios del código todavía hablan de
  "middleware" (p. ej. `src/lib/supabase/server.ts:33`) — se refieren a este archivo.
- **`params` y `searchParams` son `Promise`** y hay que `await`earlos. El patrón de
  la home: la page es sincrónica, pasa la promesa a un componente async y lo envuelve
  en `<Suspense>` para que el shell se streamee (`src/app/page.tsx:105`).
- Antes de escribir código de framework, leé el doc correspondiente en
  `node_modules/next/dist/docs/01-app/` (está el App Router completo, incluido
  `01-getting-started/16-proxy.md`).

### Feature-first, no type-first

```
src/app/        → solo routing y composición. Cero lógica de negocio.
src/features/   → un módulo por dominio (avisos, auth). Es donde vive la lógica.
src/components/ → ui/ (Button, Field, Card, Badge, Alert, EmptyState) · layout/ · icons/
src/lib/        → supabase/ (client · server · middleware) · env.ts · utils.ts
src/types/      → database.ts, tipos de la DB escritos a mano
```

Cada feature repite la misma estructura, y el contrato es estricto:

- **`queries.ts` lee** — funciones async llamadas desde Server Components. Tiran
  `Error` con mensaje en castellano si falla la DB.
- **`actions.ts` escribe** — `"use server"`. Un archivo con `"use server"` solo puede
  exportar funciones async, así que los tipos y constantes de estado viven aparte en
  **`state.ts`** (ver el comentario en `src/features/avisos/state.ts:3`).
- **`schemas.ts`** — schemas de Zod + los conversores `xDesdeFormData` /
  `valoresDesdeFormData` / `erroresPorCampo` + normalización de search params.
- **`constants.ts`** — taxonomías, límites y config del bucket.
- **`components/`** — componentes propios del dominio.

Sumar un dominio (p. ej. mensajería) = crear `src/features/mensajes/` con esos
archivos, sin tocar `avisos/`. El plan de tablas/RLS para eso ya está esbozado en
`supabase/README.md`.

### Tres clientes de Supabase, uno por contexto

`src/lib/supabase/` — **nunca** compartir instancias entre requests:

| Archivo         | Para                                          | Notas                                                         |
| --------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `server.ts`     | Server Components, Server Actions, Route Handlers | `createSupabaseServerClient()` es async (lee `cookies()`); una instancia por request |
| `client.ts`     | Client Components                             | Solo se usa para subir imágenes a Storage                     |
| `middleware.ts` | `src/proxy.ts`                                | `updateSession()`: refresca el token y reescribe las cookies   |

Siempre `auth.getUser()`, nunca `getSession()`: `getUser()` valida el token contra
el servidor de Auth en vez de confiar en la cookie.

### Autorización: RLS es la fuente de verdad

La autorización vive en Postgres, no en el código. El código agrega chequeos
redundantes; si algo se escapa, la base lo frena igual. Tres capas para las rutas
privadas (`/avisos/nuevo`, `/mis-avisos`, `/avisos/[id]/editar`):

1. `src/lib/supabase/middleware.ts` (`RUTAS_PRIVADAS`) redirige al login con `?redirectTo=`.
2. `requerirUsuario(redirectTo)` de `features/auth/queries.ts` vuelve a chequear en la página o action.
3. RLS tiene la última palabra.

Al tocar esto, mantené las tres alineadas. Reglas que importan:

- Las dos políticas de `SELECT` se combinan con **OR**: público ve `estado = 'activo'`,
  el dueño ve todo lo suyo. Por eso `listarAvisos` **necesita** su `.eq("estado", "activo")`
  explícito: sin él, un usuario logueado vería sus propios avisos pausados en el
  listado público (`src/features/avisos/queries.ts:18`).
- Las escrituras llevan siempre `.eq("user_id", user.id)` además de RLS.
- El `id` a editar llega por `.bind()` desde el componente, **no** por el `FormData`,
  para que no se pueda reapuntar el update manipulando el HTML.
- Un trigger impide cambiar `user_id` y `created_at` en un `UPDATE`.
- Después de escribir, `revalidatePath` sobre `/`, `/mis-avisos` y `/avisos/[id]`
  (helper `revalidarAvisos`). Las actions de auth hacen `revalidatePath("/", "layout")`
  porque cambia el header.

### Imágenes: del navegador directo a Storage

El archivo **no pasa por la Server Action** (límite de body de 1 MB; acá se aceptan
hasta 5 MB). `features/avisos/storage.ts` sube desde el cliente y al formulario le
llega solo la URL pública.

- La ruta es siempre `<user_id>/<uuid>.<ext>` — la política del bucket compara
  `storage.foldername(name)[1]` contra `auth.uid()`.
- Tipo y tamaño se validan en **tres** lugares: navegador (`imagen.ts`), bucket
  (`allowed_mime_types` / `file_size_limit`) y `CHECK` de la columna. Si cambiás un
  límite, cambialo en `features/avisos/constants.ts` **y** en
  `supabase/migrations/20260915120100_storage_avisos_imagenes.sql`.
- Al reemplazar o borrar una imagen se limpia la anterior (best-effort). Los
  formularios abandonados dejan huérfanos — deuda conocida.

### Validación en doble capa

Los límites de `avisoSchema` (`features/avisos/schemas.ts`) replican los `CHECK`
constraints de `public.avisos`. Si cambiás uno, cambiá el otro. Convenciones del
parseo de `FormData`: string vacío → `null` para los opcionales, y
`limpiarTextoDeBusqueda` saca los caracteres que rompen la sintaxis `?or=` / `ilike`
de PostgREST antes de armar la query.

### Formularios

`useActionState` + Server Action. Cuando la validación falla, la action devuelve
`{ errores, valores }`: `errores` pinta el mensaje al lado de cada input y `valores`
repuebla los `defaultValue` para no perder lo tipeado. Las acciones que no son
formularios (pausar, cerrar, borrar) devuelven `AccionSimpleState` (`{ ok }` o `{ error }`).

### Estilos

Tailwind v4 CSS-first: **no hay `tailwind.config.js`**. Los design tokens están en
`@theme` dentro de `src/app/globals.css` y se usan como utilidades normales
(`bg-surface`, `text-ink-soft`, `border-line`, `bg-busco-soft`). Los dos acentos del
dominio son `--color-busco` (verde, "busco músico") y `--color-ofrezco` (violeta,
"me ofrezco"); el mapeo tipo → tono vive en `features/avisos/constants.ts`
(`TIPO_AVISO_TONE`). Para composición de clases, `cn()` de `lib/utils.ts`.
La tabla completa de tokens está en `README.md`.

### Tipos de la DB

`src/types/database.ts` está escrito **a mano** y refleja `supabase/migrations/`.
Si cambiás el schema, actualizalo (o regeneralo:
`npx supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts`).

## Gotchas

- **`"url" parameter is not allowed` en una imagen que sí se subió.** `next.config.ts`
  deriva `images.remotePatterns` de `NEXT_PUBLIC_SUPABASE_URL`, pero se evalúa una
  sola vez al arrancar: Next recarga `.env.local` en caliente y **no** vuelve a correr
  el config. Reiniciá `npm run dev`.
- **`Could not find the table 'public.avisos'`.** Faltan las migraciones (paso 2 del README).
- **Alias de imports:** `@/*` → `./src/*`.
- Deuda conocida (paginación por `offset` que corta en 24, taxonomías de texto libre
  donde `ilike` no matchea acentos, falta reset de contraseña, imágenes huérfanas):
  documentada al final de `README.md`.
