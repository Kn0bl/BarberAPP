import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface ClientListItem {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  visits: number;
}

/** Clientes de la barbería con su cantidad de visitas registradas. */
export function useClients(barbershopId: string | null) {
  return useQuery({
    queryKey: ["clients", barbershopId ?? "none"],
    enabled: Boolean(barbershopId),
    queryFn: async (): Promise<ClientListItem[]> => {
      const [profilesResult, rolesResult, appointmentsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone, email")
          .eq("barbershop_id", barbershopId as string)
          .order("full_name"),
        supabase.from("user_roles").select("user_id, role").eq("role", "customer"),
        supabase
          .from("appointments")
          .select("client_id, status")
          .eq("barbershop_id", barbershopId as string),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (appointmentsResult.error) throw appointmentsResult.error;

      const customerIds = new Set((rolesResult.data ?? []).map((row) => row.user_id));
      const visits = new Map<string, number>();
      for (const appointment of appointmentsResult.data ?? []) {
        if (!appointment.client_id) continue;
        visits.set(appointment.client_id, (visits.get(appointment.client_id) ?? 0) + 1);
      }

      return (profilesResult.data ?? [])
        .filter((profile) => customerIds.has(profile.id))
        .map((profile: Pick<Tables<"profiles">, "id" | "full_name" | "phone" | "email">) => ({
          id: profile.id,
          fullName: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          visits: visits.get(profile.id) ?? 0,
        }));
    },
  });
}
