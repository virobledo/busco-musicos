# Busco Músicos

Clasificados para conectar músicos y bandas. Dos tipos de aviso: **busco músico**
(una banda o proyecto necesita sumar a alguien) y **me ofrezco** (un músico quiere
sumarse a un proyecto).

Los avisos son públicos y se pueden leer sin tener cuenta creada. Solo hace falta registrarse
para publicar.

## Qué se puede hacer

- **Buscar avisos** por instrumento, género musical, zona, tipo de aviso o texto
  libre. El listado es público.
- **Ver el detalle** de cada aviso: descripción, imagen de portada, links a
  YouTube / Instagram y datos de contacto.
- **Publicar un aviso** con cuenta propia (email + contraseña).
- **Gestionar los propios avisos** desde `/mis-avisos`: editarlos, pausarlos
  (salen del listado público), cerrarlos o borrarlos.

## Stack

Next.js 16 (App Router, TypeScript) · React 19 · Supabase (Postgres + Auth +
Storage) · Tailwind CSS v4 · Zod.

La autorización vive en **Row Level Security** de Postgres: cada usuario solo
puede escribir sus propios avisos, y el listado público solo expone los que están
en estado `activo`. Las políticas están comentadas una por una en
[`supabase/migrations/`](./supabase/migrations/).

---

## Cómo levantarlo

Requisitos: Node.js 20+ y una cuenta gratuita de [Supabase](https://supabase.com).

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el proyecto de Supabase

Creá un proyecto nuevo y anotá, desde **Project Settings → API**, el *Project URL*
y la *anon public key*.

### 3. Crear el schema

En el **SQL Editor** de Supabase, ejecutá en este orden:

1. `supabase/migrations/20260915120000_init_avisos.sql` — tabla `avisos`,
   triggers, índices y políticas de RLS.
2. `supabase/migrations/20260915120100_storage_avisos_imagenes.sql` — bucket
   `avisos-imagenes` para las portadas, con sus políticas.

### 4. Configurar Auth

En **Authentication → Providers → Email**, dejalo habilitado.

Para desarrollo conviene desactivar **"Confirm email"**: así el registro te deja
logueado al toque. Si lo dejás activo, agregá
`http://localhost:3000/auth/confirmar` en **Authentication → URL Configuration →
Redirect URLs**.

### 5. Variables de entorno

Creá un archivo `.env.local` en la raíz con los datos del paso 2:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Si quedan los valores de ejemplo, la app falla al arrancar con un mensaje
explícito en vez de tirar un error de red raro.

### 6. Arrancar

```bash
npm run dev
```

→ http://localhost:3000

### 7. (Opcional) Datos de demo

Para no arrancar con la pantalla vacía y poder probar los filtros: registrate una
vez en `/registro` y después ejecutá `supabase/seed.sql` en el SQL Editor. Carga
cinco avisos de ejemplo a tu nombre —cuatro activos y uno pausado, así se ve la
diferencia entre el listado público y `/mis-avisos`—. Se puede correr las veces
que quieras sin duplicar nada, y borrarlos después es solo cuestión de eliminar
esos avisos desde la app.

---

## Comandos

| Comando         | Qué hace                            |
| --------------- | ----------------------------------- |
| `npm run dev`   | Servidor de desarrollo              |
| `npm run build` | Build de producción (incluye `tsc`) |
| `npm start`     | Sirve el build                      |
| `npm run lint`  | ESLint                              |

---

## Estructura

Organización **por feature**, no por tipo de archivo:

```
src/
├── app/         # Solo routing y composición de páginas
├── features/    # Un módulo por dominio (avisos, auth): queries, actions,
│                #   schemas y componentes propios
├── components/  # UI compartida (ui/, layout/, icons/)
├── lib/         # Clientes de Supabase, validación de env vars, utilidades
├── types/       # Tipos de la base
└── proxy.ts     # Refresh de sesión y guardas de ruta
```

La idea es que sumar un dominio nuevo (por ejemplo, mensajería interna) sea crear
`src/features/mensajes/` sin tocar `avisos/`.

El idioma del dominio, los identificadores y los mensajes de usuario es
**castellano rioplatense**; solo las APIs de framework quedan en inglés.

---

## Problemas comunes

**`Could not find the table 'public.avisos' in the schema cache`.** Falta correr
las migraciones: ver el paso 3.

**La imagen se subió pero no se muestra (`"url" parameter is not allowed`).**
`next.config.ts` deriva los hosts permitidos de `NEXT_PUBLIC_SUPABASE_URL` y se
evalúa una sola vez al arrancar. Si cambiaste esa variable, reiniciá `npm run dev`.

---

## Limitaciones conocidas

- **Paginación:** el listado corta en 24 avisos.
- **Taxonomías libres:** instrumento y género son texto libre con sugerencias, y
  el filtro no matchea acentos ("Batería" ≠ "bateria").
- **Sin recuperación de contraseña.**
- **Imágenes huérfanas:** si se sube una portada y se abandona el formulario, el
  archivo queda en el bucket.
- **Sin mensajería interna:** el contacto es por los datos que deja cada aviso.
