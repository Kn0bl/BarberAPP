import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_authenticated/_admin/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Panel Navaja" },
      { name: "description", content: "Listado de clientes de la barbería con su historial de turnos." },
      { property: "og:title", content: "Clientes — Panel Navaja" },
      { property: "og:description", content: "Listado de clientes de la barbería con su historial de turnos." },
    ],
  }),
  component: AdminClientsPage,
});

function AdminClientsPage() {
  return (
    <>
      <PageHeader title="Clientes" description="Todas las personas registradas en tu barbería." />
      <EmptyState
        icon={Users}
        title="Todavía no hay clientes"
        description="Cada persona que se registre en la app va a aparecer en esta lista."
      />
    </>
  );
}
