import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { CLIENT_NAV } from "@/config/navigation";

export const Route = createFileRoute("/_authenticated/_client")({
  beforeLoad: ({ context }) => {
    if (context.auth.role === "admin") throw redirect({ to: "/admin/agenda" });
  },
  component: ClientLayout,
});

function ClientLayout() {
  const { auth } = Route.useRouteContext();

  return (
    <AppShell auth={auth} items={CLIENT_NAV} homeHref="/inicio" profileHref="/perfil">
      <Outlet />
    </AppShell>
  );
}
