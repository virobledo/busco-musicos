import { NextResponse, type NextRequest } from "next/server";

import type { EmailOtpType } from "@supabase/supabase-js";

import { rutaInternaSegura } from "@/features/auth/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Destino del link de confirmación de email que manda Supabase.
 *
 * Solo hace falta si en el dashboard está activo
 * Authentication → Email → "Confirm email". Si está desactivado (lo cómodo
 * para desarrollo), `signUp` devuelve sesión directamente y esta ruta no se usa.
 *
 * Hay que declararla en Authentication → URL Configuration → Redirect URLs:
 *   http://localhost:3000/auth/confirmar
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = rutaInternaSegura(searchParams.get("next"), "/mis-avisos");

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL("/login?error=link_invalido", request.url),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=link_vencido", request.url),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
