/**
 * Helpers de imagen isomórficos (sirven en cliente y en servidor).
 * La parte que habla con Storage desde el navegador está en `storage.ts`.
 */

import {
  IMAGEN_BUCKET,
  IMAGEN_MAX_BYTES,
  IMAGEN_TIPOS_PERMITIDOS,
} from "./constants";

const MB = 1024 * 1024;

export type ValidacionImagen = { ok: true } | { ok: false; error: string };

/** Valida tipo y tamaño antes de gastar ancho de banda en la subida. */
export function validarImagen(file: File): ValidacionImagen {
  if (!IMAGEN_TIPOS_PERMITIDOS.includes(file.type as never)) {
    return {
      ok: false,
      error: "Formato no permitido. Subí un archivo JPG, PNG o WebP.",
    };
  }

  if (file.size === 0) {
    return { ok: false, error: "El archivo está vacío." };
  }

  if (file.size > IMAGEN_MAX_BYTES) {
    const pesa = (file.size / MB).toFixed(1);
    return {
      ok: false,
      error: `La imagen pesa ${pesa} MB y el máximo es ${IMAGEN_MAX_BYTES / MB} MB.`,
    };
  }

  return { ok: true };
}

const MARCADOR_PUBLICO = `/storage/v1/object/public/${IMAGEN_BUCKET}/`;

/**
 * Ruta interna del bucket a partir de una URL pública.
 * Devuelve `null` si la URL no apunta a nuestro bucket (por ejemplo, si
 * alguien pegó a mano un link a otro dominio).
 */
export function pathDesdeUrlPublica(url: string): string | null {
  const indice = url.indexOf(MARCADOR_PUBLICO);
  if (indice === -1) return null;

  const path = decodeURIComponent(url.slice(indice + MARCADOR_PUBLICO.length));
  return path.length > 0 ? path : null;
}

/** `true` si la URL es una imagen alojada en nuestro propio bucket. */
export function esImagenPropia(url: string | null): boolean {
  return url !== null && pathDesdeUrlPublica(url) !== null;
}
