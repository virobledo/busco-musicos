import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  titulo,
  descripcion,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line",
        "bg-card px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-surface">
        <Icon aria-hidden="true" className="size-5 text-ink-soft" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{titulo}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{descripcion}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
