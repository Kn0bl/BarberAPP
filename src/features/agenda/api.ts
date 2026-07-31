import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { dayRange } from "./slots";

export type Appointment = Tables<"appointments"> & {
  service: Pick<Tables<"services">, "id" | "name" | "price_cents"> | null;
};
export type TimeBlock = Tables<"time_blocks">;

export const agendaKeys = {
  day: (barbershopId: string, dayKey: string) => ["agenda", barbershopId, dayKey] as const,
};

export interface AgendaDay {
  appointments: Appointment[];
  blocks: TimeBlock[];
}

async function fetchAgendaDay(barbershopId: string, date: Date): Promise<AgendaDay> {
  const { from, to } = dayRange(date);

  const [appointmentsResult, blocksResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, service:services(id, name, price_cents)")
      .eq("barbershop_id", barbershopId)
      .neq("status", "cancelled")
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString())
      .order("starts_at"),
    supabase
      .from("time_blocks")
      .select("*")
      .eq("barbershop_id", barbershopId)
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString()),
  ]);

  if (appointmentsResult.error) throw appointmentsResult.error;
  if (blocksResult.error) throw blocksResult.error;

  return {
    appointments: (appointmentsResult.data ?? []) as Appointment[],
    blocks: blocksResult.data ?? [],
  };
}

export function useAgendaDay(barbershopId: string | null, dayKey: string, date: Date) {
  return useQuery({
    queryKey: agendaKeys.day(barbershopId ?? "none", dayKey),
    queryFn: () => fetchAgendaDay(barbershopId as string, date),
    enabled: Boolean(barbershopId),
  });
}

function useAgendaMutation<TVars>(
  barbershopId: string | null,
  dayKey: string,
  fn: (vars: TVars) => Promise<void>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agendaKeys.day(barbershopId ?? "none", dayKey) }),
  });
}

export interface ManualAppointmentInput {
  clientName: string;
  clientPhone?: string;
  serviceId: string;
  paymentMethod: "cash" | "transfer";
  priceCents: number;
  startsAt: Date;
  endsAt: Date;
}

export function useCreateAppointment(barbershopId: string | null, dayKey: string) {
  return useAgendaMutation<ManualAppointmentInput>(barbershopId, dayKey, async (input) => {
    const { error } = await supabase.from("appointments").insert({
      barbershop_id: barbershopId as string,
      client_id: null,
      client_name: input.clientName,
      client_phone: input.clientPhone || null,
      service_id: input.serviceId,
      payment_method: input.paymentMethod,
      price_cents: input.priceCents,
      starts_at: input.startsAt.toISOString(),
      ends_at: input.endsAt.toISOString(),
      status: "confirmed",
    });
    if (error) throw error;
  });
}

export interface UpdateAppointmentInput {
  id: string;
  clientName: string;
  clientPhone?: string;
  serviceId: string;
  paymentMethod: "cash" | "transfer";
  priceCents: number;
}

export function useUpdateAppointment(barbershopId: string | null, dayKey: string) {
  return useAgendaMutation<UpdateAppointmentInput>(barbershopId, dayKey, async (input) => {
    const { error } = await supabase
      .from("appointments")
      .update({
        client_name: input.clientName,
        client_phone: input.clientPhone || null,
        service_id: input.serviceId,
        payment_method: input.paymentMethod,
        price_cents: input.priceCents,
      })
      .eq("id", input.id);
    if (error) throw error;
  });
}

export function useSetAppointmentStatus(barbershopId: string | null, dayKey: string) {
  return useAgendaMutation<{ id: string; status: Tables<"appointments">["status"] }>(
    barbershopId,
    dayKey,
    async ({ id, status }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
  );
}

export function useCreateTimeBlock(barbershopId: string | null, dayKey: string) {
  return useAgendaMutation<{ startsAt: Date; endsAt: Date }>(
    barbershopId,
    dayKey,
    async ({ startsAt, endsAt }) => {
      const { error } = await supabase.from("time_blocks").insert({
        barbershop_id: barbershopId as string,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        reason: "Bloqueado por el administrador",
      });
      if (error) throw error;
    },
  );
}

export function useDeleteTimeBlock(barbershopId: string | null, dayKey: string) {
  return useAgendaMutation<{ id: string }>(barbershopId, dayKey, async ({ id }) => {
    const { error } = await supabase.from("time_blocks").delete().eq("id", id);
    if (error) throw error;
  });
}
