import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/layout/logo";
import { FullPageLoader } from "@/components/common/loading-state";
import { fetchAuthContext } from "@/features/auth/api";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { homeForRole } from "@/config/navigation";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/restablecer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nueva contraseña — Navaja" },
      { name: "description", content: "Definí una contraseña nueva para tu cuenta de Navaja." },
      { property: "og:title", content: "Nueva contraseña — Navaja" },
      { property: "og:description", content: "Definí una contraseña nueva para tu cuenta de Navaja." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus(data.session ? "ready" : "invalid");
    });
    return () => {
      active = false;
    };
  }, []);

  async function onSuccess() {
    toast.success("Contraseña actualizada");
    const auth = await fetchAuthContext();
    await router.invalidate();
    await navigate({ to: auth ? homeForRole(auth.role) : "/auth", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Nueva contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Elegí una contraseña segura para volver a entrar.
          </p>
        </div>

        {status === "checking" ? <FullPageLoader label="Validando el enlace…" /> : null}

        {status === "invalid" ? (
          <div className="space-y-3 text-center">
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              El enlace expiró o no es válido.
            </p>
            <Link
              to="/recuperar-contrasena"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Pedir un enlace nuevo
            </Link>
          </div>
        ) : null}

        {status === "ready" ? <ResetPasswordForm onSuccess={onSuccess} /> : null}
      </div>
    </main>
  );
}
