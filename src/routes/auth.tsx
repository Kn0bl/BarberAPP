import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAuthContext } from "@/features/auth/api";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useSignOut } from "@/features/auth/use-sign-out";
import { homeForRole, roleLabel } from "@/config/navigation";
import type { AuthContext } from "@/features/auth/types";

export const Route = createFileRoute("/auth")({
  ssr: false,
  /**
   * No redirigimos automáticamente: si ya hay sesión mostramos el estado
   * de la cuenta para que el usuario decida continuar o cerrar sesión.
   */
  beforeLoad: async () => ({ existingAuth: await fetchAuthContext() }),
  head: () => ({
    meta: [
      { title: "Ingresar o crear cuenta — Navaja" },
      {
        name: "description",
        content: "Accedé a tu cuenta para reservar turnos en la barbería o gestionar la agenda.",
      },
      { property: "og:title", content: "Ingresar o crear cuenta — Navaja" },
      {
        property: "og:description",
        content: "Accedé a tu cuenta para reservar turnos en la barbería o gestionar la agenda.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { existingAuth } = Route.useRouteContext();
  const router = useRouter();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [notice, setNotice] = useState<string | null>(null);

  async function goHome() {
    const auth = await fetchAuthContext();
    await router.invalidate();
    if (auth) {
      await navigate({ to: homeForRole(auth.role), replace: true });
    } else {
      setNotice("Te enviamos un email para confirmar tu cuenta. Confirmalo y volvé a ingresar.");
      setTab("login");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Turnos sin vueltas
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresá a tu cuenta o registrate para reservar en segundos.
          </p>
        </div>

        {existingAuth ? (
          <ActiveSessionPanel auth={existingAuth} />
        ) : (
          <>
            {notice ? (
              <p className="rounded-md bg-primary/10 px-3 py-2 text-center text-sm text-primary">
                {notice}
              </p>
            ) : null}

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Ingresar</TabsTrigger>
                <TabsTrigger value="register">Crear cuenta</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6 space-y-4">
                <LoginForm onSuccess={goHome} />
                <p className="text-center text-sm">
                  <Link
                    to="/recuperar-contrasena"
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </p>
              </TabsContent>
              <TabsContent value="register" className="mt-6">
                <RegisterForm onSuccess={goHome} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  );
}

function ActiveSessionPanel({ auth }: { auth: AuthContext }) {
  const { signOut, pending } = useSignOut();
  const name = auth.profile?.full_name || auth.user.email;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5 text-center">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Ya tenés una sesión activa</p>
        <p className="text-sm text-muted-foreground">
          Estás dentro como <span className="text-foreground">{name}</span> ({roleLabel(auth.role)}).
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button asChild>
          <Link to={homeForRole(auth.role)}>Continuar</Link>
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => void signOut()}>
          {pending ? "Cerrando sesión…" : "Cerrar sesión y usar otra cuenta"}
        </Button>
      </div>
    </div>
  );
}
