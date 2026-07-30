import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { NextAppointmentCard } from "@/features/appointments/components/next-appointment-card";

export const Route = createFileRoute("/_authenticated/_client/inicio")({
  head: () => ({
    meta: [
      { title: "Inicio — Navaja" },
      { name: "description", content: "Tu resumen de turnos y acceso rápido para reservar en la barbería." },
      { property: "og:title", content: "Inicio — Navaja" },
      { property: "og:description", content: "Tu resumen de turnos y acceso rápido para reservar en la barbería." },
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
        description="Reservá tu próximo turno o revisá el que ya tenés agendado."
        actions={
          <Button asChild>
            <Link to="/reservar">
              <CalendarPlus className="size-4" aria-hidden />
              Reservar turno
            </Link>
          </Button>
        }
      />

      {/* Sin lógica de reservas todavía: la tarjeta se alimentará del turno real en el próximo sprint. */}
      <NextAppointmentCard appointment={null} />
    </>
  );
}
