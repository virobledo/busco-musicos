import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { AudioLines, MapPin, Music2, Plus } from "lucide-react";

import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AvisoAcciones } from "@/features/avisos/components/aviso-acciones";
import {
  EstadoBadge,
  TipoBadge,
} from "@/features/avisos/components/aviso-badges";
import { ESTADO_AVISO_AYUDA } from "@/features/avisos/constants";
import { listarMisAvisos } from "@/features/avisos/queries";
import type { Aviso } from "@/features/avisos/types";
import { requerirUsuario } from "@/features/auth/queries";
import { cn, formatearFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mis avisos",
  robots: { index: false },
};

function Miniatura({ aviso }: { aviso: Aviso }) {
  return (
    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-surface sm:size-24">
      {aviso.imagen_url ? (
        <Image
          src={aviso.imagen_url}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        <div
          className={cn(
            "grid size-full place-items-center",
            aviso.tipo === "busco_musico"
              ? "bg-busco-soft text-busco"
              : "bg-ofrezco-soft text-ofrezco",
          )}
        >
          <AudioLines aria-hidden="true" className="size-6 opacity-50" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

function MiAvisoFila({ aviso }: { aviso: Aviso }) {
  return (
    <li
      className={cn(
        "rounded-xl border border-line bg-card p-4 shadow-card sm:p-5",
        aviso.estado === "cerrado" && "opacity-70",
      )}
    >
      <div className="flex gap-4">
        <Miniatura aviso={aviso} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TipoBadge tipo={aviso.tipo} conIcono={false} />
            <EstadoBadge estado={aviso.estado} />
          </div>

          <h2 className="mt-2 truncate text-base font-semibold text-ink">
            <Link
              href={`/avisos/${aviso.id}`}
              className="hover:underline underline-offset-4"
            >
              {aviso.titulo}
            </Link>
          </h2>

          <dl className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
            <div className="flex items-center gap-1.5">
              <Music2 aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
              <dt className="sr-only">Instrumento</dt>
              <dd>{aviso.instrumento}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
              <dt className="sr-only">Ubicación</dt>
              <dd>{aviso.ubicacion}</dd>
            </div>
            <div>
              <dt className="sr-only">Publicado</dt>
              <dd>
                <time dateTime={aviso.created_at}>
                  {formatearFecha(aviso.created_at)}
                </time>
              </dd>
            </div>
          </dl>

          <p className="mt-1.5 text-xs text-ink-soft">
            {ESTADO_AVISO_AYUDA[aviso.estado]}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <AvisoAcciones id={aviso.id} estado={aviso.estado} />
      </div>
    </li>
  );
}

export default async function MisAvisosPage() {
  const user = await requerirUsuario("/mis-avisos");
  const avisos = await listarMisAvisos(user.id);

  const activos = avisos.filter((a) => a.estado === "activo").length;

  return (
    <Container className="py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Mis avisos
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {avisos.length === 0
              ? "Todavía no publicaste ninguno."
              : `${avisos.length} ${avisos.length === 1 ? "aviso" : "avisos"} · ${activos} ${activos === 1 ? "activo" : "activos"}`}
          </p>
        </div>

        <Link href="/avisos/nuevo" className={buttonStyles()}>
          <Plus aria-hidden="true" className="size-4" />
          Publicar aviso
        </Link>
      </header>

      <div className="mt-8">
        {avisos.length === 0 ? (
          <EmptyState
            icon={AudioLines}
            titulo="Todavía no publicaste avisos"
            descripcion="Publicá el primero y empezá a recibir contactos de músicos y bandas."
          >
            <Link href="/avisos/nuevo" className={buttonStyles()}>
              <Plus aria-hidden="true" className="size-4" />
              Publicar mi primer aviso
            </Link>
          </EmptyState>
        ) : (
          <ul className="space-y-4">
            {avisos.map((aviso) => (
              <MiAvisoFila key={aviso.id} aviso={aviso} />
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
