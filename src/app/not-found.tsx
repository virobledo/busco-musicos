import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[calc(100dvh-16rem)] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-busco">Error 404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        No encontramos esta página
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">
        Puede que el aviso se haya cerrado, que lo hayan pausado, o que el link
        esté mal escrito.
      </p>
      <Link href="/" className={buttonStyles({ className: "mt-8" })}>
        Ver todos los avisos
      </Link>
    </Container>
  );
}
