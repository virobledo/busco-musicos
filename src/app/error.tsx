"use client";

import { useEffect } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción conviene mandarlo a un servicio de errores.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[calc(100dvh-16rem)] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-danger">Algo salió mal</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        No pudimos cargar esta página
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">
        Si recién configuraste el proyecto, revisá que las variables de
        Supabase en <code className="font-mono text-sm">.env.local</code> estén
        completas y que las migraciones se hayan aplicado.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-ink-soft/70">
          digest: {error.digest}
        </p>
      ) : null}
      <Button onClick={reset} className="mt-8">
        Reintentar
      </Button>
    </Container>
  );
}
