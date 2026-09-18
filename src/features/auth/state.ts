/**
 * Estado de los formularios de auth.
 *
 * Vive fuera de `actions.ts` porque un archivo con `"use server"` solo puede
 * exportar funciones async: cualquier constante exportada rompe el build.
 */

export type AuthState = {
  /** Error general (credenciales, red, rate limit). */
  error?: string;
  /** Mensaje de éxito que no implica navegar (ej: "revisá tu casilla"). */
  aviso?: string;
  /** Se devuelve para no perder lo tipeado si la validación falla. */
  email?: string;
};

export const authStateInicial: AuthState = {};
