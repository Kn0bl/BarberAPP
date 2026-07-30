import { createFileRoute } from "@tanstack/react-router";
import { Scissors } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_authenticated/_admin/admin/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios — Panel Navaja" },
      { name: "description", content: "Administrá los servicios, duraciones y precios de tu barbería." },
      { property: "og:title", content: "Servicios — Panel Navaja" },
      { property: "og:description", content: "Administrá los servicios, duraciones y precios de tu barbería." },
    ],
  }),
  component: AdminServicesPage,
});

function AdminServicesPage() {
  return (
    <>
      <PageHeader title="Servicios" description="Duraciones y precios del catálogo." />
      <EmptyState
        icon={Scissors}
        title="Gestión de servicios en camino"
        description="La tabla de servicios ya existe en la base de datos. Acá vas a poder crearlos y editarlos."
      />
    </>
  );
}
