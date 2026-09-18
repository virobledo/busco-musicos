# Busco Músicos

Clasificados de músicos y bandas. Dos tipos de aviso: **busco músico** y
**me ofrezco**. Los avisos son públicos; hace falta cuenta solo para publicar.

**Stack:** Next.js 16 (App Router, TypeScript) · Supabase (Postgres + Auth +
Storage) · Tailwind CSS v4 · Zod · Lucide.

---

## Puesta en marcha

### 1. Crear el proyecto de Supabase

En [supabase.com](https://supabase.com) creá un proyecto nuevo y anotá, desde
**Project Settings → API**, el *Project URL* y la *anon public key*.

### 2. Aplicar el schema

En **SQL Editor**, ejecutá en este orden:

1. `supabase/migrations/20260915120000_init_avisos.sql` — enums, tabla `avisos`,
   triggers, índices y políticas de RLS.
2. `supabase/migrations/20260915120100_storage_avisos_imagenes.sql` — bucket
   `avisos-imagenes` y sus políticas.

Los detalles del modelo y de cada política están en
[`supabase/README.md`](./supabase/README.md).

### 3. Configurar Auth

En **Authentication → Providers → Email**: dejalo habilitado.

En **Authentication → Email**, para desarrollo conviene **desactivar
"Confirm email"**: así el registro te deja logueado al toque. Si lo dejás
activo, agregá `http://localhost:3000/auth/confirmar` en
**Authentication → URL Configuration → Redirect URLs**.

### 4. Variables de entorno

Ya existe un `.env.local` con los placeholders. Completalo:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Si quedan los valores de ejemplo, la app falla al arrancar con un mensaje
explícito (`src/lib/env.ts`) en vez de tirar un error de red raro.

### 5. Levantar

```bash
npm run dev
```

→ http://localhost:3000

### 6. (Opcional) Datos de ejemplo

Registrate una vez en `/registro` y después ejecutá `supabase/seed.sql` en el
SQL Editor: carga cinco avisos a nombre de tu usuario.

---

## Scripts

| Comando         | Qué hace                                  |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Servidor de desarrollo                    |
| `npm run build` | Build de producción (incluye `tsc`)       |
| `npm start`     | Sirve el build                            |
| `npm run lint`  | ESLint                                    |

---

## Estructura

Organización **por feature**, no por tipo de archivo. La idea es que sumar
mensajería interna sea agregar `src/features/mensajes/` sin tocar nada de
`avisos/`.

```
src/
├── app/                          # Solo routing y composición de páginas
│   ├── (auth)/                   # Route group: no agrega segmento a la URL
│   │   ├── login/
│   │   └── registro/
│   ├── auth/confirmar/route.ts   # Callback del mail de confirmación
│   ├── avisos/
│   │   ├── [id]/page.tsx         # Detalle público
│   │   ├── [id]/editar/page.tsx
│   │   └── nuevo/page.tsx
│   ├── mis-avisos/page.tsx
│   ├── layout.tsx                # Inter + header + footer
│   ├── page.tsx                  # Listado con filtros
│   ├── error.tsx  ·  not-found.tsx
│   └── globals.css               # Design tokens de Tailwind v4
│
├── features/                     # Un módulo por dominio
│   ├── avisos/
│   │   ├── components/           # AvisoCard, AvisoForm, filtros, upload…
│   │   ├── actions.ts            # Server Actions (crear/editar/estado/borrar)
│   │   ├── queries.ts            # Lecturas desde Server Components
│   │   ├── schemas.ts            # Zod + parseo de FormData y search params
│   │   ├── state.ts              # Tipos de estado de los formularios
│   │   ├── storage.ts            # Subida a Storage (browser)
│   │   ├── imagen.ts             # Validación y paths (isomórfico)
│   │   ├── constants.ts          # Taxonomías, límites, config del bucket
│   │   └── types.ts
│   └── auth/
│       ├── components/           # AuthForm, UserMenu
│       ├── actions.ts  ·  queries.ts  ·  schemas.ts  ·  state.ts
│
├── components/
│   ├── ui/                       # Button, Field, Card, Badge, Alert, EmptyState
│   ├── layout/                   # Header, Footer, Container
│   └── icons/                    # Iconos de marca (Lucide v1 los sacó)
│
├── lib/
│   ├── supabase/                 # client · server · middleware
│   ├── env.ts                    # Validación de env vars con Zod
│   └── utils.ts                  # cn, fechas, truncado
│
├── types/database.ts             # Tipos de la DB (regenerables con la CLI)
└── proxy.ts                      # Refresh de sesión + guardas de ruta
```

### Por qué esta separación

- **`app/` no tiene lógica de negocio.** Cada página arma datos con una query
  del feature y compone componentes. Así, mover o renombrar rutas no rompe nada.
- **Tres clientes de Supabase, uno por contexto** (`lib/supabase/`): browser,
  servidor y proxy. Nunca se comparte instancia entre requests.
- **`queries.ts` lee, `actions.ts` escribe.** Las lecturas corren en Server
  Components; las escrituras son Server Actions, así que el token de sesión
  nunca pasa por el cliente.

---

## Cómo funciona la seguridad

La autorización vive en **RLS**, no en el código. El código agrega chequeos
redundantes, pero si algo se escapa, la base lo frena igual.

- **Lectura pública:** `estado = 'activo'` para `anon` y `authenticated`.
- **El dueño ve todo lo suyo:** una segunda política de `SELECT` con
  `auth.uid() = user_id`. Las políticas se combinan con OR.
- **Escritura solo del dueño:** `INSERT`/`UPDATE`/`DELETE` chequean
  `auth.uid() = user_id`.
- **Un trigger** impide cambiar `user_id` y `created_at` en un `UPDATE`.
- **Storage:** la ruta es siempre `<user_id>/<uuid>.<ext>` y la política compara
  `storage.foldername(name)[1]` contra `auth.uid()`.

Tres capas para las rutas privadas (`/avisos/nuevo`, `/mis-avisos`,
`/avisos/[id]/editar`): `src/proxy.ts` redirige al login, `requerirUsuario()`
vuelve a chequear en la página, y RLS es la última palabra.

### Subida de imágenes

El archivo va **directo del navegador a Storage** (`features/avisos/storage.ts`)
y al formulario le llega solo la URL. Es a propósito: las Server Actions tienen
un límite de body de 1 MB y acá se aceptan hasta 5 MB.

La validación de tipo (`jpg`/`png`/`webp`) y tamaño corre en tres lugares: en el
navegador antes de subir, en el bucket (`allowed_mime_types`, `file_size_limit`)
y en el `CHECK` de la columna. Cuando se reemplaza o se borra una imagen, el
archivo anterior se limpia para no dejar huérfanos.

---

## Design system

Los tokens están en `src/app/globals.css` dentro de `@theme` — Tailwind v4 es
CSS-first, no hay `tailwind.config.js`.

| Token                | Valor     | Uso                          |
| -------------------- | --------- | ---------------------------- |
| `--color-surface`    | `#FAFAFA` | Fondo de página              |
| `--color-card`       | `#FFFFFF` | Cards y superficies elevadas |
| `--color-ink`        | `#141414` | Texto principal              |
| `--color-ink-soft`   | `#6B6B6B` | Texto secundario             |
| `--color-line`       | `#E5E5E5` | Bordes y divisores           |
| `--color-busco`      | `#1DB954` | Acento · "busco músico"      |
| `--color-ofrezco`    | `#7C5CFF` | Acento · "me ofrezco"        |

Se usan como cualquier utilidad de Tailwind: `bg-surface`, `text-ink-soft`,
`border-line`, `bg-busco-soft`. Tipografía Inter vía `next/font` (Semibold para
títulos), cards `rounded-xl` con `shadow-card`, badges tipo pill.

---

## Próximo paso: mensajería interna

El `user_id` de cada aviso ya es el punto de enganche. El plan está esbozado
—tablas, RLS y ubicación del código— en
[`supabase/README.md`](./supabase/README.md#próximo-paso-previsto-mensajería-interna).

## Problemas comunes

**`"url" parameter is not allowed` / la imagen no se muestra aunque se subió.**
`next.config.ts` se evalúa una sola vez al arrancar. Next recarga `.env.local`
en caliente pero **no** vuelve a correr el config, así que si cambiaste
`NEXT_PUBLIC_SUPABASE_URL` (por ejemplo, al mudarte de proyecto de Supabase) el
`remotePatterns` de `next/image` se queda con el hostname viejo. Reiniciá
`npm run dev`.

Para distinguir rápido si el problema es la subida o solo la visualización:

```bash
# ¿el archivo llegó a Storage? (debería listar una carpeta por user_id)
curl -s -X POST "$SUPABASE_URL/storage/v1/object/list/avisos-imagenes" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" -d '{"prefix":"","limit":100}'
```

Si el archivo está, la subida y el RLS del bucket funcionan: el problema es de
display.

**`Could not find the table 'public.avisos' in the schema cache`.** Faltan las
migraciones. Ver el paso 2 de *Puesta en marcha*.

**`Another next dev server is already running`.** Quedó un proceso viejo en el
3000. `taskkill /PID <pid> /F` (el PID aparece en el mismo mensaje) y de nuevo
`npm run dev`.

## Deuda conocida

- **Paginación:** el listado corta en 24 avisos (`AVISOS_POR_PAGINA`). Cuando
  haga falta, conviene cursor por `created_at` en vez de `offset`.
- **Taxonomías libres:** `instrumento` y `genero_musical` son texto libre con
  sugerencias por `<datalist>`. El filtro usa `ilike`, así que "Batería" y
  "bateria" no matchean. Si importa, pasan a tablas de lookup.
- **Sin recuperación de contraseña:** falta el flujo de *reset password*.
- **Imágenes huérfanas:** si alguien sube una portada y abandona el formulario
  sin guardar, el archivo queda en el bucket sin ningún aviso que lo referencie.
  Se limpian los reemplazos dentro de una misma sesión y los de edición/borrado,
  pero no los formularios abandonados. La solución prolija es un cron que borre
  objetos sin fila en `avisos`.
