import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/_admin/admin/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Panel Navaja" },
      { name: "description", content: "Vista diaria de la agenda de la barbería con turnos y bloqueos." },
      { property: "og:title", content: "Agenda — Panel Navaja" },
      { property: "og:description", content: "Vista diaria de la agenda de la barbería con turnos y bloqueos." },
    ],
  }),
  component: AdminAgendaPage,
});

const SUMMARY = [
  { label: "Turnos hoy", value: "0" },
  { label: "Confirmados", value: "0" },
  { label: "Cancelados", value: "0" },
];

function AdminAgendaPage() {
  return (
    <>
      <PageHeader title="Agenda" description="Los turnos del día de tu barbería." />

      <div className="grid gap-4 sm:grid-cols-3">
        {SUMMARY.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Actualizado en tiempo real cuando se habiliten las reservas.
            </CardContent>
          </Card>
        ))}
      </div>

      <EmptyState
        icon={CalendarDays}
        title="Sin turnos para hoy"
        description="Cuando los clientes reserven, vas a ver la grilla horaria completa acá."
      />
    </>
  );
}
