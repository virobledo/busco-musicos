import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/** Rutas que requieren sesión. Todo lo demás es público. */
const RUTAS_PRIVADAS = ["/avisos/nuevo", "/mis-avisos"];

function esRutaPrivada(pathname: string) {
  return (
    RUTAS_PRIVADAS.some(
      (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
    ) || /^\/avisos\/[^/]+\/editar$/.test(pathname)
  );
}

/**
 * Refresca el token de sesión en cada request y lo reescribe en las cookies.
 *
 * Sin esto, los Server Components terminarían leyendo un access token vencido
 * (no pueden escribir cookies para renovarlo por su cuenta).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANTE: `getUser()` valida el token contra el servidor de Auth. No
  // reemplazar por `getSession()`, que confía en la cookie sin verificarla.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && esRutaPrivada(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (user && (pathname === "/login" || pathname === "/registro")) {
    const home = request.nextUrl.clone();
    home.pathname = "/mis-avisos";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}
