import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone =
  | "busco"
  | "ofrezco"
  | "neutro"
  | "silencioso"
  | "peligro";

const TONOS: Record<BadgeTone, string> = {
  busco: "bg-busco-soft text-busco ring-1 ring-busco/15",
  ofrezco: "bg-ofrezco-soft text-ofrezco ring-1 ring-ofrezco/15",
  neutro: "bg-ink/5 text-ink ring-1 ring-ink/10",
  silencioso: "bg-surface text-ink-soft ring-1 ring-line",
  peligro: "bg-danger-soft text-danger ring-1 ring-danger/15",
};

type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
};

/** Pill de un solo tamaño: lo usamos para tipo de aviso, estado y metadatos. */
export function Badge({ tone = "neutro", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-xs font-medium whitespace-nowrap",
        TONOS[tone],
        className,
      )}
      {...props}
    />
  );
}
