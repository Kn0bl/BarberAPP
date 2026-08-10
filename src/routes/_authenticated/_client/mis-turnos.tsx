import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBarbershopSchedule, type Appointment } from "@/features/agenda/api";
import { APPOINTMENT_STATUS_LABEL } from "@/features/agenda/schemas";
import { useCancelAppointment, useMyAppointments } from "@/features/appointments/api";
import { formatCurrency, formatDayLabel, formatTime } from "@/lib/format";

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

function AppointmentCard({
  appointment,
  onCancel,
  cancelDisabledReason,
}: {
  appointment: Appointment;
  onCancel?: () => void;
  cancelDisabledReason?: string;
}) {
  const date = new Date(appointment.starts_at);
  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">{appointment.service?.name ?? "Servicio"}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {formatDayLabel(date)} · {formatTime(date)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(appointment.price_cents)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {APPOINTMENT_STATUS_LABEL[appointment.status] ?? appointment.status}
          </Badge>
          {onCancel ? (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          ) : cancelDisabledReason ? (
            <p className="max-w-[12rem] text-xs text-muted-foreground">{cancelDisabledReason}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MyAppointmentsPage() {
  const { auth } = Route.useRouteContext();
  const appointments = useMyAppointments(auth.user.id);
  const cancelAppointment = useCancelAppointment(auth.user.id);
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null);

  const { upcoming, history } = useMemo(() => {
    const now = Date.now();
    const rows = appointments.data ?? [];
    const upcomingRows = rows
      .filter(
        (row) => new Date(row.starts_at).getTime() >= now && row.status !== "cancelled",
      )
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    const historyRows = rows
      .filter((row) => !upcomingRows.includes(row))
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
    return { upcoming: upcomingRows, history: historyRows };
  }, [appointments.data]);

  async function handleConfirmCancel() {
    const appointment = pendingCancel;
    if (!appointment) return;
    try {
      await cancelAppointment.mutateAsync({
        id: appointment.id,
        barbershopId: appointment.barbershop_id,
        startsAt: appointment.starts_at,
      });
      toast.success("Turno cancelado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos cancelar el turno");
    } finally {
      setPendingCancel(null);
    }
  }

  return (
    <>
      <PageHeader title="Mis turnos" description="Próximos turnos e historial." />

      {appointments.isLoading ? <LoadingState rows={3} /> : null}
      {appointments.isError ? <ErrorState onRetry={() => appointments.refetch()} /> : null}

      {appointments.isSuccess ? (
        <Tabs defaultValue="proximos">
          <TabsList>
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="proximos" className="mt-4 space-y-3">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No tenés turnos próximos"
                description="Cuando reserves, vas a poder ver y cancelar tus turnos desde acá."
              />
            ) : (
              upcoming.map((appointment) => {
                const hoursUntil =
                  (new Date(appointment.starts_at).getTime() - Date.now()) / 3_600_000;
                const cancelWindow = schedule.data?.cancellationWindowHours ?? 12;
                const withinCancelWindow = hoursUntil >= cancelWindow;
                const isCancellableStatus =
                  appointment.status === "pending" || appointment.status === "confirmed";
                return (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={
                      isCancellableStatus && withinCancelWindow
                        ? () => setPendingCancel(appointment)
                        : undefined
                    }
                    cancelDisabledReason={
                      isCancellableStatus && !withinCancelWindow
                        ? `Ya no se puede cancelar (mínimo ${cancelWindow} h de anticipación)`
                        : undefined
                    }
                  />
                );
              })
            )}
          </TabsContent>
          <TabsContent value="historial" className="mt-4 space-y-3">
            {history.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Sin historial todavía"
                description="Acá vas a ver los turnos que ya pasaron."
              />
            ) : (
              history.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>
        </Tabs>
      ) : null}

      <AlertDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => (!open ? setPendingCancel(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a liberar el horario y no podés deshacer esta acción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmCancel();
              }}
              disabled={cancelAppointment.isPending}
            >
              {cancelAppointment.isPending ? "Cancelando…" : "Cancelar turno"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
