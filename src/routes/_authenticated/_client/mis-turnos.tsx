import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/_client/mis-turnos")({
  head: () => ({
    meta: [
      { title: "Mis turnos — Navaja" },
      { name: "description", content: "Consultá tus turnos próximos y el historial de visitas a la barbería." },
      { property: "og:title", content: "Mis turnos — Navaja" },
      { property: "og:description", content: "Consultá tus turnos próximos y el historial de visitas a la barbería." },
    ],
  }),
  component: MyAppointmentsPage,
});

function MyAppointmentsPage() {
  return (
    <>
      <PageHeader title="Mis turnos" description="Próximos turnos e historial." />

      <Tabs defaultValue="proximos">
        <TabsList>
          <TabsTrigger value="proximos">Próximos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="proximos" className="mt-4">
          <EmptyState
            icon={CalendarDays}
            title="No tenés turnos próximos"
            description="Cuando reserves, vas a poder ver y cancelar tus turnos desde acá."
          />
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          <EmptyState
            icon={CalendarDays}
            title="Sin historial todavía"
            description="Acá vas a ver los turnos que ya pasaron."
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
