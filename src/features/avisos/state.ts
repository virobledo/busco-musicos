import type { AvisoFormValues } from "./schemas";

/**
 * Estado de los formularios y acciones de avisos.
 *
 * Vive fuera de `actions.ts` porque un archivo con `"use server"` solo puede
 * exportar funciones async: cualquier constante exportada rompe el build.
 */

export type AvisoFormState = {
  /** Error general (permisos, red, base de datos). */
  error?: string;
  /** Errores por campo, para pintarlos al lado de cada input. */
  errores?: Record<string, string>;
  /** Lo que la persona había tipeado, para no perderlo. */
  valores?: AvisoFormValues;
};

export const avisoFormStateInicial: AvisoFormState = {};

/** Resultado de las acciones que no son formularios (pausar, cerrar, borrar). */
export type AccionSimpleState = {
  error?: string;
  ok?: boolean;
};
