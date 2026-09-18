import Link from "next/link";
import { Suspense } from "react";

import { AudioLines } from "lucide-react";

import { Container } from "@/components/layout/container";
import { UserMenu } from "@/features/auth/components/user-menu";

function UserMenuFallback() {
  return <div className="h-9 w-40 animate-pulse rounded-xl bg-line/60" />;
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          aria-label="Busco Músicos · ir al inicio"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-white transition-colors group-hover:bg-busco">
            <AudioLines aria-hidden="true" className="size-4.5" strokeWidth={2} />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">
            Busco<span className="text-ink-soft">Músicos</span>
          </span>
        </Link>

        {/* La sesión se lee por request; el Suspense evita bloquear el header. */}
        <Suspense fallback={<UserMenuFallback />}>
          <UserMenu />
        </Suspense>
      </Container>
    </header>
  );
}
