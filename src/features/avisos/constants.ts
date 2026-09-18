import type { BadgeTone } from "@/components/ui/badge";
import type { AvisoEstado, AvisoTipo } from "@/types/database";

/* -------------------------------------------------------------------------- */
/* Tipo de aviso                                                              */
/* -------------------------------------------------------------------------- */

export const TIPOS_AVISO = [
  {
    value: "busco_musico",
    label: "Busco músico",
    descripcion: "Soy una banda o proyecto y necesito sumar a alguien.",
    tone: "busco",
  },
  {
    value: "me_ofrezco",
    label: "Me ofrezco",
    descripcion: "Soy músico y quiero sumarme a un proyecto.",
    tone: "ofrezco",
  },
] as const satisfies ReadonlyArray<{
  value: AvisoTipo;
  label: string;
  descripcion: string;
  tone: BadgeTone;
}>;

export const TIPO_AVISO_LABEL: Record<AvisoTipo, string> = {
  busco_musico: "Busco músico",
  me_ofrezco: "Me ofrezco",
};

export const TIPO_AVISO_TONE: Record<AvisoTipo, BadgeTone> = {
  busco_musico: "busco",
  me_ofrezco: "ofrezco",
};

/* -------------------------------------------------------------------------- */
/* Estado                                                                     */
/* -------------------------------------------------------------------------- */

export const ESTADO_AVISO_LABEL: Record<AvisoEstado, string> = {
  activo: "Activo",
  pausado: "Pausado",
  cerrado: "Cerrado",
};

export const ESTADO_AVISO_TONE: Record<AvisoEstado, BadgeTone> = {
  activo: "busco",
  pausado: "silencioso",
  cerrado: "peligro",
};

export const ESTADO_AVISO_AYUDA: Record<AvisoEstado, string> = {
  activo: "Visible en el listado público.",
  pausado: "Oculto del listado. Solo lo ves vos.",
  cerrado: "Archivado. Ya no recibe contactos.",
};

/* -------------------------------------------------------------------------- */
/* Taxonomías                                                                 */
/*                                                                            */
/* Son sugerencias, no una restricción: en la base `instrumento` y            */
/* `genero_musical` son `text` libre y el formulario usa <datalist>, así que   */
/* alguien puede cargar "theremin" sin que esté en esta lista.                */
/* Si más adelante se quiere una taxonomía estricta, pasan a tablas propias.  */
/* -------------------------------------------------------------------------- */

export const INSTRUMENTOS = [
  "Voz",
  "Guitarra",
  "Guitarra criolla",
  "Bajo",
  "Batería",
  "Percusión",
  "Teclado",
  "Piano",
  "Acordeón",
  "Bandoneón",
  "Violín",
  "Violonchelo",
  "Contrabajo",
  "Saxo",
  "Trompeta",
  "Trombón",
  "Flauta",
  "Armónica",
  "Charango",
  "Quena",
  "Banjo",
  "Ukelele",
  "DJ / Producción",
  "Técnico de sonido",
] as const;

export const GENEROS_MUSICALES = [
  "Rock",
  "Pop",
  "Indie",
  "Metal",
  "Punk",
  "Hardcore",
  "Blues",
  "Jazz",
  "Funk",
  "Soul",
  "R&B",
  "Hip hop",
  "Electrónica",
  "Reggae",
  "Ska",
  "Cumbia",
  "Cuarteto",
  "Tango",
  "Folklore",
  "Chamamé",
  "Bossa nova",
  "Latin",
  "Reggaetón",
  "Clásica",
  "Coral",
  "Música de cámara",
  "Covers / Fiestas",
] as const;

/** Cantidad máxima de avisos que devuelve el listado público. */
export const AVISOS_POR_PAGINA = 24;

/* -------------------------------------------------------------------------- */
/* Imagen de portada                                                          */
/*                                                                            */
/* Estos valores tienen que coincidir con los del bucket, definidos en         */
/* supabase/migrations/20260915120100_storage_avisos_imagenes.sql              */
/* -------------------------------------------------------------------------- */

export const IMAGEN_BUCKET = "avisos-imagenes";

export const IMAGEN_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const IMAGEN_TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Extensiones equivalentes, para el `accept` del input y el nombre final. */
export const IMAGEN_EXTENSIONES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const IMAGEN_ACCEPT = IMAGEN_TIPOS_PERMITIDOS.join(",");
