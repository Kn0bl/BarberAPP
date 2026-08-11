import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBarbershop(barbershopId: string | null) {
  return useQuery({
    queryKey: ["barbershop", barbershopId ?? "none"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbershops")
        .select("id, name, phone, email, address")
        .eq("id", barbershopId as string)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(barbershopId),
  });
}

export function useUpdateBarbershop(barbershopId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
    }) => {
      if (!barbershopId) throw new Error("Falta la barbería");
      const { error } = await supabase.from("barbershops").update(values).eq("id", barbershopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbershop", barbershopId ?? "none"] });
    },
  });
}
