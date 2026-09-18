"use client";

import Link from "next/link";
import { useActionState } from "react";

import { LoaderCircle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button, buttonStyles } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { actualizarAviso, crearAviso } from "../actions";
import { avisoFormStateInicial, type AvisoFormState } from "../state";
import {
  ESTADO_AVISO_AYUDA,
  ESTADO_AVISO_LABEL,
  GENEROS_MUSICALES,
  INSTRUMENTOS,
  TIPOS_AVISO,
} from "../constants";
import type { AvisoFormValues } from "../schemas";
import type { Aviso, AvisoEstado } from "../types";
import { ImagenUpload } from "./imagen-upload";

type Props = {
  userId: string;
  /** Se usa para precargar el email de contacto al crear. */
  emailUsuario?: string;
  /** Presente solo en modo edición. */
  aviso?: Aviso;
};

const ESTADOS: AvisoEstado[] = ["activo", "pausado", "cerrado"];

function valoresIniciales(aviso?: Aviso, emailUsuario?: string): AvisoFormValues {
  return {
    tipo: aviso?.tipo ?? "",
    titulo: aviso?.titulo ?? "",
    descripcion: aviso?.descripcion ?? "",
    instrumento: aviso?.instrumento ?? "",
    genero_musical: aviso?.genero_musical ?? "",
    ubicacion: aviso?.ubicacion ?? "",
    imagen_url: aviso?.imagen_url ?? "",
    youtube_url: aviso?.youtube_url ?? "",
    instagram_url: aviso?.instagram_url ?? "",
    otra_red_url: aviso?.otra_red_url ?? "",
    contacto_nombre: aviso?.contacto_nombre ?? "",
    contacto_email: aviso?.contacto_email ?? emailUsuario ?? "",
    contacto_telefono: aviso?.contacto_telefono ?? "",
    estado: aviso?.estado ?? "activo",
  };
}

