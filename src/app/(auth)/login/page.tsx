import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { rutaInternaSegura } from "@/features/auth/schemas";

type Props = {
  searchParams: Promise<{ redirectTo?: string | string[]; error?: string }>;
};

/** Errores que puede devolver `/auth/confirmar`. */
const ERRORES: Record<string, string> = {
  link_invalido: "El link de confirmación no es válido.",
  link_vencido:
    "El link de confirmación venció o ya se usó. Pedí uno nuevo registrándote otra vez.",
};

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entrá a tu cuenta para publicar y administrar tus avisos.",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: Props) {
  const { redirectTo, error } = await searchParams;
  const destino = rutaInternaSegura(
    Array.isArray(redirectTo) ? redirectTo[0] : redirectTo,
  );
  const mensajeError = error ? ERRORES[error] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Solo hace falta cuenta para publicar. Para mirar avisos no necesitás
          entrar.
        </p>
      </CardHeader>
      <CardBody className="space-y-5">
        {mensajeError ? <Alert tone="error">{mensajeError}</Alert> : null}
        <AuthForm modo="login" redirectTo={destino} />
      </CardBody>
    </Card>
  );
}
