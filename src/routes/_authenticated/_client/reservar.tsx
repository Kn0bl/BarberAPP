import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarPlus, Check, Scissors } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAgendaDay, useBarbershopSchedule } from "@/features/agenda/api";
import { getAvailableSlots, isOpenDay } from "@/features/agenda/slots";
import { useCreateClientAppointment } from "@/features/appointments/api";
import { useServices, type Service } from "@/features/services/api";
import { addDays, formatCurrency, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";

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

const DAYS_AHEAD = 14;

function useUpcomingDays() {
  return useMemo(() => {
    const today = new Date();
    const days: Date[] = [];
    for (let index = 0; index < DAYS_AHEAD; index += 1) {
      const date = addDays(today, index);
      date.setHours(0, 0, 0, 0);
      if (isOpenDay(date)) days.push(date);
    }
    return days;
  }, []);
}

function StepTitle({ step, title }: { step: number; title: string }) {
  return (
    <h2 className="text-sm font-medium">
      <span className="mr-2 text-muted-foreground">{step}.</span>
      {title}
    </h2>
  );
}

function BookingPage() {
  const { auth } = Route.useRouteContext();
  const navigate = useNavigate();

  const days = useUpcomingDays();
  const today = useMemo(() => {
    const base = days[0] ? new Date(days[0]) : new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  }, [days]);
  const maxDate = useMemo(() => addDays(today, DAYS_AHEAD - 1), [today]);

  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);

  const dayKey = date ? toDateKey(date) : "none";
  const services = useServices(auth.barbershopId);
  const agendaDay = useAgendaDay(auth.barbershopId, dayKey, date ?? new Date());
  const createAppointment = useCreateClientAppointment(auth.barbershopId, dayKey);

  const slots = useMemo(() => {
    if (!date || !service || !agendaDay.data) return [];
    return getAvailableSlots(date, service.duration_minutes, agendaDay.data);
  }, [date, service, agendaDay.data]);

  const selectedSlot = slots.find((slot) => slot.time === slotTime) ?? null;
  const canConfirm = Boolean(service && date && selectedSlot) && !createAppointment.isPending;

  async function handleConfirm() {
    if (!service || !selectedSlot) return;
    try {
      await createAppointment.mutateAsync({
        clientId: auth.user.id,
        clientName: auth.profile?.full_name || auth.user.email || "Cliente",
        clientPhone: auth.profile?.phone ?? null,
        serviceId: service.id,
        priceCents: service.price_cents,
        durationMinutes: service.duration_minutes,
        startsAt: selectedSlot.start,
      });
      toast.success("Turno reservado");
      navigate({ to: "/mis-turnos" });
    } catch (error) {
      setSlotTime(null);
      agendaDay.refetch();
      toast.error(error instanceof Error ? error.message : "No pudimos reservar el turno");
    }
  }

  return (
    <>
      <PageHeader
        title="Reservar turno"
        description="Seleccioná un servicio y un horario disponible."
      />

      <section className="space-y-3">
        <StepTitle step={1} title="Elegí el servicio" />

        {services.isLoading ? <LoadingState rows={3} /> : null}
        {services.isError ? <ErrorState onRetry={() => services.refetch()} /> : null}

        {services.isSuccess && services.data.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="Sin servicios disponibles"
            description="La barbería todavía no cargó sus servicios. Volvé a intentarlo más tarde."
          />
        ) : null}

        {services.isSuccess && services.data.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {services.data.map((item) => {
              const selected = service?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setService(item);
                      setSlotTime(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors",
                      selected ? "border-primary ring-1 ring-primary" : "hover:bg-accent",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.price_cents)} · {item.duration_minutes} min
                      </p>
                    </div>
                    {selected ? <Check className="size-4 text-primary" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className="space-y-3">
        <StepTitle step={2} title="Elegí el día" />

        {!service ? (
          <p className="text-sm text-muted-foreground">
            Primero elegí un servicio para ver el calendario.
          </p>
        ) : (
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={(selected) => {
              if (!selected) return;
              setDate(selected);
              setSlotTime(null);
            }}
            disabled={(day) => day < today || day > maxDate || !isOpenDay(day)}
            className="rounded-xl border border-border bg-card mx-auto"
          />
        )}
      </section>

      <section className="space-y-3">
        <StepTitle step={3} title="Elegí el horario" />

        {!service ? (
          <p className="text-sm text-muted-foreground">
            Primero elegí un servicio para ver los horarios disponibles.
          </p>
        ) : !date ? (
          <p className="text-sm text-muted-foreground">
            Ahora elegí un día para ver los horarios disponibles.
          </p>
        ) : null}

        {service && date && agendaDay.isLoading ? <LoadingState rows={3} /> : null}
        {service && date && agendaDay.isError ? <ErrorState onRetry={() => agendaDay.refetch()} /> : null}

        {service && date && agendaDay.isSuccess && slots.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Sin horarios disponibles"
            description="No quedan horarios libres para ese día. Probá con otra fecha."
          />
        ) : null}

        {service && date && slots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((slot) => {
              const selected = slotTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSlotTime(slot.time)}
                  className={cn(
                    "rounded-lg border border-border py-2 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card hover:bg-accent",
                  )}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="sticky bottom-4 pt-2">
        <Button
          className="w-full"
          size="lg"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {createAppointment.isPending ? "Reservando…" : "Confirmar turno"}
        </Button>
      </div>
    </>
  );
}
