import Link from "next/link";

import { LayoutList, LogOut, Plus } from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";

import { cerrarSesion } from "../actions";
import { getUsuarioActual } from "../queries";

/**
 * Bloque de acciones del header. Server Component: lee la sesión y decide qué
 * mostrar, sin enviar nada de auth al cliente.
 */
export async function UserMenu() {
  const user = await getUsuarioActual();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={buttonStyles({ variant: "fantasma", size: "sm" })}
        >
          Iniciar sesión
        </Link>
        <Link
          href="/avisos/nuevo"
          className={buttonStyles({ variant: "primario", size: "sm" })}
        >
          <Plus aria-hidden="true" className="size-4" />
          Publicar aviso
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/mis-avisos"
        className={buttonStyles({ variant: "fantasma", size: "sm" })}
      >
        <LayoutList aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Mis avisos</span>
      </Link>

      <Link
        href="/avisos/nuevo"
        className={buttonStyles({ variant: "primario", size: "sm" })}
      >
        <Plus aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Publicar aviso</span>
        <span className="sm:hidden">Publicar</span>
      </Link>

      <form action={cerrarSesion}>
        <Button
          type="submit"
          variant="contorno"
          size="sm"
          title={`Cerrar sesión (${user.email})`}
          aria-label={`Cerrar sesión de ${user.email}`}
        >
          <LogOut aria-hidden="true" className="size-4" />
        </Button>
      </form>
    </div>
  );
}
