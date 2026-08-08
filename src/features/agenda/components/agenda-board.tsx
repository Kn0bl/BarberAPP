import { useMemo, useState } from "react";
import { Ban, Check, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useServices } from "@/features/services/api";
import { formatCurrency, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  useAgendaDay,
  useBarbershopSchedule,
  useCreateAppointment,
  useCreateTimeBlock,
  useDeleteTimeBlock,
  useSetAppointmentStatus,
  useUpdateAppointment,
  type Appointment,
  type TimeBlock,
} from "../api";
import { APPOINTMENT_STATUS_LABEL, paymentLabel } from "../schemas";
import { generateDaySlots, isOpenDay, type DaySlot } from "../slots";
import { AppointmentForm } from "./appointment-form";

type SheetState =
  | { type: "none" }
  | { type: "free"; slot: DaySlot }
  | { type: "create"; slot: DaySlot }
  | { type: "detail"; appointment: Appointment }
  | { type: "edit"; appointment: Appointment }
  | { type: "block"; slot: DaySlot; block: TimeBlock };

interface AgendaBoardProps {
  barbershopId: string | null;
  dayKey: string;
  date: Date;
}

/** Lista cronológica de horarios del día con acciones en bottom sheet. */
export function AgendaBoard({ barbershopId, dayKey, date }: AgendaBoardProps) {
  const [sheet, setSheet] = useState<SheetState>({ type: "none" });

  const agenda = useAgendaDay(barbershopId, dayKey, date);
  const schedule = useBarbershopSchedule(barbershopId);
  const services = useServices(barbershopId);

  const createAppointment = useCreateAppointment(barbershopId, dayKey);
  const updateAppointment = useUpdateAppointment(barbershopId, dayKey);
  const setStatus = useSetAppointmentStatus(barbershopId, dayKey);
  const createBlock = useCreateTimeBlock(barbershopId, dayKey);
  const deleteBlock = useDeleteTimeBlock(barbershopId, dayKey);

  const slots = useMemo(
    () =>
      generateDaySlots(
        date,
        schedule.data?.availability ?? [],
        schedule.data?.slotMinutes ?? 30,
      ),
    [date, schedule.data],
  );

  const rows = useMemo(() => {
    const appointments = agenda.data?.appointments ?? [];
    const blocks = agenda.data?.blocks ?? [];

    return slots.map((slot) => {
      const inSlot = (iso: string) => {
        const value = new Date(iso).getTime();
        return value >= slot.start.getTime() && value < slot.end.getTime();
      };
      return {
        slot,
        appointment: appointments.find((item) => inSlot(item.starts_at)) ?? null,
        block: blocks.find((item) => inSlot(item.starts_at)) ?? null,
      };
    });
  }, [slots, agenda.data]);

  if (!isOpenDay(date)) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
        La barbería no atiende los domingos.
      </div>
    );
  }

  if (agenda.isLoading) return <LoadingState rows={5} />;
  if (agenda.isError) return <ErrorState onRetry={() => agenda.refetch()} />;

  const closeSheet = () => setSheet({ type: "none" });

  async function handleBlock(slot: DaySlot) {
    try {
      await createBlock.mutateAsync({ startsAt: slot.start, endsAt: slot.end });
      toast.success("Horario bloqueado");
      closeSheet();
    } catch {
      toast.error("No pudimos bloquear el horario");
    }
  }

  return (
    <>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {rows.map(({ slot, appointment, block }) => {
          const busy = Boolean(appointment) || Boolean(block);
          return (
            <li key={slot.time}>
              <button
                type="button"
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                onClick={() => {
                  if (appointment) setSheet({ type: "detail", appointment });
                  else if (block) setSheet({ type: "block", slot, block });
                  else setSheet({ type: "free", slot });
                }}
              >
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">
                  {slot.time}
                </span>
                <span className="min-w-0 flex-1">
                  {appointment ? (
                    <>
                      <span className="block truncate text-sm font-medium">
                        {appointment.client_name ?? "Cliente"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {appointment.service?.name ?? "Servicio"} ·{" "}
                        {APPOINTMENT_STATUS_LABEL[appointment.status]}
                      </span>
                    </>
                  ) : block ? (
                    <span className="text-sm text-muted-foreground">Bloqueado</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Libre</span>
                  )}
                </span>
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    appointment ? "bg-primary" : busy ? "bg-muted-foreground/50" : "bg-border",
                  )}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>

      <Drawer open={sheet.type !== "none"} onOpenChange={(open) => !open && closeSheet()}>
        <DrawerContent className="px-4 pb-8">
          {sheet.type === "free" ? (
            <>
              <DrawerHeader className="px-0">
                <DrawerTitle>{sheet.slot.time}</DrawerTitle>
                <DrawerDescription>Horario libre. ¿Qué querés hacer?</DrawerDescription>
              </DrawerHeader>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  onClick={() => setSheet({ type: "create", slot: sheet.slot })}
                >
                  <Plus className="size-4" aria-hidden />
                  Crear turno manualmente
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={createBlock.isPending}
                  onClick={() => handleBlock(sheet.slot)}
                >
                  <Ban className="size-4" aria-hidden />
                  Bloquear horario
                </Button>
              </div>
            </>
          ) : null}

          {sheet.type === "create" ? (
            <>
              <DrawerHeader className="px-0">
                <DrawerTitle>Nuevo turno · {sheet.slot.time}</DrawerTitle>
                <DrawerDescription>Cargá los datos del cliente.</DrawerDescription>
              </DrawerHeader>
              {services.isLoading ? (
                <LoadingState rows={2} />
              ) : (
              <AppointmentForm
                services={services.data ?? []}
                submitLabel="Guardar turno"
                pending={createAppointment.isPending}
                onSubmit={async (values, service) => {
                  try {
                    await createAppointment.mutateAsync({
                      clientName: values.clientName,
                      clientPhone: values.clientPhone,
                      serviceId: values.serviceId,
                      paymentMethod: values.paymentMethod,
                      priceCents: service?.price_cents ?? 0,
                      startsAt: sheet.slot.start,
                      endsAt: sheet.slot.end,
                    });
                    toast.success("Turno creado");
                    closeSheet();
                  } catch {
                    toast.error("No pudimos crear el turno");
                  }
                }}
              />
              )}
            </>
          ) : null}

          {sheet.type === "detail" ? (
            <>
              <DrawerHeader className="px-0">
                <DrawerTitle>{sheet.appointment.client_name ?? "Cliente"}</DrawerTitle>
                <DrawerDescription>
                  {formatTime(sheet.appointment.starts_at)} ·{" "}
                  {sheet.appointment.service?.name ?? "Servicio"}
                </DrawerDescription>
              </DrawerHeader>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Teléfono</dt>
                  <dd>{sheet.appointment.client_phone ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Método de pago</dt>
                  <dd>{paymentLabel(sheet.appointment.payment_method)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Precio</dt>
                  <dd>{formatCurrency(sheet.appointment.price_cents)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd>
                    <Badge variant="secondary">
                      {APPOINTMENT_STATUS_LABEL[sheet.appointment.status]}
                    </Badge>
                  </dd>
                </div>
              </dl>

              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setSheet({ type: "edit", appointment: sheet.appointment })}
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
                <Button
                  className="w-full justify-start"
                  disabled={setStatus.isPending || sheet.appointment.status === "completed"}
                  onClick={async () => {
                    try {
                      await setStatus.mutateAsync({
                        id: sheet.appointment.id,
                        status: "completed",
                      });
                      toast.success("Turno marcado como realizado");
                      closeSheet();
                    } catch {
                      toast.error("No pudimos actualizar el turno");
                    }
                  }}
                >
                  <Check className="size-4" aria-hidden />
                  Marcar como realizado
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  disabled={setStatus.isPending}
                  onClick={async () => {
                    try {
                      await setStatus.mutateAsync({
                        id: sheet.appointment.id,
                        status: "cancelled",
                      });
                      toast.success("Turno cancelado");
                      closeSheet();
                    } catch {
                      toast.error("No pudimos cancelar el turno");
                    }
                  }}
                >
                  <X className="size-4" aria-hidden />
                  Cancelar turno
                </Button>
              </div>
            </>
          ) : null}

          {sheet.type === "edit" ? (
            <>
              <DrawerHeader className="px-0">
                <DrawerTitle>Editar turno</DrawerTitle>
                <DrawerDescription>{formatTime(sheet.appointment.starts_at)}</DrawerDescription>
              </DrawerHeader>
              <AppointmentForm
                services={services.data ?? []}
                submitLabel="Guardar cambios"
                pending={updateAppointment.isPending}
                defaultValues={{
                  clientName: sheet.appointment.client_name ?? "",
                  clientPhone: sheet.appointment.client_phone ?? "",
                  serviceId: sheet.appointment.service_id ?? "",
                  paymentMethod: sheet.appointment.payment_method,
                }}
                onSubmit={async (values, service) => {
                  try {
                    await updateAppointment.mutateAsync({
                      id: sheet.appointment.id,
                      clientName: values.clientName,
                      clientPhone: values.clientPhone,
                      serviceId: values.serviceId,
                      paymentMethod: values.paymentMethod,
                      priceCents: service?.price_cents ?? sheet.appointment.price_cents,
                    });
                    toast.success("Turno actualizado");
                    closeSheet();
                  } catch {
                    toast.error("No pudimos actualizar el turno");
                  }
                }}
              />
            </>
          ) : null}

          {sheet.type === "block" ? (
            <>
              <DrawerHeader className="px-0">
                <DrawerTitle>{sheet.slot.time} · Bloqueado</DrawerTitle>
                <DrawerDescription>Este horario no está disponible para turnos.</DrawerDescription>
              </DrawerHeader>
              <Button
                variant="outline"
                className="w-full"
                disabled={deleteBlock.isPending}
                onClick={async () => {
                  try {
                    await deleteBlock.mutateAsync({ id: sheet.block.id });
                    toast.success("Horario liberado");
                    closeSheet();
                  } catch {
                    toast.error("No pudimos liberar el horario");
                  }
                }}
              >
                Liberar horario
              </Button>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  );
}
