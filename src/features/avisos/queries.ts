import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AVISOS_POR_PAGINA } from "./constants";
import { esUuid } from "./schemas";
import {
  COLUMNAS_LISTADO,
  type Aviso,
  type AvisoListItem,
  type FiltrosAvisos,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Listado público                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Avisos activos, con filtros opcionales. Público: no requiere sesión.
 *
 * El `.eq("estado", "activo")` es redundante con la política de RLS para un
 * visitante anónimo, pero no para un usuario logueado: sin él, el dueño vería
 * sus propios avisos pausados mezclados en el listado público.
 */
export async function listarAvisos(
  filtros: FiltrosAvisos = {},
): Promise<AvisoListItem[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("avisos")
    .select(COLUMNAS_LISTADO)
    .eq("estado", "activo")
    .order("created_at", { ascending: false })
    .limit(AVISOS_POR_PAGINA);

  if (filtros.tipo) {
    query = query.eq("tipo", filtros.tipo);
  }
  if (filtros.instrumento) {
    // `ilike` sin comodines = comparación exacta sin distinguir mayúsculas.
    query = query.ilike("instrumento", filtros.instrumento);
  }
  if (filtros.genero) {
    query = query.ilike("genero_musical", filtros.genero);
  }
  if (filtros.ubicacion) {
    query = query.ilike("ubicacion", `%${filtros.ubicacion}%`);
  }
  if (filtros.q) {
    query = query.or(
      `titulo.ilike.%${filtros.q}%,descripcion.ilike.%${filtros.q}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`No pudimos traer los avisos: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Ubicaciones que ya se usaron en avisos activos, para sugerirlas en el
 * filtro. Postgres no expone `DISTINCT` por PostgREST, así que se deduplica
 * acá sobre una muestra acotada.
 */
export async function listarUbicaciones(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("avisos")
    .select("ubicacion")
    .eq("estado", "activo")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error || !data) return [];

  return [...new Set(data.map((fila) => fila.ubicacion))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

/* -------------------------------------------------------------------------- */
/* Detalle                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Un aviso por id, o `null` si no existe o no es visible.
 *
 * "No visible" lo decide RLS: un aviso pausado o cerrado devuelve `null` para
 * cualquiera que no sea el dueño, sin que haya que filtrar acá.
 */
export async function getAviso(id: string): Promise<Aviso | null> {
  if (!esUuid(id)) return null;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos traer el aviso: ${error.message}`);
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Panel del usuario                                                          */
/* -------------------------------------------------------------------------- */

/** Todos los avisos del usuario, en cualquier estado. */
export async function listarMisAvisos(userId: string): Promise<Aviso[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No pudimos traer tus avisos: ${error.message}`);
  }

  return data ?? [];
}
