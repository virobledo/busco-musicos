"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { LoaderCircle, Search, X } from "lucide-react";

import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { GENEROS_MUSICALES, INSTRUMENTOS, TIPOS_AVISO } from "../constants";
import type { FiltrosAvisos } from "../types";

type Props = {
  /** Valores actuales, ya normalizados por el servidor. */
  valores: FiltrosAvisos;
  /** Ubicaciones que ya existen en avisos activos, para el datalist. */
  ubicaciones: string[];
  /** Cantidad de resultados, para mostrarla junto a los filtros. */
  total: number;
};

const DEBOUNCE_MS = 350;

export function AvisosFiltros({ valores, ubicaciones, total }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState(valores.q ?? "");

  // Si la URL cambia desde afuera (back/forward, "limpiar filtros"), se
  // resincroniza el input durante el render. Es el patrón recomendado por
  // React para ajustar estado cuando cambia una prop, en vez de un useEffect.
  const [qSincronizado, setQSincronizado] = useState(valores.q ?? "");
  if (qSincronizado !== (valores.q ?? "")) {
    setQSincronizado(valores.q ?? "");
    setBusqueda(valores.q ?? "");
  }

  const hayFiltros = Boolean(
    valores.tipo ||
      valores.instrumento ||
      valores.genero ||
      valores.ubicacion ||
      valores.q,
  );

  console.log({valores})
  console.log({isPending})

  /** Arma la URL solo con los campos que tienen valor y navega. */
  function aplicar(form: HTMLFormElement | null) {
    if (!form) return;

    const params = new URLSearchParams();
    for (const [campo, valor] of new FormData(form).entries()) {
      const limpio = String(valor).trim();
      if (limpio) params.set(campo, limpio);
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/?${query}` : "/", { scroll: false });
    });
  }

  // El texto libre se aplica con debounce para no navegar en cada tecla.
  useEffect(() => {
    if (busqueda === (valores.q ?? "")) return;

    const id = setTimeout(() => aplicar(formRef.current), DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  return (
    <form
      ref={formRef}
      action="/"
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        aplicar(event.currentTarget);
      }}
      className="rounded-xl border border-line bg-card p-4 shadow-card sm:p-5"
    >
      {/* --- Tipo: grupo de pills --- */}
      <fieldset>
        <legend className="sr-only">Tipo de aviso</legend>
        <div className="flex flex-wrap gap-2">
          <TipoOpcion
            label="Todos"
            value=""
            checked={!valores.tipo}
            onChange={() => aplicar(formRef.current)}
            disabled={isPending}
          />
          {TIPOS_AVISO.map((tipo) => (
            <TipoOpcion
              key={tipo.value}
              label={tipo.label}
              value={tipo.value}
              tone={tipo.tone}
              checked={valores.tipo === tipo.value}
              onChange={() => aplicar(formRef.current)}
              disabled={isPending}
            />
          ))}
        </div>
      </fieldset>

      {/* --- Resto de los filtros --- */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft"
            strokeWidth={1.75}
          />
          <Input
            name="q"
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por título o descripción…"
            aria-label="Buscar avisos"
            className="pl-10"
          />
        </div>

        <Select
          name="instrumento"
          defaultValue={valores.instrumento ?? ""}
          aria-label="Filtrar por instrumento"
          onChange={() => aplicar(formRef.current)}
        >
          <option value="">Todos los instrumentos</option>
          {INSTRUMENTOS.map((instrumento) => (
            <option key={instrumento} value={instrumento}>
              {instrumento}
            </option>
          ))}
          {/* Si el filtro viene de un aviso con instrumento libre, lo agregamos. */}
          {valores.instrumento &&
          !INSTRUMENTOS.some(
            (i) => i.toLowerCase() === valores.instrumento?.toLowerCase(),
          ) ? (
            <option value={valores.instrumento}>{valores.instrumento}</option>
          ) : null}
        </Select>

        <Select
          name="genero"
          defaultValue={valores.genero ?? ""}
          aria-label="Filtrar por género musical"
          onChange={() => aplicar(formRef.current)}
        >
          <option value="">Todos los géneros</option>
          {GENEROS_MUSICALES.map((genero) => (
            <option key={genero} value={genero}>
              {genero}
            </option>
          ))}
          {valores.genero &&
          !GENEROS_MUSICALES.some(
            (g) => g.toLowerCase() === valores.genero?.toLowerCase(),
          ) ? (
            <option value={valores.genero}>{valores.genero}</option>
          ) : null}
        </Select>

        <div className="sm:col-span-2 lg:col-span-4">
          <Input
            name="ubicacion"
            list="filtro-ubicaciones"
            defaultValue={valores.ubicacion ?? ""}
            placeholder="Ciudad o zona (ej: Rosario, Zona Oeste…)"
            aria-label="Filtrar por ubicación"
            onBlur={() => aplicar(formRef.current)}
          />
          <datalist id="filtro-ubicaciones">
            {ubicaciones.map((ubicacion) => (
              <option key={ubicacion} value={ubicacion} />
            ))}
          </datalist>
        </div>
      </div>

      {/* --- Pie: contador + limpiar + submit para no-JS --- */}
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          {isPending ? (
            <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
          ) : null}
          <span>
            {total} {total === 1 ? "aviso" : "avisos"}
          </span>
        </p>

        <div className="flex items-center gap-3">
          {hayFiltros ? (
            <button
              type="button"
              onClick={() =>
                startTransition(() => router.push("/", { scroll: false }))
              }
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              <X aria-hidden="true" className="size-3.5" />
              Limpiar filtros
            </button>
          ) : null}

          {/* Visible solo sin JS: los cambios ya se aplican al vuelo. */}
          <noscript>
            <button
              type="submit"
              className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white"
            >
              Aplicar
            </button>
          </noscript>
        </div>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function TipoOpcion({
  label,
  value,
  tone,
  checked,
  onChange,
  disabled
}: {
  label: string;
  value: string;
  tone?: "busco" | "ofrezco";
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  const activo =
    tone === "busco"
      ? "border-busco bg-busco-soft text-busco"
      : tone === "ofrezco"
        ? "border-ofrezco bg-ofrezco-soft text-ofrezco"
        : "border-ink bg-ink text-white";

  return (
    <label
      className={cn(
        "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium",
        "transition-colors duration-150 select-none",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
        checked
          ? activo
          : "border-line bg-card text-ink-soft hover:border-ink/20 hover:text-ink",
      )}
    >
      <input
        type="radio"
        name="tipo"
        value={value}
        checked={checked}
        onChange={!disabled ? onChange : undefined}
        className="sr-only"
      />
      {label}
    </label>
  );
}
