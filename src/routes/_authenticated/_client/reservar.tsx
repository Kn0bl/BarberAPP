import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/_authenticated/_client/reservar")({
  head: () => ({
    meta: [
      { title: "Reservar turno — Navaja" },
      { name: "description", content: "Elegí servicio, día y horario para reservar tu turno en la barbería." },
      { property: "og:title", content: "Reservar turno — Navaja" },
      { property: "og:description", content: "Elegí servicio, día y horario para reservar tu turno en la barbería." },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  return (
    <>
      <PageHeader
        title="Reservar turno"
        description="Seleccioná un servicio y un horario disponible."
      />
      <EmptyState
        icon={CalendarPlus}
        title="Reservas en preparación"
        description="La estructura ya está lista: servicios, disponibilidad y bloqueos. El flujo de reserva se habilita en el próximo paso."
      />
    </>
  );
}
