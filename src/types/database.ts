/**
 * Tipos de la base de datos.
 *
 * Están escritos a mano para que el proyecto arranque sin depender de la CLI,
 * y reflejan exactamente `supabase/migrations/`. Cuando el schema crezca,
 * conviene regenerarlos:
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public \
 *     > src/types/database.ts
 */

export type AvisoTipo = "busco_musico" | "me_ofrezco";
export type AvisoEstado = "activo" | "pausado" | "cerrado";

/** Fila tal como la devuelve Postgres. */
export type AvisoRow = {
  id: string;
  user_id: string;
  tipo: AvisoTipo;
  titulo: string;
  descripcion: string;
  instrumento: string;
  genero_musical: string;
  ubicacion: string;
  imagen_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  otra_red_url: string | null;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string | null;
  estado: AvisoEstado;
  created_at: string;
  updated_at: string;
};

/** Payload de INSERT: lo que tiene default en la DB es opcional acá. */
export type AvisoInsert = Omit<
  AvisoRow,
  "id" | "estado" | "created_at" | "updated_at"
> & {
  id?: string;
  estado?: AvisoEstado;
  created_at?: string;
  updated_at?: string;
};

/** Payload de UPDATE. `user_id` y `created_at` los bloquea un trigger. */
export type AvisoUpdate = Partial<
  Omit<AvisoRow, "id" | "user_id" | "created_at" | "updated_at">
>;

export type Database = {
  public: {
    Tables: {
      avisos: {
        Row: AvisoRow;
        Insert: AvisoInsert;
        Update: AvisoUpdate;
        Relationships: [
          {
            foreignKeyName: "avisos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      aviso_tipo: AvisoTipo;
      aviso_estado: AvisoEstado;
    };
    CompositeTypes: Record<never, never>;
  };
};
