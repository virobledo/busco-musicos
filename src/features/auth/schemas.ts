import { z } from "zod";

export const credencialesSchema = z.object({
  // trim + lowercase antes de validar, para que " Juan@Mail.com " pase.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Ingresá un email válido.")),
  password: z
    .string()
    .min(8, "La contraseña tiene que tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres."),
});

export type Credenciales = z.infer<typeof credencialesSchema>;

/**
 * Solo aceptamos rutas internas como destino post-login.
 * Evita open redirects del estilo `/login?redirectTo=https://malicioso.com`.
 */
export function rutaInternaSegura(valor: unknown, fallback = "/mis-avisos") {
  if (typeof valor !== "string") return fallback;
  if (!valor.startsWith("/")) return fallback;
  if (valor.startsWith("//")) return fallback;
  return valor;
}
