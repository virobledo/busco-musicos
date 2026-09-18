import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primario"
  | "ofrezco"
  | "neutro"
  | "contorno"
  | "fantasma"
  | "peligro";

export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 " +
  "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 " +
  "whitespace-nowrap select-none";

const VARIANTES: Record<ButtonVariant, string> = {
  primario: "bg-busco text-white shadow-card hover:bg-busco/90",
  ofrezco: "bg-ofrezco text-white shadow-card hover:bg-ofrezco/90",
  neutro: "bg-ink text-white shadow-card hover:bg-ink/90",
  contorno: "border border-line bg-card text-ink hover:bg-surface",
  fantasma: "text-ink-soft hover:bg-surface hover:text-ink",
  peligro: "border border-line bg-card text-danger hover:bg-danger-soft",
};

const TAMANOS: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * Clases del botón, para reutilizarlas en elementos que no son `<button>`
 * (típicamente un `<Link>` que tiene que verse como botón).
 */
export function buttonStyles({
  variant = "primario",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(BASE, VARIANTES[variant], TAMANOS[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
