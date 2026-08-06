import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarPlus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_LABEL } from "@/features/agenda/schemas";
import { useMyAppointments } from "@/features/appointments/api";
import {
  NextAppointmentCard,
  type NextAppointmentSummary,
} from "@/features/appointments/components/next-appointment-card";
import { formatDayLabel, formatTime } from "@/lib/format";

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
  const appointments = useMyAppointments(auth.user.id);

  const next = useMemo<NextAppointmentSummary | null>(() => {
    const now = Date.now();
    const upcoming = (appointments.data ?? [])
      .filter((row) => new Date(row.starts_at).getTime() >= now && row.status !== "cancelled")
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];
    if (!upcoming) return null;
    const date = new Date(upcoming.starts_at);
    return {
      id: upcoming.id,
      date: formatDayLabel(date),
      time: formatTime(date),
      serviceName: upcoming.service?.name ?? "Servicio",
      status: APPOINTMENT_STATUS_LABEL[upcoming.status] ?? upcoming.status,
    };
  }, [appointments.data]);

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

      <NextAppointmentCard appointment={next} />
    </>
  );
}

