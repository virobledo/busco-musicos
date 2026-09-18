"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { credencialesSchema, rutaInternaSegura } from "./schemas";
import type { AuthState } from "./state";

/** Traduce los errores de Supabase Auth a mensajes en castellano. */
function mensajeDeError(code: string | undefined, fallback: string) {
  switch (code) {
    case "invalid_credentials":
      return "Email o contraseña incorrectos.";
    case "email_not_confirmed":
      return "Todavía no confirmaste tu email. Revisá tu casilla.";
    case "user_already_exists":
    case "email_exists":
      return "Ya existe una cuenta con ese email. Probá iniciar sesión.";
    case "weak_password":
      return "La contraseña es demasiado débil. Usá al menos 8 caracteres.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Demasiados intentos. Esperá un momento y volvé a probar.";
    case "signup_disabled":
      return "El registro está deshabilitado en este momento.";
    default:
      return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/* Iniciar sesión                                                             */
/* -------------------------------------------------------------------------- */

export async function iniciarSesion(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const parsed = credencialesSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.",
      email,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error: mensajeDeError(error.code, "No pudimos iniciar sesión."),
      email,
    };
  }

  const destino = rutaInternaSegura(formData.get("redirectTo"));
  revalidatePath("/", "layout");
  redirect(destino);
}

/* -------------------------------------------------------------------------- */
/* Registro                                                                   */
/* -------------------------------------------------------------------------- */

export async function registrarse(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const parsed = credencialesSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.",
      email,
    };
  }

  if (formData.get("password") !== formData.get("password_confirmacion")) {
    return { error: "Las contraseñas no coinciden.", email };
  }

  const destino = rutaInternaSegura(formData.get("redirectTo"));
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirmar?next=${encodeURIComponent(destino)}`,
    },
  });

  if (error) {
    return {
      error: mensajeDeError(error.code, "No pudimos crear la cuenta."),
      email,
    };
  }

  // Si el proyecto tiene "Confirm email" activo, `signUp` no devuelve sesión:
  // hay que esperar a que la persona haga clic en el mail.
  if (!data.session) {
    return {
      aviso:
        "Te mandamos un mail para confirmar la cuenta. Abrilo y volvé para iniciar sesión.",
      email,
    };
  }

  revalidatePath("/", "layout");
  redirect(destino);
}

/* -------------------------------------------------------------------------- */
/* Cerrar sesión                                                              */
/* -------------------------------------------------------------------------- */

export async function cerrarSesion() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
