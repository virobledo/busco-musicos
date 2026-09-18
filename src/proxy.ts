import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Convención `proxy` de Next 16 (lo que antes era `middleware`).
 *
 * Su único trabajo acá es refrescar el token de Supabase en cada navegación y
 * bloquear las rutas privadas antes de llegar a la página.
 */
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Todo menos assets estáticos e imágenes, para que la sesión se refresque
     * en cualquier navegación real.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
