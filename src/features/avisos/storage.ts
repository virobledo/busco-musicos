"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { IMAGEN_BUCKET, IMAGEN_EXTENSIONES } from "./constants";
import { pathDesdeUrlPublica, validarImagen } from "./imagen";

/**
 * Subida de la imagen de portada a Supabase Storage.
 *
 * Va del lado del cliente a propósito: las Server Actions tienen un límite de
 * body de 1 MB por defecto y acá aceptamos hasta 5 MB. El archivo viaja
 * directo del navegador a Storage, y al formulario solo le llega la URL final.
 *
 * La ruta es siempre `<user_id>/<uuid>.<ext>`, que es lo que exige la política
 * de RLS del bucket (compara el primer segmento del path contra `auth.uid()`).
 */

export type ResultadoSubida = {
  /** Ruta dentro del bucket: `<user_id>/<uuid>.<ext>`. */
  path: string;
  /** URL pública, que es lo que se guarda en `avisos.imagen_url`. */
  publicUrl: string;
};

export async function subirImagenAviso(
  file: File,
  userId: string,
): Promise<ResultadoSubida> {
  const validacion = validarImagen(file);
  if (!validacion.ok) {
    throw new Error(validacion.error);
  }

  const supabase = createSupabaseBrowserClient();
  const extension = IMAGEN_EXTENSIONES[file.type] ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(IMAGEN_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      // El nombre es único (uuid), así que se puede cachear agresivamente.
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`No pudimos subir la imagen: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(IMAGEN_BUCKET).getPublicUrl(path);

  return { path, publicUrl };
}

/**
 * Borra una imagen del bucket. Se usa cuando alguien reemplaza o quita la
 * portada antes de guardar, para no dejar archivos huérfanos.
 *
 * Es best-effort: si falla (por ejemplo, porque el archivo ya no existe) no
 * tiene sentido romper el flujo de publicación.
 */
export async function borrarImagenAviso(urlOPath: string): Promise<void> {
  const path = urlOPath.startsWith("http")
    ? pathDesdeUrlPublica(urlOPath)
    : urlOPath;

  if (!path) return;

  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(IMAGEN_BUCKET).remove([path]);
}
