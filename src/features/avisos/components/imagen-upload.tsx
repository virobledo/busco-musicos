"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { IMAGEN_ACCEPT, IMAGEN_MAX_BYTES } from "../constants";
import { validarImagen } from "../imagen";
import { borrarImagenAviso, subirImagenAviso } from "../storage";

type Props = {
  /** Necesario para armar la ruta `<user_id>/…` que exige el RLS del bucket. */
  userId: string;
  /** URL ya guardada, cuando se está editando un aviso. */
  defaultValue?: string | null;
  error?: string;
};

/**
 * Subida de la portada. El archivo va directo del navegador a Storage y en el
 * formulario queda solo la URL, en un input oculto llamado `imagen_url`.
 */
export function ImagenUpload({ userId, defaultValue, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  /**
   * URLs subidas en esta misma sesión del formulario. Solo estas se borran al
   * reemplazar o quitar: la imagen original se limpia del lado del servidor
   * recién cuando el guardado sale bien.
   */
  const subidasEnSesion = useRef<Set<string>>(new Set());

  async function limpiarSiEsHuerfana(anterior: string) {
    if (anterior && subidasEnSesion.current.has(anterior)) {
      subidasEnSesion.current.delete(anterior);
      await borrarImagenAviso(anterior);
    }
  }

  async function onSeleccionar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Se resetea el input para que volver a elegir el mismo archivo dispare el change.
    event.target.value = "";
    if (!file) return;

    const validacion = validarImagen(file);
    if (!validacion.ok) {
      setErrorLocal(validacion.error);
      return;
    }

    setErrorLocal(null);
    setSubiendo(true);

    try {
      const anterior = url;
      const { publicUrl } = await subirImagenAviso(file, userId);
      subidasEnSesion.current.add(publicUrl);
      setUrl(publicUrl);
      await limpiarSiEsHuerfana(anterior);
    } catch (e) {
      setErrorLocal(
        e instanceof Error ? e.message : "No pudimos subir la imagen.",
      );
    } finally {
      setSubiendo(false);
    }
  }

  async function onQuitar() {
    const anterior = url;
    setUrl("");
    setErrorLocal(null);
    await limpiarSiEsHuerfana(anterior);
  }

  const mensaje = errorLocal ?? error;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">Imagen de portada</span>
        <span className="text-xs text-ink-soft">Opcional</span>
      </div>

      {/* La Server Action solo ve esto: la URL ya subida. */}
      <input type="hidden" name="imagen_url" value={url} />

      <input
        ref={inputRef}
        type="file"
        accept={IMAGEN_ACCEPT}
        onChange={onSeleccionar}
        className="sr-only"
        aria-label="Elegir imagen de portada"
      />

      {url ? (
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="relative aspect-16/9 bg-surface">
            <Image
              src={url}
              alt="Vista previa de la portada del aviso"
              fill
              sizes="(min-width: 768px) 640px, 100vw"
              className="object-cover"
            />
            {subiendo ? (
              <div className="absolute inset-0 grid place-items-center bg-ink/40 backdrop-blur-sm">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-6 animate-spin text-white"
                />
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 border-t border-line p-3">
            <Button
              variant="contorno"
              size="sm"
              disabled={subiendo}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus aria-hidden="true" className="size-4" />
              Cambiar
            </Button>
            <Button
              variant="peligro"
              size="sm"
              disabled={subiendo}
              onClick={onQuitar}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed",
            "bg-card px-6 py-10 text-center transition-colors duration-150",
            "hover:border-ink/25 hover:bg-surface disabled:opacity-60",
            mensaje ? "border-danger" : "border-line",
          )}
        >
          {subiendo ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin text-ink-soft"
            />
          ) : (
            <ImagePlus
              aria-hidden="true"
              className="size-5 text-ink-soft"
              strokeWidth={1.5}
            />
          )}
          <span className="text-sm font-medium text-ink">
            {subiendo ? "Subiendo…" : "Subir una imagen"}
          </span>
          <span className="text-xs text-ink-soft">
            JPG, PNG o WebP · hasta {IMAGEN_MAX_BYTES / (1024 * 1024)} MB
          </span>
        </button>
      )}

      {mensaje ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {mensaje}
        </p>
      ) : null}
    </div>
  );
}
