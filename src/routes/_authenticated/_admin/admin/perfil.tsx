import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/page-header";
import { ProfileForm } from "@/features/auth/components/profile-form";

export const Route = createFileRoute("/_authenticated/_admin/admin/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Panel Navaja" },
      { name: "description", content: "Datos de la cuenta del administrador de la barbería." },
      { property: "og:title", content: "Perfil — Panel Navaja" },
      { property: "og:description", content: "Datos de la cuenta del administrador de la barbería." },
    ],
  }),
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const { auth } = Route.useRouteContext();

  return (
    <>
      <PageHeader title="Perfil" description="Los datos de tu cuenta de administrador." />
      <ProfileForm auth={auth} />
    </>
  );
}
