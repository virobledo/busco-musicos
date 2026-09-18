"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AvisoEstado } from "@/types/database";

import { IMAGEN_BUCKET } from "./constants";
import { pathDesdeUrlPublica } from "./imagen";
import {
  avisoDesdeFormData,
  avisoSchema,
  erroresPorCampo,
  esUuid,
  valoresDesdeFormData,
} from "./schemas";
import type { AccionSimpleState, AvisoFormState } from "./state";
import { requerirUsuario } from "../auth/queries";

/** Invalida las vistas que muestran avisos. */
function revalidarAvisos(id?: string) {
  revalidatePath("/");
  revalidatePath("/mis-avisos");
  if (id) revalidatePath(`/avisos/${id}`);
}

/**
 * Borra una imagen del bucket desde el servidor.
 * Best-effort: si falla, el aviso ya se guardó y no vale la pena abortar.
 */
async function borrarImagenSiEsPropia(url: string | null) {
  if (!url) return;
  const path = pathDesdeUrlPublica(url);
  if (!path) return;

  const supabase = await createSupabaseServerClient();
  await supabase.storage.from(IMAGEN_BUCKET).remove([path]);
}

/* -------------------------------------------------------------------------- */
/* Crear                                                                      */
/* -------------------------------------------------------------------------- */

export async function crearAviso(
  _prevState: AvisoFormState,
  formData: FormData,
): Promise<AvisoFormState> {
  const user = await requerirUsuario("/avisos/nuevo");

  const parsed = avisoSchema.safeParse(avisoDesdeFormData(formData));

  if (!parsed.success) {
    return {
      errores: erroresPorCampo(parsed.error),
      valores: valoresDesdeFormData(formData),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("avisos")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        error?.message ??
        "No pudimos publicar el aviso. Probá de nuevo en un momento.",
      valores: valoresDesdeFormData(formData),
    };
  }

  revalidarAvisos(data.id);
  redirect(`/avisos/${data.id}?publicado=1`);
}

/* -------------------------------------------------------------------------- */
/* Editar                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * El `id` llega por `.bind()` desde el componente, no por el FormData: así no
 * se puede reapuntar el update a otro aviso manipulando el HTML.
 * De todas formas el `.eq("user_id")` y RLS lo bloquearían.
 */
export async function actualizarAviso(
  id: string,
  _prevState: AvisoFormState,
  formData: FormData,
): Promise<AvisoFormState> {
  const user = await requerirUsuario(`/avisos/${id}/editar`);

  if (!esUuid(id)) {
    return { error: "El aviso que querés editar no existe." };
  }

  const parsed = avisoSchema.safeParse(avisoDesdeFormData(formData));

  if (!parsed.success) {
    return {
      errores: erroresPorCampo(parsed.error),
      valores: valoresDesdeFormData(formData),
    };
  }

  const supabase = await createSupabaseServerClient();

  // Se lee la imagen anterior para poder limpiarla si cambió.
  const { data: previo } = await supabase
    .from("avisos")
    .select("imagen_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!previo) {
    return { error: "Ese aviso no existe o no es tuyo." };
  }

  const { error } = await supabase
    .from("avisos")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      error: error.message,
      valores: valoresDesdeFormData(formData),
    };
  }

  if (previo.imagen_url && previo.imagen_url !== parsed.data.imagen_url) {
    await borrarImagenSiEsPropia(previo.imagen_url);
  }

  revalidarAvisos(id);
  redirect(`/avisos/${id}?actualizado=1`);
}

/* -------------------------------------------------------------------------- */
/* Cambiar estado (pausar / reactivar / cerrar)                               */
/* -------------------------------------------------------------------------- */

export async function cambiarEstadoAviso(
  id: string,
  estado: AvisoEstado,
): Promise<AccionSimpleState> {
  const user = await requerirUsuario("/mis-avisos");

  if (!esUuid(id)) {
    return { error: "El aviso no existe." };
  }

  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase
    .from("avisos")
    .update({ estado }, { count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (count === 0) {
    return { error: "Ese aviso no existe o no es tuyo." };
  }

  revalidarAvisos(id);
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Eliminar                                                                   */
/* -------------------------------------------------------------------------- */

export async function eliminarAviso(id: string): Promise<AccionSimpleState> {
  const user = await requerirUsuario("/mis-avisos");

  if (!esUuid(id)) {
    return { error: "El aviso no existe." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: previo } = await supabase
    .from("avisos")
    .select("imagen_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!previo) {
    return { error: "Ese aviso no existe o no es tuyo." };
  }

  const { error } = await supabase
    .from("avisos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  await borrarImagenSiEsPropia(previo.imagen_url);

  revalidarAvisos(id);
  return { ok: true };
}
