import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  SquarePen,
  Tag,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Alert } from "@/components/ui/alert";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EstadoBadge,
  TipoBadge,
} from "@/features/avisos/components/aviso-badges";
import { RedesLinks } from "@/features/avisos/components/redes-links";
import { getAviso } from "@/features/avisos/queries";
import { getUsuarioActual } from "@/features/auth/queries";
import { formatearFecha, truncar } from "@/lib/utils";
import type { Aviso } from "@/features/avisos/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const aviso = await getAviso((await params).id);

  if (!aviso) return { title: "Aviso no encontrado" };

  return {
    title: aviso.titulo,
    description: truncar(aviso.descripcion, 155),
    openGraph: {
      title: aviso.titulo,
      description: truncar(aviso.descripcion, 155),
      images: aviso.imagen_url ? [{ url: aviso.imagen_url }] : undefined,
    },
  };
}

/** Link de WhatsApp si el teléfono tiene pinta de número; si no, `tel:`. */
function linkTelefono(telefono: string) {
  const soloDigitos = telefono.replace(/\D/g, "");
  return soloDigitos.length >= 8
    ? `https://wa.me/${soloDigitos}`
    : `tel:${telefono}`;
}

function Contacto({ aviso }: { aviso: Aviso }) {
  const asunto = encodeURIComponent(`Tu aviso en Busco Músicos: ${aviso.titulo}`);

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle className="text-base">Contacto</CardTitle>
        <p className="mt-1 text-sm text-ink-soft">{aviso.contacto_nombre}</p>
      </CardHeader>
      <CardBody className="space-y-3">
        <a
          href={`mailto:${aviso.contacto_email}?subject=${asunto}`}
          className={buttonStyles({
            variant: aviso.tipo === "busco_musico" ? "primario" : "ofrezco",
            className: "w-full",
          })}
        >
          <Mail aria-hidden="true" className="size-4" />
          Escribir un mail
        </a>

        {aviso.contacto_telefono ? (
          <a
            href={linkTelefono(aviso.contacto_telefono)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: "contorno", className: "w-full" })}
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            {aviso.contacto_telefono}
          </a>
        ) : null}

        <dl className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex items-center gap-2 text-ink-soft">
            <Mail aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            <dt className="sr-only">Email</dt>
            <dd className="truncate">{aviso.contacto_email}</dd>
          </div>
          {aviso.contacto_telefono ? (
            <div className="flex items-center gap-2 text-ink-soft">
              <Phone aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              <dt className="sr-only">Teléfono</dt>
              <dd>{aviso.contacto_telefono}</dd>
            </div>
          ) : null}
        </dl>
      </CardBody>
    </Card>
  );
}

export default async function AvisoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const [aviso, usuario, query] = await Promise.all([
    getAviso(id),
    getUsuarioActual(),
    searchParams,
  ]);

  // RLS ya devuelve `null` para avisos pausados o cerrados de otra persona.
  if (!aviso) notFound();

  const esMio = usuario?.id === aviso.user_id;
  const recienPublicado = query.publicado === "1";
  const recienActualizado = query.actualizado === "1";

  return (
    <Container className="py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Volver a los avisos
      </Link>

      {recienPublicado ? (
        <Alert tone="exito" className="mt-6">
          ¡Listo! Tu aviso ya está publicado y visible para todos.
        </Alert>
      ) : null}
      {recienActualizado ? (
        <Alert tone="exito" className="mt-6">
          Guardamos los cambios.
        </Alert>
      ) : null}

      {esMio && aviso.estado !== "activo" ? (
        <Alert tone="info" className="mt-6">
          Este aviso está <strong>{aviso.estado}</strong>, así que solo lo ves
          vos. Podés reactivarlo desde{" "}
          <Link href="/mis-avisos">Mis avisos</Link>.
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        {/* ---------------- Columna principal ---------------- */}
        <article>
          {aviso.imagen_url ? (
            <div className="relative aspect-16/9 overflow-hidden rounded-xl border border-line bg-card">
              <Image
                src={aviso.imagen_url}
                alt={`Imagen del aviso: ${aviso.titulo}`}
                fill
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className={aviso.imagen_url ? "mt-6" : undefined}>
            <div className="flex flex-wrap items-center gap-2">
              <TipoBadge tipo={aviso.tipo} />
              {esMio ? <EstadoBadge estado={aviso.estado} /> : null}
            </div>

            <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
              {aviso.titulo}
            </h1>

            <dl className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
              <div className="flex items-center gap-1.5">
                <Music2 aria-hidden="true" className="size-4" strokeWidth={1.75} />
                <dt className="sr-only">Instrumento</dt>
                <dd className="font-medium text-ink">{aviso.instrumento}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag aria-hidden="true" className="size-4" strokeWidth={1.75} />
                <dt className="sr-only">Género</dt>
                <dd>{aviso.genero_musical}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-4" strokeWidth={1.75} />
                <dt className="sr-only">Ubicación</dt>
                <dd>{aviso.ubicacion}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="size-4" strokeWidth={1.75} />
                <dt className="sr-only">Publicado</dt>
                <dd>
                  <time dateTime={aviso.created_at}>
                    {formatearFecha(aviso.created_at)}
                  </time>
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-line pt-8">
              <p className="text-base leading-relaxed whitespace-pre-line text-ink">
                {aviso.descripcion}
              </p>
            </div>

            <RedesLinks aviso={aviso} className="mt-8" />

            {esMio ? (
              <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-8">
                <Link
                  href={`/avisos/${aviso.id}/editar`}
                  className={buttonStyles({ variant: "contorno" })}
                >
                  <SquarePen aria-hidden="true" className="size-4" />
                  Editar aviso
                </Link>
                <Link
                  href="/mis-avisos"
                  className={buttonStyles({ variant: "fantasma" })}
                >
                  Ir a mis avisos
                </Link>
              </div>
            ) : null}
          </div>
        </article>

        {/* ---------------- Sidebar ---------------- */}
        <aside>
          <Contacto aviso={aviso} />
        </aside>
      </div>
    </Container>
  );
}
