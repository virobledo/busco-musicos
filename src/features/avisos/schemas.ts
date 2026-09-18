import { z } from "zod";

import type { AvisoTipo } from "@/types/database";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const SOLO_HTTP = /^https?:\/\//i;

function urlOpcional(mensaje: string) {
  return z
    .url(mensaje)
    .max(600, "El link es demasiado largo.")
    .refine((valor) => SOLO_HTTP.test(valor), {
      message: "El link tiene que empezar con http:// o https://",
    })
    .nullable();
}

/**
 * Normaliza un valor que viene de un `FormData`: recorta espacios y convierte
 * el string vacío en `null`, que es lo que espera la base para los opcionales.
 */
function opcional(valor: FormDataEntryValue | null): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio === "" ? null : limpio;
}

function requerido(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/* -------------------------------------------------------------------------- */
/* Schema del aviso                                                           */
/* -------------------------------------------------------------------------- */

/** Los límites replican los CHECK constraints de `public.avisos`. */
export const avisoSchema = z.object({
  tipo: z.enum(["busco_musico", "me_ofrezco"], {
    message: "Elegí si buscás músico o te ofrecés.",
  }),

  titulo: z
    .string()
    .min(5, "El título necesita al menos 5 caracteres.")
    .max(120, "El título no puede superar los 120 caracteres."),

  descripcion: z
    .string()
    .min(20, "Contá un poco más: al menos 20 caracteres.")
    .max(5000, "La descripción no puede superar los 5000 caracteres."),

  instrumento: z
    .string()
    .min(2, "Indicá el instrumento.")
    .max(60, "El instrumento no puede superar los 60 caracteres."),

  genero_musical: z
    .string()
    .min(2, "Indicá el género musical.")
    .max(60, "El género no puede superar los 60 caracteres."),

  ubicacion: z
    .string()
    .min(2, "Indicá la ciudad o zona.")
    .max(120, "La ubicación no puede superar los 120 caracteres."),

  imagen_url: urlOpcional("La imagen no se subió correctamente."),
  youtube_url: urlOpcional("El link de YouTube no es una URL válida."),
  instagram_url: urlOpcional("El link de Instagram no es una URL válida."),
  otra_red_url: urlOpcional("El link no es una URL válida."),

  contacto_nombre: z
    .string()
    .min(2, "Poné un nombre de contacto.")
    .max(80, "El nombre no puede superar los 80 caracteres."),

  contacto_email: z
    .string()
    .toLowerCase()
    .pipe(z.email("El email de contacto no es válido.")),

  contacto_telefono: z
    .string()
    .min(6, "El teléfono parece incompleto.")
    .max(30, "El teléfono no puede superar los 30 caracteres.")
    .nullable(),

  estado: z.enum(["activo", "pausado", "cerrado"]).default("activo"),
});

export type AvisoInput = z.infer<typeof avisoSchema>;

/** Valores crudos del formulario, para repoblarlo cuando la validación falla. */
export type AvisoFormValues = {
  tipo: string;
  titulo: string;
  descripcion: string;
  instrumento: string;
  genero_musical: string;
  ubicacion: string;
  imagen_url: string;
  youtube_url: string;
  instagram_url: string;
  otra_red_url: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  estado: string;
};

/** Convierte el `FormData` del formulario en el objeto que valida Zod. */
export function avisoDesdeFormData(formData: FormData) {
  return {
    tipo: requerido(formData.get("tipo")),
    titulo: requerido(formData.get("titulo")),
    descripcion: requerido(formData.get("descripcion")),
    instrumento: requerido(formData.get("instrumento")),
    genero_musical: requerido(formData.get("genero_musical")),
    ubicacion: requerido(formData.get("ubicacion")),
    imagen_url: opcional(formData.get("imagen_url")),
    youtube_url: opcional(formData.get("youtube_url")),
    instagram_url: opcional(formData.get("instagram_url")),
    otra_red_url: opcional(formData.get("otra_red_url")),
    contacto_nombre: requerido(formData.get("contacto_nombre")),
    contacto_email: requerido(formData.get("contacto_email")),
    contacto_telefono: opcional(formData.get("contacto_telefono")),
    estado: requerido(formData.get("estado")) || "activo",
  };
}

/** Los mismos datos pero como strings, para el `defaultValue` de cada input. */
export function valoresDesdeFormData(formData: FormData): AvisoFormValues {
  const crudo = avisoDesdeFormData(formData);
  return {
    ...crudo,
    imagen_url: crudo.imagen_url ?? "",
    youtube_url: crudo.youtube_url ?? "",
    instagram_url: crudo.instagram_url ?? "",
    otra_red_url: crudo.otra_red_url ?? "",
    contacto_telefono: crudo.contacto_telefono ?? "",
  };
}

/**
 * Primer error por campo. Se hace a mano en lugar de usar `flatten()` para
 * devolver un shape simple y serializable al cliente.
 */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? "_");
    errores[campo] ??= issue.message;
  }
  return errores;
}

/* -------------------------------------------------------------------------- */
/* Filtros del listado                                                        */
/* -------------------------------------------------------------------------- */

const TIPOS_VALIDOS = new Set<string>(["busco_musico", "me_ofrezco"]);

/**
 * Caracteres que rompen la sintaxis de `?or=` y de los patrones `ilike` de
 * PostgREST. Se descartan antes de armar la query.
 */
function limpiarTextoDeBusqueda(valor: string) {
  return valor.replace(/[,()%*\\"]/g, " ").replace(/\s+/g, " ").trim();
}

function primerValor(valor: string | string[] | undefined) {
  return (Array.isArray(valor) ? valor[0] : valor)?.trim() ?? "";
}

export type SearchParamsCrudos = Record<string, string | string[] | undefined>;

/** Normaliza los search params de la home en filtros tipados y seguros. */
export function filtrosDesdeSearchParams(params: SearchParamsCrudos) {
  const tipo = primerValor(params.tipo);
  const instrumento = limpiarTextoDeBusqueda(primerValor(params.instrumento));
  const genero = limpiarTextoDeBusqueda(primerValor(params.genero));
  const ubicacion = limpiarTextoDeBusqueda(primerValor(params.ubicacion));
  const q = limpiarTextoDeBusqueda(primerValor(params.q)).slice(0, 80);

  return {
    tipo: TIPOS_VALIDOS.has(tipo) ? (tipo as AvisoTipo) : undefined,
    instrumento: instrumento.slice(0, 60) || undefined,
    genero: genero.slice(0, 60) || undefined,
    ubicacion: ubicacion.slice(0, 120) || undefined,
    q: q || undefined,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres tira error si le pasás un uuid mal formado; chequeamos antes. */
export function esUuid(valor: string): boolean {
  return UUID_RE.test(valor);
}
