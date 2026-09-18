import type { Metadata } from "next";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { rutaInternaSegura } from "@/features/auth/schemas";

type Props = {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta para publicar avisos en Busco Músicos.",
  robots: { index: false },
};

export default async function RegistroPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;
  const destino = rutaInternaSegura(
    Array.isArray(redirectTo) ? redirectTo[0] : redirectTo,
    "/avisos/nuevo",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Con email y contraseña alcanza. La usás para publicar tus avisos y
          editarlos después.
        </p>
      </CardHeader>
      <CardBody>
        <AuthForm modo="registro" redirectTo={destino} />
      </CardBody>
    </Card>
  );
}
