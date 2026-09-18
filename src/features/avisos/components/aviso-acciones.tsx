"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { CircleCheck, CirclePause, LoaderCircle, SquarePen, Trash2 } from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";
import type { AvisoEstado } from "@/types/database";

import { cambiarEstadoAviso, eliminarAviso } from "../actions";

type Props = {
  id: string;
  estado: AvisoEstado;
};

/**
 * Acciones de un aviso propio en el panel "Mis avisos".
 * El borrado pide confirmación en línea en vez de abrir un `confirm()`.
 */
export function AvisoAcciones({ id, estado }: Props) {
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  function correr(accion: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const resultado = await accion();
      if (resultado?.error) setError(resultado.error);
    });
  }

  function cambiarEstado(nuevo: AvisoEstado) {
    correr(() => cambiarEstadoAviso(id, nuevo));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/avisos/${id}/editar`}
          className={buttonStyles({ variant: "contorno", size: "sm" })}
        >
          <SquarePen aria-hidden="true" className="size-4" />
          Editar
        </Link>

        {estado === "activo" ? (
          <Button
            variant="contorno"
            size="sm"
            disabled={pendiente}
            onClick={() => cambiarEstado("pausado")}
          >
            <CirclePause aria-hidden="true" className="size-4" />
            Pausar
          </Button>
        ) : (
          <Button
            variant="contorno"
            size="sm"
            disabled={pendiente}
            onClick={() => cambiarEstado("activo")}
          >
            <CircleCheck aria-hidden="true" className="size-4" />
            Reactivar
          </Button>
        )}

        {estado !== "cerrado" ? (
          <Button
            variant="contorno"
            size="sm"
            disabled={pendiente}
            onClick={() => cambiarEstado("cerrado")}
          >
            Cerrar
          </Button>
        ) : null}

        {confirmandoBorrado ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-1.5 text-xs font-medium text-danger">
            ¿Eliminar definitivamente?
            <button
              type="button"
              disabled={pendiente}
              onClick={() => correr(() => eliminarAviso(id))}
              className="underline underline-offset-2 hover:no-underline"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoBorrado(false)}
              className="text-ink-soft underline underline-offset-2 hover:no-underline"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <Button
            variant="peligro"
            size="sm"
            disabled={pendiente}
            onClick={() => setConfirmandoBorrado(true)}
            aria-label="Eliminar aviso"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        )}

        {pendiente ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin text-ink-soft"
          />
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
