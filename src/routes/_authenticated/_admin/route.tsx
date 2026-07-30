import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { ADMIN_NAV } from "@/config/navigation";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: ({ context }) => {
    if (context.auth.role !== "admin") throw redirect({ to: "/inicio" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { auth } = Route.useRouteContext();

  return (
    <AppShell auth={auth} items={ADMIN_NAV} homeHref="/admin/agenda" profileHref="/admin/perfil">
      <Outlet />
    </AppShell>
  );
}
