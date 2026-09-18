import { z } from "zod";

/**
 * Validación de variables de entorno.
 *
 * Las `NEXT_PUBLIC_*` se referencian de forma literal a propósito: Next las
 * reemplaza en tiempo de build, y eso solo funciona con acceso directo a
 * `process.env.NEXT_PUBLIC_X` (no con `process.env[key]`).
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(
    "NEXT_PUBLIC_SUPABASE_URL tiene que ser una URL válida (https://xxx.supabase.co).",
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY."),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

const AYUDA =
  "Copiá `.env.example` a `.env.local` y completá los valores con los de tu " +
  "proyecto: Supabase → Project Settings → API.";

if (!parsed.success) {
  const detalle = parsed.error.issues
    .map((issue) => `  · ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Configuración de entorno inválida.\n${detalle}\n\n${AYUDA}`);
}

// Los valores de ejemplo pasan la validación de formato pero no apuntan a
// ningún proyecto real: mejor fallar acá que con un error de red opaco.
if (
  parsed.data.NEXT_PUBLIC_SUPABASE_URL.includes("tu-proyecto") ||
  parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith("tu-anon-key")
) {
  throw new Error(
    `Las variables de Supabase todavía tienen los valores de ejemplo.\n\n${AYUDA}`,
  );
}

export const env = parsed.data;
