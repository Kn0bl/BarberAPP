import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { agendaKeys, type Appointment } from "@/features/agenda/api";
import { supabase } from "@/integrations/supabase/client";
import { toDateKey } from "@/lib/format";

export const SLOT_TAKEN_MESSAGE = "Ese horario acaba de ocuparse, elegí otro";

export const myAppointmentsKeys = {
  list: (clientId: string) => ["my-appointments", clientId] as const,
};

export function useMyAppointments(clientId: string | null) {
  return useQuery({
    queryKey: myAppointmentsKeys.list(clientId ?? "none"),
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, service:services(id, name, price_cents)")
        .eq("client_id", clientId as string)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Appointment[];
    },
    enabled: Boolean(clientId),
  });
}

export interface CancelAppointmentInput {
  id: string;
  barbershopId: string;
  startsAt: string;
}

export function useCancelAppointment(clientId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CancelAppointmentInput) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: myAppointmentsKeys.list(clientId ?? "none") });
      queryClient.invalidateQueries({
        queryKey: agendaKeys.day(input.barbershopId, toDateKey(new Date(input.startsAt))),
      });
    },
  });
}


export interface ClientAppointmentInput {
  clientId: string;
  clientName: string;
  clientPhone?: string | null;
  serviceId: string;
  priceCents: number;
  durationMinutes: number;
  startsAt: Date;
}

/**
 * Reserva del lado del cliente. Revalida el horario justo antes de insertar
 * para reducir (no eliminar) la ventana de doble reserva.
 */
export function useCreateClientAppointment(barbershopId: string | null, dayKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ClientAppointmentInput) => {
      if (!barbershopId) throw new Error("No pudimos identificar la barbería");

      const startsAt = input.startsAt.toISOString();

      const { data: taken, error: checkError } = await supabase
        .from("appointments")
        .select("id")
        .eq("barbershop_id", barbershopId)
        .eq("starts_at", startsAt)
        .neq("status", "cancelled")
        .limit(1);

      if (checkError) throw checkError;
      if (taken && taken.length > 0) throw new Error(SLOT_TAKEN_MESSAGE);

      const endsAt = new Date(input.startsAt.getTime() + input.durationMinutes * 60_000);

      const { error } = await supabase.from("appointments").insert({
        barbershop_id: barbershopId,
        client_id: input.clientId,
        client_name: input.clientName,
        client_phone: input.clientPhone || null,
        service_id: input.serviceId,
        price_cents: input.priceCents,
        starts_at: startsAt,
        ends_at: endsAt.toISOString(),
        status: "confirmed",
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agendaKeys.day(barbershopId ?? "none", dayKey) }),
  });
}
