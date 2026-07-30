import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAuthContext } from "@/features/auth/api";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { homeForRole } from "@/config/navigation";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const auth = await fetchAuthContext();
    if (auth) throw redirect({ to: homeForRole(auth.role) });
  },
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
          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={goHome} />
          </TabsContent>
          <TabsContent value="register" className="mt-6">
            <RegisterForm onSuccess={goHome} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
