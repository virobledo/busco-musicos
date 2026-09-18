import type { AvisoEstado, AvisoRow, AvisoTipo } from "@/types/database";

export type { AvisoEstado, AvisoRow, AvisoTipo };

/** Aviso completo, como se muestra en la página de detalle. */
export type Aviso = AvisoRow;

/**
 * Subconjunto de columnas que necesita una card del listado.
 * Se pide explícitamente en el `select()` para no traer contacto ni links de
 * más de 24 avisos que nadie va a leer todavía.
 */
export const COLUMNAS_LISTADO =
  "id, tipo, titulo, descripcion, instrumento, genero_musical, ubicacion, imagen_url, estado, created_at" as const;

export type AvisoListItem = Pick<
  AvisoRow,
  | "id"
  | "tipo"
  | "titulo"
  | "descripcion"
  | "instrumento"
  | "genero_musical"
  | "ubicacion"
  | "imagen_url"
  | "estado"
  | "created_at"
>;

/** Filtros del listado público, ya normalizados desde los search params. */
export type FiltrosAvisos = {
  tipo?: AvisoTipo;
  instrumento?: string;
  genero?: string;
  ubicacion?: string;
  q?: string;
};
