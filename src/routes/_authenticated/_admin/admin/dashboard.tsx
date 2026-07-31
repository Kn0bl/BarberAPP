import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarRange, Wallet } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/_admin/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Panel Navaja" },
      { name: "description", content: "Resumen de turnos e ingresos estimados de la barbería." },
      { property: "og:title", content: "Dashboard — Panel Navaja" },
      { property: "og:description", content: "Resumen de turnos e ingresos estimados de la barbería." },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { auth } = Route.useRouteContext();

  const summary = useQuery({
    queryKey: ["dashboard", auth.barbershopId ?? "none"],
    enabled: Boolean(auth.barbershopId),
    queryFn: async () => {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const weekEnd = new Date(dayStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data, error } = await supabase
        .from("appointments")
        .select("starts_at, price_cents, status")
        .eq("barbershop_id", auth.barbershopId as string)
        .neq("status", "cancelled")
        .gte("starts_at", dayStart.toISOString())
        .lt("starts_at", weekEnd.toISOString());
      if (error) throw error;

      const rows = data ?? [];
      const today = rows.filter((row) => new Date(row.starts_at) < dayEnd);

      return {
        today: today.length,
        week: rows.length,
        revenueCents: today.reduce((total, row) => total + (row.price_cents ?? 0), 0),
      };
    },
  });

  const cards = [
    { icon: CalendarDays, label: "Turnos de hoy", value: String(summary.data?.today ?? 0) },
    { icon: CalendarRange, label: "Turnos de la semana", value: String(summary.data?.week ?? 0) },
    {
      icon: Wallet,
      label: "Ingresos estimados del día",
      value: formatCurrency(summary.data?.revenueCents ?? 0),
    },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Un vistazo rápido a tu barbería." />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <card.icon className="size-4" aria-hidden />
                {card.label}
              </CardDescription>
              <CardTitle className="text-2xl">{summary.isLoading ? "—" : card.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Calculado sobre los turnos cargados en la agenda.
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
