import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Service = Tables<"services">;

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Ingresá un nombre"),
  price: z
    .string()
    .trim()
    .min(1, "Ingresá un precio")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Precio inválido"),
});

export type ServiceValues = z.infer<typeof serviceSchema>;

export const serviceKeys = {
  list: (barbershopId: string) => ["services", barbershopId] as const,
};

export function useServices(barbershopId: string | null) {
  return useQuery({
    queryKey: serviceKeys.list(barbershopId ?? "none"),
    enabled: Boolean(barbershopId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("barbershop_id", barbershopId as string)
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data as Service[];
    },
  });
}

function useServiceMutation<TVars>(
  barbershopId: string | null,
  fn: (vars: TVars) => Promise<void>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(barbershopId ?? "none") }),
  });
}

export function useCreateService(barbershopId: string | null) {
  return useServiceMutation<{ name: string; priceCents: number }>(barbershopId, async (input) => {
    const { error } = await supabase.from("services").insert({
      barbershop_id: barbershopId as string,
      name: input.name,
      price_cents: input.priceCents,
      duration_minutes: 30,
    });
    if (error) throw error;
  });
}

export function useUpdateService(barbershopId: string | null) {
  return useServiceMutation<{ id: string; name: string; priceCents: number }>(
    barbershopId,
    async (input) => {
      const { error } = await supabase
        .from("services")
        .update({ name: input.name, price_cents: input.priceCents })
        .eq("id", input.id);
      if (error) throw error;
    },
  );
}

/** Baja lógica: los turnos históricos conservan la referencia al servicio. */
export function useDeleteService(barbershopId: string | null) {
  return useServiceMutation<{ id: string }>(barbershopId, async ({ id }) => {
    const { error } = await supabase.from("services").update({ is_active: false }).eq("id", id);
    if (error) throw error;
  });
}
