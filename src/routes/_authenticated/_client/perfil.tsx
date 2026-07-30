import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/page-header";
import { AccountActions } from "@/features/auth/components/account-actions";
import { ProfileForm } from "@/features/auth/components/profile-form";

export const Route = createFileRoute("/_authenticated/_client/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil — Navaja" },
      { name: "description", content: "Actualizá tus datos de contacto y preferencias de tu cuenta." },
      { property: "og:title", content: "Mi perfil — Navaja" },
      { property: "og:description", content: "Actualizá tus datos de contacto y preferencias de tu cuenta." },
    ],
  }),
  component: ClientProfilePage,
});

function ClientProfilePage() {
  const { auth } = Route.useRouteContext();

  return (
    <>
      <PageHeader title="Perfil" description="Tus datos de contacto." />
      <ProfileForm auth={auth} />
      <AccountActions />
    </>
  );
}
