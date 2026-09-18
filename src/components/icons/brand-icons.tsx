import type { ComponentType, SVGProps } from "react";

/**
 * Iconos de marca en estilo lineal.
 *
 * Lucide v1 sacó los iconos de marca del paquete (`Youtube`, `Instagram`, etc.)
 * por temas de licencia de los logos, así que los dibujamos acá con los mismos
 * atributos que el resto: viewBox 24, `currentColor`, trazo redondeado.
 * Los paths vienen de Lucide v0 (licencia ISC).
 */

export type IconoLineal = ComponentType<
  SVGProps<SVGSVGElement> & { strokeWidth?: number | string }
>;

const BASE_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function YoutubeIcon({ strokeWidth = 2, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE_PROPS} strokeWidth={strokeWidth} {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export function InstagramIcon({
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE_PROPS} strokeWidth={strokeWidth} {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
