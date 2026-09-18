import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases de Tailwind resolviendo conflictos (la última gana). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatearFecha(iso: string) {
  return formateadorFecha.format(new Date(iso));
}

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
];

const formateadorRelativo = new Intl.RelativeTimeFormat("es-AR", {
  numeric: "auto",
});

/** "hace 3 días", "hace 2 meses". Cae a "hace instantes" para < 1 minuto. */
export function formatearFechaRelativa(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();

  for (const [unidad, ms] of UNIDADES) {
    if (Math.abs(diff) >= ms) {
      return formateadorRelativo.format(-Math.round(diff / ms), unidad);
    }
  }

  return "hace instantes";
}

/** Recorta un texto en el último espacio antes del límite. */
export function truncar(texto: string, limite: number) {
  if (texto.length <= limite) return texto;
  const corte = texto.lastIndexOf(" ", limite);
  return `${texto.slice(0, corte > 0 ? corte : limite).trimEnd()}…`;
}