export function AvisoForm({ userId, emailUsuario, aviso }: Props) {
  const editando = Boolean(aviso);

  const accion = editando
    ? actualizarAviso.bind(null, aviso!.id)
    : crearAviso;

  const [state, formAction, pending] = useActionState<AvisoFormState, FormData>(
    accion,
    avisoFormStateInicial,
  );

  // Si el submit falló, se repuebla con lo tipeado; si no, con el aviso original.
  const base = valoresIniciales(aviso, emailUsuario);
  const v = (campo: keyof AvisoFormValues) =>
    state.valores?.[campo] ?? base[campo];
  const err = (campo: string) => state.errores?.[campo];

  return (
    <form action={formAction} className="space-y-10">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      {/* ---------------------------------------------------------------- */}
      <Seccion
        titulo="¿Qué estás buscando?"
        descripcion="Esto define el color y el filtro con el que va a aparecer tu aviso."
      >
        <fieldset>
          <legend className="sr-only">Tipo de aviso</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {TIPOS_AVISO.map((tipo) => (
              <label
                key={tipo.value}
                className={cn(
                  "cursor-pointer rounded-xl border bg-card p-4 transition-colors duration-150",
                  "has-checked:border-transparent has-checked:ring-2",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                  tipo.tone === "busco"
                    ? "has-checked:bg-busco-soft has-checked:ring-busco"
                    : "has-checked:bg-ofrezco-soft has-checked:ring-ofrezco",
                  err("tipo") ? "border-danger" : "border-line",
                )}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={tipo.value}
                  defaultChecked={v("tipo") === tipo.value}
                  className="sr-only"
                  required
                />
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    tipo.tone === "busco" ? "text-busco" : "text-ofrezco",
                  )}
                >
                  {tipo.label}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {tipo.descripcion}
                </span>
              </label>
            ))}
          </div>
          {err("tipo") ? (
            <p role="alert" className="mt-2 text-xs font-medium text-danger">
              {err("tipo")}
            </p>
          ) : null}
        </fieldset>
      </Seccion>

      {/* ---------------------------------------------------------------- */}
      <Seccion
        titulo="El aviso"
        descripcion="Cuanto más concreto, mejores respuestas vas a recibir."
      >
        <Field htmlFor="titulo" label="Título" error={err("titulo")}>
          <Input
            id="titulo"
            name="titulo"
            defaultValue={v("titulo")}
            maxLength={120}
            required
            invalid={Boolean(err("titulo"))}
            placeholder="Ej: Buscamos baterista para power trio de rock"
          />
        </Field>

        <Field
          htmlFor="descripcion"
          label="Descripción"
          error={err("descripcion")}
          hint="Contá el proyecto, la frecuencia de ensayo, el nivel que buscás y las influencias."
        >
          <Textarea
            id="descripcion"
            name="descripcion"
            defaultValue={v("descripcion")}
            maxLength={5000}
            required
            rows={7}
            invalid={Boolean(err("descripcion"))}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            htmlFor="instrumento"
            label="Instrumento"
            error={err("instrumento")}
            hint="Elegí uno de la lista o escribí el tuyo."
          >
            <Input
              id="instrumento"
              name="instrumento"
              list="instrumentos-sugeridos"
              defaultValue={v("instrumento")}
              maxLength={60}
              required
              invalid={Boolean(err("instrumento"))}
              placeholder="Ej: Batería"
            />
            <datalist id="instrumentos-sugeridos">
              {INSTRUMENTOS.map((instrumento) => (
                <option key={instrumento} value={instrumento} />
              ))}
            </datalist>
          </Field>

          <Field
            htmlFor="genero_musical"
            label="Género musical"
            error={err("genero_musical")}
            hint="Elegí uno de la lista o escribí el tuyo."
          >
            <Input
              id="genero_musical"
              name="genero_musical"
              list="generos-sugeridos"
              defaultValue={v("genero_musical")}
              maxLength={60}
              required
              invalid={Boolean(err("genero_musical"))}
              placeholder="Ej: Rock"
            />
            <datalist id="generos-sugeridos">
              {GENEROS_MUSICALES.map((genero) => (
                <option key={genero} value={genero} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field
          htmlFor="ubicacion"
          label="Ubicación"
          error={err("ubicacion")}
          hint="Ciudad, barrio o zona donde se ensaya o se toca."
        >
          <Input
            id="ubicacion"
            name="ubicacion"
            defaultValue={v("ubicacion")}
            maxLength={120}
            required
            invalid={Boolean(err("ubicacion"))}
            placeholder="Ej: CABA, Villa Crespo"
          />
        </Field>

        <ImagenUpload
          userId={userId}
          defaultValue={v("imagen_url")}
          error={err("imagen_url")}
        />
      </Seccion>

      {/* ---------------------------------------------------------------- */}
      <Seccion
        titulo="Links"
        descripcion="Sumá material para que se entienda de qué va el proyecto. Los que dejes vacíos no se muestran."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            htmlFor="youtube_url"
            label="YouTube"
            opcional
            error={err("youtube_url")}
          >
            <Input
              id="youtube_url"
              name="youtube_url"
              type="url"
              inputMode="url"
              defaultValue={v("youtube_url")}
              invalid={Boolean(err("youtube_url"))}
              placeholder="https://youtube.com/…"
            />
          </Field>

          <Field
            htmlFor="instagram_url"
            label="Instagram"
            opcional
            error={err("instagram_url")}
          >
            <Input
              id="instagram_url"
              name="instagram_url"
              type="url"
              inputMode="url"
              defaultValue={v("instagram_url")}
              invalid={Boolean(err("instagram_url"))}
              placeholder="https://instagram.com/…"
            />
          </Field>
        </div>

        <Field
          htmlFor="otra_red_url"
          label="Otro link"
          opcional
          error={err("otra_red_url")}
          hint="Spotify, Bandcamp, SoundCloud, TikTok, un drive con demos…"
        >
          <Input
            id="otra_red_url"
            name="otra_red_url"
            type="url"
            inputMode="url"
            defaultValue={v("otra_red_url")}
            invalid={Boolean(err("otra_red_url"))}
            placeholder="https://…"
          />
        </Field>
      </Seccion>

      {/* ---------------------------------------------------------------- */}
      <Seccion
        titulo="Contacto"
        descripcion="Estos datos se muestran públicos en el aviso."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            htmlFor="contacto_nombre"
            label="Nombre"
            error={err("contacto_nombre")}
          >
            <Input
              id="contacto_nombre"
              name="contacto_nombre"
              defaultValue={v("contacto_nombre")}
              maxLength={80}
              required
              invalid={Boolean(err("contacto_nombre"))}
              placeholder="Ej: Martín"
            />
          </Field>

          <Field
            htmlFor="contacto_email"
            label="Email"
            error={err("contacto_email")}
          >
            <Input
              id="contacto_email"
              name="contacto_email"
              type="email"
              defaultValue={v("contacto_email")}
              required
              invalid={Boolean(err("contacto_email"))}
              placeholder="tu@email.com"
            />
          </Field>
        </div>

        <Field
          htmlFor="contacto_telefono"
          label="Teléfono o WhatsApp"
          opcional
          error={err("contacto_telefono")}
        >
          <Input
            id="contacto_telefono"
            name="contacto_telefono"
            type="tel"
            inputMode="tel"
            defaultValue={v("contacto_telefono")}
            maxLength={30}
            invalid={Boolean(err("contacto_telefono"))}
            placeholder="+54 9 11 5555 5555"
          />
        </Field>
      </Seccion>

      {/* ---------------------------------------------------------------- */}
      {editando ? (
        <Seccion
          titulo="Estado"
          descripcion="Podés pausarlo mientras resolvés, o cerrarlo cuando ya no lo necesites."
        >
          <Field htmlFor="estado" label="Estado del aviso" error={err("estado")}>
            <Select
              id="estado"
              name="estado"
              defaultValue={v("estado")}
              invalid={Boolean(err("estado"))}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_AVISO_LABEL[estado]} — {ESTADO_AVISO_AYUDA[estado]}
                </option>
              ))}
            </Select>
          </Field>
        </Seccion>
      ) : (
        <input type="hidden" name="estado" value="activo" />
      )}

      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={editando ? `/avisos/${aviso!.id}` : "/"}
          className={buttonStyles({ variant: "contorno" })}
        >
          Cancelar
        </Link>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Guardando…
            </>
          ) : editando ? (
            "Guardar cambios"
          ) : (
            "Publicar aviso"
          )}
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-base font-semibold text-ink">{titulo}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {descripcion}
        </p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
