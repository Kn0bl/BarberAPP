import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Clock, Scissors } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/_client/inicio")({
  head: () => ({
    meta: [
      { title: "Inicio — Navaja" },
      { name: "description", content: "Tu resumen de turnos y accesos rápidos para reservar en la barbería." },
      { property: "og:title", content: "Inicio — Navaja" },
      { property: "og:description", content: "Tu resumen de turnos y accesos rápidos para reservar en la barbería." },
    ],
  }),
  component: ClientHome,
});

function ClientHome() {
  const { auth } = Route.useRouteContext();
  const firstName = auth.profile?.full_name?.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Hola"}
        description="Reservá tu próximo turno o revisá los que ya tenés agendados."
        actions={
          <Button asChild>
            <Link to="/reservar">
              <CalendarPlus className="size-4" aria-hidden />
              Reservar turno
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-primary" aria-hidden />
              Próximo turno
            </CardTitle>
            <CardDescription>Todavía no tenés turnos programados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to="/reservar">Elegir horario</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scissors className="size-4 text-primary" aria-hidden />
              Servicios
            </CardTitle>
            <CardDescription>Corte, barba y combos disponibles en la barbería.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" size="sm">
              <Link to="/reservar">Ver servicios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <EmptyState
        icon={Clock}
        title="Sin actividad reciente"
        description="Cuando reserves tu primer turno vas a ver acá el historial y los recordatorios."
      />
    </>
  );
}
