import Link from "next/link";
import { Suspense } from "react";

import { SearchX } from "lucide-react";

import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AvisoCard } from "@/features/avisos/components/aviso-card";
import { AvisosFiltros } from "@/features/avisos/components/avisos-filtros";
import { listarAvisos, listarUbicaciones } from "@/features/avisos/queries";
import {
  filtrosDesdeSearchParams,
  type SearchParamsCrudos,
} from "@/features/avisos/schemas";

type Props = {
  searchParams: Promise<SearchParamsCrudos>;
};

function Hero() {
  return (
    <div className="border-b border-line bg-card">
      <Container className="py-10 sm:py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-ink sm:text-5xl">
            Encontrá con quién tocar.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Avisos de bandas que buscan músicos y de músicos que se ofrecen.
            Filtrá por instrumento, género y zona; publicá el tuyo en dos minutos.
          </p>
          {/* <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/avisos/nuevo" className={buttonStyles({ size: "lg" })}>
              Publicar un aviso
            </Link>
            <Link
              href="/?tipo=me_ofrezco"
              className={buttonStyles({ variant: "contorno", size: "lg" })}
            >
              Ver músicos disponibles
            </Link>
          </div> */}
        </div>
      </Container>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-xl border border-line bg-card"
        />
      ))}
    </div>
  );
}

/** Se separa en su propio componente para poder envolverlo en Suspense. */
async function ListadoAvisos({ searchParams }: Props) {
  const filtros = filtrosDesdeSearchParams(await searchParams);

  const [avisos, ubicaciones] = await Promise.all([
    listarAvisos(filtros),
    listarUbicaciones(),
  ]);

  return (
    <>
      <AvisosFiltros
        valores={filtros}
        ubicaciones={ubicaciones}
        total={avisos.length}
      />

      <div className="mt-8">
        {avisos.length === 0 ? (
          <EmptyState
            icon={SearchX}
            titulo="No encontramos avisos con esos filtros"
            descripcion="Probá ampliando la búsqueda, o publicá vos el aviso que estás buscando."
          >
            <Link href="/avisos/nuevo" className={buttonStyles()}>
              Publicar un aviso
            </Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {avisos.map((aviso) => (
              <li key={aviso.id}>
                <AvisoCard aviso={aviso} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default function HomePage({ searchParams }: Props) {
  return (
    <>
      <Hero />
      <Container className="py-10 sm:py-12">
        <Suspense fallback={<GridSkeleton />}>
          <ListadoAvisos searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}
