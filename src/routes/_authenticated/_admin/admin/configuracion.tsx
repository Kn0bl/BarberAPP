import { createFileRoute } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_authenticated/_admin/admin/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — Panel Navaja" },
      { name: "description", content: "Horarios de atención, disponibilidad y preferencias de la barbería." },
      { property: "og:title", content: "Configuración — Panel Navaja" },
      { property: "og:description", content: "Horarios de atención, disponibilidad y preferencias de la barbería." },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Configuración" description="Horarios, disponibilidad y bloqueos." />
      <EmptyState
        icon={Settings2}
        title="Configuración en preparación"
        description="Las tablas de disponibilidad, bloqueos y ajustes ya están creadas y listas para conectarse."
      />
    </>
  );
}
