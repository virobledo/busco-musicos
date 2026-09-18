-- ---------------------------------------------------------------------------
-- Busco Músicos · schema base
--
-- Crea los enums, la tabla `avisos`, sus triggers, índices y políticas de RLS.
-- Los límites de cada CHECK replican los de `src/features/avisos/schemas.ts`:
-- si cambiás uno, cambiá el otro.
--
-- Ejecutar en el SQL Editor de Supabase antes que
-- `20260915120100_storage_avisos_imagenes.sql`.
-- ---------------------------------------------------------------------------

-- `gen_random_uuid()`. En Supabase ya viene instalada; el `if not exists` es
-- para que el script corra igual en una Postgres pelada.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  create type public.aviso_tipo as enum ('busco_musico', 'me_ofrezco');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.aviso_estado as enum ('activo', 'pausado', 'cerrado');
exception
  when duplicate_object then null;
end
$$;

-- ---------------------------------------------------------------------------
-- Tabla
-- ---------------------------------------------------------------------------

create table if not exists public.avisos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,

  tipo           public.aviso_tipo not null,
  titulo         text not null,
  descripcion    text not null,
  instrumento    text not null,
  genero_musical text not null,
  ubicacion      text not null,

  imagen_url     text,
  youtube_url    text,
  instagram_url  text,
  otra_red_url   text,

  contacto_nombre   text not null,
  contacto_email    text not null,
  contacto_telefono text,

  estado     public.aviso_estado not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint avisos_titulo_largo
    check (char_length(titulo) between 5 and 120),
  constraint avisos_descripcion_largo
    check (char_length(descripcion) between 20 and 5000),
  constraint avisos_instrumento_largo
    check (char_length(instrumento) between 2 and 60),
  constraint avisos_genero_largo
    check (char_length(genero_musical) between 2 and 60),
  constraint avisos_ubicacion_largo
    check (char_length(ubicacion) between 2 and 120),
  constraint avisos_contacto_nombre_largo
    check (char_length(contacto_nombre) between 2 and 80),

  constraint avisos_contacto_email_formato
    check (
      -- 320 es el máximo que permite el RFC: el CHECK no tiene que rechazar
      -- nada que Zod haya dado por bueno.
      char_length(contacto_email) <= 320
      and contacto_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ),
  constraint avisos_contacto_telefono_largo
    check (
      contacto_telefono is null
      or char_length(contacto_telefono) between 6 and 30
    ),

  -- La portada tiene que ser una imagen de los formatos que acepta el bucket.
  -- Tercera capa de validación, después del navegador y del propio bucket.
  constraint avisos_imagen_url_formato
    check (
      imagen_url is null
      or (
        char_length(imagen_url) <= 600
        and imagen_url ~* '^https?://'
        and imagen_url ~* '\.(jpg|jpeg|png|webp)$'
      )
    ),
  constraint avisos_youtube_url_formato
    check (
      youtube_url is null
      or (char_length(youtube_url) <= 600 and youtube_url ~* '^https?://')
    ),
  constraint avisos_instagram_url_formato
    check (
      instagram_url is null
      or (char_length(instagram_url) <= 600 and instagram_url ~* '^https?://')
    ),
  constraint avisos_otra_red_url_formato
    check (
      otra_red_url is null
      or (char_length(otra_red_url) <= 600 and otra_red_url ~* '^https?://')
    )
);

comment on table public.avisos is
  'Clasificados de músicos y bandas. Solo los de estado activo son públicos.';

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.avisos_tocar_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- El dueño y la fecha de creación no se tocan: aunque RLS ya impide que otro
-- usuario edite el aviso, sin esto el dueño podría regalárselo a un tercero.
create or replace function public.avisos_bloquear_inmutables()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'No se puede cambiar el dueño de un aviso.';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'No se puede cambiar la fecha de creación de un aviso.';
  end if;

  return new;
end;
$$;

drop trigger if exists avisos_bloquear_inmutables on public.avisos;
create trigger avisos_bloquear_inmutables
  before update on public.avisos
  for each row
  execute function public.avisos_bloquear_inmutables();

drop trigger if exists avisos_tocar_updated_at on public.avisos;
create trigger avisos_tocar_updated_at
  before update on public.avisos
  for each row
  execute function public.avisos_tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

-- Listado público: filtra por estado y ordena por fecha descendente.
create index if not exists avisos_listado_idx
  on public.avisos (estado, created_at desc);

-- Panel "mis avisos".
create index if not exists avisos_user_id_idx
  on public.avisos (user_id, created_at desc);

-- Los filtros usan `ilike` sin comodines sobre estas dos columnas.
create index if not exists avisos_instrumento_idx
  on public.avisos (lower(instrumento));

create index if not exists avisos_genero_musical_idx
  on public.avisos (lower(genero_musical));

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Esta es la fuente de verdad de la autorización: el código de la app agrega
-- chequeos redundantes, pero si alguno se escapa, la base frena igual.
-- ---------------------------------------------------------------------------

alter table public.avisos enable row level security;

-- Las dos políticas de SELECT se combinan con OR: cualquiera ve los avisos
-- activos, y encima de eso el dueño ve los suyos en cualquier estado.
drop policy if exists "Los avisos activos son públicos" on public.avisos;
create policy "Los avisos activos son públicos"
  on public.avisos
  for select
  to anon, authenticated
  using (estado = 'activo');

drop policy if exists "El dueño ve todos sus avisos" on public.avisos;
create policy "El dueño ve todos sus avisos"
  on public.avisos
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "El dueño crea sus avisos" on public.avisos;
create policy "El dueño crea sus avisos"
  on public.avisos
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "El dueño edita sus avisos" on public.avisos;
create policy "El dueño edita sus avisos"
  on public.avisos
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "El dueño borra sus avisos" on public.avisos;
create policy "El dueño borra sus avisos"
  on public.avisos
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
