import { Megaphone, UserRoundSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AvisoEstado, AvisoTipo } from "@/types/database";

import {
  ESTADO_AVISO_LABEL,
  ESTADO_AVISO_TONE,
  TIPO_AVISO_LABEL,
  TIPO_AVISO_TONE,
} from "../constants";

const ICONO_TIPO = {
  busco_musico: UserRoundSearch,
  me_ofrezco: Megaphone,
} as const;

/** Pill que diferencia "busco músico" (verde) de "me ofrezco" (violeta). */
export function TipoBadge({
  tipo,
  conIcono = true,
  className,
}: {
  tipo: AvisoTipo;
  conIcono?: boolean;
  className?: string;
}) {
  const Icono = ICONO_TIPO[tipo];

  return (
    <Badge tone={TIPO_AVISO_TONE[tipo]} className={className}>
      {conIcono ? (
        <Icono aria-hidden="true" className="size-3.5" strokeWidth={2} />
      ) : null}
      {TIPO_AVISO_LABEL[tipo]}
    </Badge>
  );
}

/** Solo se muestra en "Mis avisos": el listado público es todo `activo`. */
export function EstadoBadge({
  estado,
  className,
}: {
  estado: AvisoEstado;
  className?: string;
}) {
  return (
    <Badge tone={ESTADO_AVISO_TONE[estado]} className={className}>
      {ESTADO_AVISO_LABEL[estado]}
    </Badge>
  );
}
