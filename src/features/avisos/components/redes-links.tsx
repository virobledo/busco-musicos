import { Link2 } from "lucide-react";

import {
  InstagramIcon,
  YoutubeIcon,
  type IconoLineal,
} from "@/components/icons/brand-icons";
import { cn } from "@/lib/utils";

import type { Aviso } from "../types";

type CampoRed = keyof Pick<
  Aviso,
  "youtube_url" | "instagram_url" | "otra_red_url"
>;

const REDES = [
  {
    key: "youtube_url",
    label: "YouTube",
    icon: YoutubeIcon,
    hover: "hover:border-[#ff0000]/30 hover:text-[#ff0000]",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    icon: InstagramIcon,
    hover: "hover:border-ofrezco/40 hover:text-ofrezco",
  },
  {
    key: "otra_red_url",
    label: "Otro link",
    icon: Link2,
    hover: "hover:border-ink/30 hover:text-ink",
  },
] as const satisfies ReadonlyArray<{
  key: CampoRed;
  label: string;
  icon: IconoLineal;
  hover: string;
}>;

/**
 * Links a redes del aviso. Cada botón se oculta si el campo está vacío, y el
 * componente entero no renderiza nada si no se cargó ninguno.
 */
export function RedesLinks({
  aviso,
  className,
}: {
  aviso: Pick<Aviso, "youtube_url" | "instagram_url" | "otra_red_url">;
  className?: string;
}) {
  const disponibles = REDES.filter((red) => aviso[red.key]);

  if (disponibles.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {disponibles.map(({ key, label, icon: Icono, hover }) => (
        <li key={key}>
          <a
            href={aviso[key] as string}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-line bg-card",
              "px-3.5 py-2 text-sm font-medium text-ink-soft",
              "transition-colors duration-150",
              hover,
            )}
          >
            <Icono aria-hidden="true" className="size-4" strokeWidth={1.75} />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
