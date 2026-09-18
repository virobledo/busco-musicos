import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const CONTROL_BASE =
  "w-full rounded-xl border bg-card px-3.5 text-sm text-ink " +
  "placeholder:text-ink-soft/70 transition-colors duration-150 " +
  "focus:outline-none focus:border-ink/40 focus:ring-4 focus:ring-ink/5 " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-soft";

function controlClasses(invalid: boolean | undefined, className?: string) {
  return cn(
    CONTROL_BASE,
    invalid ? "border-danger focus:border-danger" : "border-line",
    className,
  );
}

/* -------------------------------------------------------------------------- */
/* Wrapper: label + ayuda + error                                             */
/* -------------------------------------------------------------------------- */

type FieldProps = {
  /** Debe coincidir con el `id` del control que envuelve. */
  htmlFor: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  opcional?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  htmlFor,
  label,
  hint,
  error,
  opcional,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-ink"
        >
          {label}
        </label>
        {opcional ? (
          <span className="text-xs text-ink-soft">Opcional</span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-xs font-medium text-danger"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Controles                                                                  */
/* -------------------------------------------------------------------------- */

export function Input({
  className,
  invalid,
  ...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, cn("h-11", className))}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, cn("min-h-32 py-3 leading-relaxed", className))}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={controlClasses(
          invalid,
          cn("select-reset h-11 cursor-pointer pr-10", className),
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-soft"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
