import Link from "next/link";

import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-card">
      <Container className="flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <p className="text-sm text-ink-soft">
          Busco Músicos · clasificados para armar banda.
        </p>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-ink-soft transition-colors hover:text-ink">
            Avisos
          </Link>
          <Link
            href="/avisos/nuevo"
            className="text-ink-soft transition-colors hover:text-ink"
          >
            Publicar
          </Link>
          <Link
            href="/mis-avisos"
            className="text-ink-soft transition-colors hover:text-ink"
          >
            Mis avisos
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
