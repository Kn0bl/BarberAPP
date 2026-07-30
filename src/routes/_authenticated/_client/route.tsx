import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { CUSTOMER_NAV } from "@/config/navigation";

export const Route = createFileRoute("/_authenticated/_client")({
  beforeLoad: ({ context }) => {
    if (context.auth.role === "owner") throw redirect({ to: "/admin/agenda" });
  },
  component: ClientLayout,
});

function ClientLayout() {
  const { auth } = Route.useRouteContext();

  return (
    <AppShell auth={auth} items={CUSTOMER_NAV} homeHref="/inicio" profileHref="/perfil">
      <Outlet />
    </AppShell>
  );
}
