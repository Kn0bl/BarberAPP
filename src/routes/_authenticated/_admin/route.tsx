import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { OWNER_NAV } from "@/config/navigation";

/** Route guard del panel: solo el rol `owner` entra; el resto vuelve al inicio. */
export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: ({ context }) => {
    if (context.auth.role !== "owner") throw redirect({ to: "/inicio" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { auth } = Route.useRouteContext();

  return (
    <AppShell auth={auth} items={OWNER_NAV} homeHref="/admin/agenda" profileHref="/admin/perfil">
      <Outlet />
    </AppShell>
  );
}
