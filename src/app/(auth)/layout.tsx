import { Container } from "@/components/layout/container";

/**
 * Route group `(auth)`: no agrega segmento a la URL, las rutas siguen siendo
 * `/login` y `/registro`. Solo centra el formulario en la pantalla.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <Container className="flex min-h-[calc(100dvh-16rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">{children}</div>
    </Container>
  );
}
