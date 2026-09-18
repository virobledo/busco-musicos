import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para el servidor: Server Components, Server Actions y
 * Route Handlers.
 *
 * Se crea uno por request (nunca guardar la instancia en una variable de
 * módulo) porque va atado a las cookies de sesión de ese request.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Los Server Components no pueden escribir cookies. Se ignora a
            // propósito: el middleware (`src/middleware.ts`) ya se encarga de
            // refrescar la sesión y persistir las cookies nuevas.
          }
        },
      },
    },
  );
}
