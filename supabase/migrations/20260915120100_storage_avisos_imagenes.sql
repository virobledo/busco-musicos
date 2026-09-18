-- ---------------------------------------------------------------------------
-- Busco Músicos · bucket de imágenes de portada
--
-- El archivo va directo del navegador a Storage (`features/avisos/storage.ts`),
-- sin pasar por la Server Action: el límite de body de una action es 1 MB y acá
-- se aceptan hasta 5 MB.
--
-- El límite de tamaño y los MIME types tienen que coincidir con
-- `src/features/avisos/constants.ts` (IMAGEN_MAX_BYTES, IMAGEN_TIPOS_PERMITIDOS).
--
-- Ejecutar después de `20260915120000_init_avisos.sql`.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avisos-imagenes',
  'avisos-imagenes',
  true,                                            -- las portadas se ven sin sesión
  5242880,                                         -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Políticas
--
-- La ruta de cada objeto es siempre `<user_id>/<uuid>.<ext>`, así que alcanza
-- con comparar la primera carpeta del path contra `auth.uid()` para que nadie
-- pueda escribir en la carpeta de otro.
-- ---------------------------------------------------------------------------

drop policy if exists "Las portadas son públicas" on storage.objects;
create policy "Las portadas son públicas"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'avisos-imagenes');

drop policy if exists "Cada usuario sube a su carpeta" on storage.objects;
create policy "Cada usuario sube a su carpeta"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avisos-imagenes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Cada usuario reemplaza lo suyo" on storage.objects;
create policy "Cada usuario reemplaza lo suyo"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avisos-imagenes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avisos-imagenes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Cada usuario borra lo suyo" on storage.objects;
create policy "Cada usuario borra lo suyo"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avisos-imagenes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
