import Link from "next/link";
import type { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { AvisoForm } from "@/features/avisos/components/aviso-form";
import { requerirUsuario } from "@/features/auth/queries";

export const metadata: Metadata = {
  title: "Publicar un aviso",
  description:
    "Publicá que buscás músico o que te ofrecés para tocar. Es gratis y sale en dos minutos.",
};

export default async function NuevoAvisoPage() {
  // Segunda barrera: el middleware ya redirige, pero la página no depende de él.
  const user = await requerirUsuario("/avisos/nuevo");

  return (
    <Container className="py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Volver a los avisos
      </Link>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Publicar un aviso
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Completá los datos del proyecto. Una vez publicado, cualquiera puede
          verlo sin necesidad de tener cuenta.
        </p>
      </header>

      <div className="mt-10 max-w-4xl">
        <AvisoForm userId={user.id} emailUsuario={user.email} />
      </div>
    </Container>
  );
}
