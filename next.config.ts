import type { NextConfig } from "next";

/**
 * El bucket `avisos-imagenes` es público, así que las imágenes se sirven desde
 * `<project-ref>.supabase.co/storage/v1/object/public/...`. Hay que habilitar
 * ese host en `next/image`.
 *
 * Se deriva de la env var en lugar de hardcodearlo, para que el mismo config
 * sirva en cualquier proyecto de Supabase.
 *
 * OJO: este archivo se evalúa UNA SOLA VEZ al arrancar el server. Next recarga
 * `.env.local` en caliente, pero no vuelve a correr este config, así que si
 * cambiás `NEXT_PUBLIC_SUPABASE_URL` hay que reiniciar `npm run dev`. Si no,
 * `next/image` sigue con el hostname viejo y responde
 * `"url" parameter is not allowed`.
 */
function supabaseImagePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const { protocol, hostname } = new URL(url);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    // URL inválida: `src/lib/env.ts` va a tirar un error mucho más claro.
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePattern(),
  },
};

export default nextConfig;
