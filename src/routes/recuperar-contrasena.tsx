import { createFileRoute, Link } from "@tanstack/react-router";

import { Logo } from "@/components/layout/logo";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const Route = createFileRoute("/recuperar-contrasena")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — Navaja" },
      {
        name: "description",
        content: "Recibí un enlace por email para crear una contraseña nueva y volver a tu cuenta.",
      },
      { property: "og:title", content: "Recuperar contraseña — Navaja" },
      {
        property: "og:description",
        content: "Recibí un enlace por email para crear una contraseña nueva y volver a tu cuenta.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresá tu email y te mandamos un enlace para crear una nueva.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm">
          <Link
            to="/auth"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Volver a ingresar
          </Link>
        </p>
      </div>
    </main>
  );
}
