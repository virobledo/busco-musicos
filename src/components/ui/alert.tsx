import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AlertTone = "error" | "exito" | "info";

const TONOS = {
  error: {
    icon: CircleAlert,
    className: "border-danger/20 bg-danger-soft text-danger",
  },
  exito: {
    icon: CircleCheck,
    className: "border-busco/20 bg-busco-soft text-busco",
  },
  info: {
    icon: Info,
    className: "border-line bg-surface text-ink-soft",
  },
} as const satisfies Record<AlertTone, { icon: unknown; className: string }>;

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClassName } = TONOS[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        toneClassName,
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <div className="[&_a]:underline [&_a]:underline-offset-2">{children}</div>
    </div>
  );
}
