import { redirect } from "next/navigation";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Usuario de la sesión actual, o `null` si no hay login.
 *
 * Usa `getUser()` (no `getSession()`) porque valida el token contra el
 * servidor de Auth en lugar de confiar en la cookie.
 */
export async function getUsuarioActual(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Igual que `getUsuarioActual`, pero redirige al login si no hay sesión.
 * El middleware ya protege estas rutas; esto es la segunda barrera, para que
 * ninguna página o action dependa solo de él.
 */
export async function requerirUsuario(redirectTo?: string): Promise<User> {
  const user = await getUsuarioActual();

  if (!user) {
    const destino = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(destino);
  }

  return user;
}
