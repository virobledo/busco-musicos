import Image from "next/image";
import Link from "next/link";

import { AudioLines, MapPin, Music2 } from "lucide-react";

import { cn, formatearFechaRelativa, truncar } from "@/lib/utils";

import type { AvisoListItem } from "../types";
import { TipoBadge } from "./aviso-badges";

/** Portada del aviso, o un placeholder tonal según el tipo si no tiene imagen. */
function Portada({ aviso }: { aviso: AvisoListItem }) {
  if (aviso.imagen_url) {
    return (
      <Image
        src={aviso.imagen_url}
        alt=""
        fill
        sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-full items-center justify-center",
        aviso.tipo === "busco_musico"
          ? "bg-busco-soft text-busco"
          : "bg-ofrezco-soft text-ofrezco",
      )}
    >
      <AudioLines aria-hidden="true" className="size-9 opacity-50" strokeWidth={1.5} />
    </div>
  );
}

export function AvisoCard({ aviso }: { aviso: AvisoListItem }) {
  return (
    <article className="group h-full">
      <Link
        href={`/avisos/${aviso.id}`}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card",
          "shadow-card transition-[box-shadow,transform,border-color] duration-200",
          "hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-card-hover",
        )}
      >
        <div className="relative aspect-16/10 overflow-hidden bg-surface">
          <Portada aviso={aviso} />
          <TipoBadge
            tipo={aviso.tipo}
            className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base leading-snug font-semibold text-ink">
            {aviso.titulo}
          </h3>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
            {truncar(aviso.descripcion, 130)}
          </p>

          <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Instrumento</dt>
              <Music2 aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              <dd className="font-medium text-ink">{aviso.instrumento}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Ubicación</dt>
              <MapPin aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              <dd>{aviso.ubicacion}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
            <span className="text-xs font-medium text-ink-soft">
              {aviso.genero_musical}
            </span>
            <time
              dateTime={aviso.created_at}
              className="text-xs text-ink-soft/80"
            >
              {formatearFechaRelativa(aviso.created_at)}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}
