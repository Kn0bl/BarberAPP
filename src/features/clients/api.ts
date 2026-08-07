import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface ClientListItem {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  visits: number;
  hasAccount: boolean;
  lastVisitDate: string | null;
  daysSinceLastVisit: number | null;
  typicalGapDays: number | null;
  isOverdue: boolean;
}

const DAY_MS = 1000 * 60 * 60 * 24;

/** Métricas de recurrencia a partir de las fechas de turnos completados. */
export function computeRecency(completedDates: Date[]): {
  lastVisitDate: string | null;
  daysSinceLastVisit: number | null;
  typicalGapDays: number | null;
  isOverdue: boolean;
} {
  if (completedDates.length === 0) {
    return {
      lastVisitDate: null,
      daysSinceLastVisit: null,
      typicalGapDays: null,
      isOverdue: false,
    };
  }

  const sorted = [...completedDates].sort((a, b) => a.getTime() - b.getTime());
  const last = sorted[sorted.length - 1];
  const daysSinceLastVisit = Math.floor((Date.now() - last.getTime()) / DAY_MS);

  let typicalGapDays: number | null = null;
  if (sorted.length >= 3) {
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i += 1) {
      gaps.push((sorted[i].getTime() - sorted[i - 1].getTime()) / DAY_MS);
    }
    gaps.sort((a, b) => a - b);
    const mid = Math.floor(gaps.length / 2);
    const median = gaps.length % 2 === 0 ? (gaps[mid - 1] + gaps[mid]) / 2 : gaps[mid];
    typicalGapDays = Math.round(median);
  }

  const isOverdue = typicalGapDays !== null && daysSinceLastVisit > typicalGapDays * 1.5;

  return { lastVisitDate: last.toISOString(), daysSinceLastVisit, typicalGapDays, isOverdue };
}

/** Clientes de la barbería con sus visitas y métricas de recurrencia. */
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
          .select("client_id, client_name, client_phone, status, starts_at")
          .eq("barbershop_id", barbershopId as string),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (appointmentsResult.error) throw appointmentsResult.error;

      const customerIds = new Set((rolesResult.data ?? []).map((row) => row.user_id));

      const visitsById = new Map<string, number>();
      const completedById = new Map<string, Date[]>();

      interface ManualEntry {
        name: string;
        phone: string | null;
        visits: number;
        completed: Date[];
      }
      const manual = new Map<string, ManualEntry>();

      for (const appointment of appointmentsResult.data ?? []) {
        if (appointment.status === "cancelled") continue;
        const isCompleted = appointment.status === "completed";
        const date = appointment.starts_at ? new Date(appointment.starts_at) : null;

        if (appointment.client_id) {
          const id = appointment.client_id;
          visitsById.set(id, (visitsById.get(id) ?? 0) + 1);
          if (isCompleted && date) {
            const list = completedById.get(id) ?? [];
            list.push(date);
            completedById.set(id, list);
          }
          continue;
        }

        const name = appointment.client_name?.trim();
        if (!name) continue;
        const phone = (appointment.client_phone ?? "").trim();
        const key = `${name.toLowerCase()}|${phone}`;
        const entry = manual.get(key) ?? { name, phone: phone || null, visits: 0, completed: [] };
        entry.visits += 1;
        if (isCompleted && date) entry.completed.push(date);
        manual.set(key, entry);
      }

      const registered: ClientListItem[] = (profilesResult.data ?? [])
        .filter((profile) => customerIds.has(profile.id))
        .map((profile) => ({
          id: profile.id,
          fullName: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          visits: visitsById.get(profile.id) ?? 0,
          hasAccount: true,
          ...computeRecency(completedById.get(profile.id) ?? []),
        }));

      const withoutAccount: ClientListItem[] = [...manual.entries()].map(([key, entry]) => ({
        id: `manual:${key}`,
        fullName: entry.name,
        phone: entry.phone,
        email: null,
        visits: entry.visits,
        hasAccount: false,
        ...computeRecency(entry.completed),
      }));

      return [...registered, ...withoutAccount].sort((a, b) =>
        a.fullName.localeCompare(b.fullName),
      );
    },
  });
}
