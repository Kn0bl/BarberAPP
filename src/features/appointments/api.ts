import { useMutation, useQueryClient } from "@tanstack/react-query";

import { agendaKeys } from "@/features/agenda/api";
import { supabase } from "@/integrations/supabase/client";

export const SLOT_TAKEN_MESSAGE = "Ese horario acaba de ocuparse, elegí otro";

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
