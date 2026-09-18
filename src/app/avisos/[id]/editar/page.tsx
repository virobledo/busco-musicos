import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { AvisoForm } from "@/features/avisos/components/aviso-form";
import { getAviso } from "@/features/avisos/queries";
import { requerirUsuario } from "@/features/auth/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar aviso",
  robots: { index: false },
};

export default async function EditarAvisoPage({ params }: Props) {
  const { id } = await params;
  const user = await requerirUsuario(`/avisos/${id}/editar`);
  const aviso = await getAviso(id);

  // 404 tanto si no existe como si es de otra persona: no revelamos la
  // diferencia. El UPDATE está bloqueado igual por RLS.
  if (!aviso || aviso.user_id !== user.id) notFound();

  return (
    <Container className="py-8 sm:py-12">
      <Link
        href={`/avisos/${aviso.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Volver al aviso
      </Link>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Editar aviso
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Los cambios se ven al instante en el listado público.
        </p>
      </header>

      <div className="mt-10 max-w-4xl">
        <AvisoForm userId={user.id} emailUsuario={user.email} aviso={aviso} />
      </div>
    </Container>
  );
}
