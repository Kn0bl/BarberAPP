import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { AgendaBoard } from "@/features/agenda/components/agenda-board";
import { addDays, formatDayLabel, toDateKey } from "@/lib/format";

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

function AdminAgendaPage() {
  const { auth } = Route.useRouteContext();
  const [date, setDate] = useState(() => new Date());

  const dayKey = useMemo(() => toDateKey(date), [date]);
  const isToday = dayKey === toDateKey(new Date());

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Tocá un horario para crear, bloquear o gestionar un turno."
      />

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Día anterior"
          onClick={() => setDate((current) => addDays(current, -1))}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-medium capitalize">{formatDayLabel(date)}</p>
          {!isToday ? (
            <button
              type="button"
              className="text-xs text-primary"
              onClick={() => setDate(new Date())}
            >
              Volver a hoy
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">Hoy</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Día siguiente"
          onClick={() => setDate((current) => addDays(current, 1))}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>

      <AgendaBoard barbershopId={auth.barbershopId} dayKey={dayKey} date={date} />
    </>
  );
}
