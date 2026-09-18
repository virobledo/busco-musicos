"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para el navegador (Client Components).
 *
 * Se usa para lo que tiene que pasar del lado del cliente: la subida de
 * imágenes a Storage. Todo el resto (lecturas y escrituras en `avisos`) va por
 * Server Components y Server Actions con el cliente de `server.ts`.
 *
 * `createBrowserClient` memoiza internamente, así que llamarla en varios
 * componentes no crea varias conexiones.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
