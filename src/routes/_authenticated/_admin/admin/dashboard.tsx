import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarCheck, CircleSlash, Users2, Wallet } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useClients } from "@/features/clients/api";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/_admin/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Panel Navaja" },
      { name: "description", content: "Métricas completas de turnos, ingresos y clientes de la barbería." },
      { property: "og:title", content: "Dashboard — Panel Navaja" },
      { property: "og:description", content: "Métricas completas de turnos, ingresos y clientes de la barbería." },
    ],
  }),
  component: AdminDashboardPage,
});

const DAYS_OF_HISTORY = 35;
const CHART_DAYS = 14;

interface AppointmentRow {
  starts_at: string;
  price_cents: number | null;
  status: string;
  service: { name: string } | null;
}

function shortDay(date: Date) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" }).format(date);
}

function AdminDashboardPage() {
  const { auth } = Route.useRouteContext();
  const clients = useClients(auth.barbershopId);

  const summary = useQuery({
    queryKey: ["dashboard", auth.barbershopId ?? "none"],
    enabled: Boolean(auth.barbershopId),
    queryFn: async () => {
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - (DAYS_OF_HISTORY - 1));

      const { data, error } = await supabase
        .from("appointments")
        .select("starts_at, price_cents, status, service:services(name)")
        .eq("barbershop_id", auth.barbershopId as string)
        .gte("starts_at", from.toISOString());
      if (error) throw error;

      return (data ?? []) as AppointmentRow[];
    },
  });

  const stats = useMemo(() => {
    const rows = summary.data ?? [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthRows = rows.filter((row) => new Date(row.starts_at) >= monthStart);
    const monthCompleted = monthRows.filter((row) => row.status === "completed");
    const monthRevenueCents = monthCompleted.reduce((total, row) => total + (row.price_cents ?? 0), 0);

    const dueRows = monthRows.filter((row) => new Date(row.starts_at) <= now);
    const dueLost = dueRows.filter((row) => row.status === "cancelled" || row.status === "no_show");
    const cancelRate = dueRows.length > 0 ? Math.round((dueLost.length / dueRows.length) * 100) : 0;

    const dailyRevenue: { label: string; total: number }[] = [];
    for (let i = CHART_DAYS - 1; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const total = rows
        .filter((row) => row.status === "completed")
        .filter((row) => {
          const date = new Date(row.starts_at);
          return date >= day && date < nextDay;
        })
        .reduce((sum, row) => sum + (row.price_cents ?? 0), 0);

      dailyRevenue.push({ label: shortDay(day), total: total / 100 });
    }

    return {
      monthRevenueCents,
      monthCompletedCount: monthCompleted.length,
      cancelRate,
      dailyRevenue,
    };
  }, [summary.data]);

  const isLoading = summary.isLoading || clients.isLoading;
  const overdueCount = clients.data?.filter((client) => client.isOverdue).length ?? 0;

  const cards: { icon: typeof Wallet; label: string; value: string; href?: string }[] = [
    { icon: Wallet, label: "Ingresos del mes", value: formatCurrency(stats.monthRevenueCents) },
    { icon: CalendarCheck, label: "Turnos realizados este mes", value: String(stats.monthCompletedCount) },
    { icon: CircleSlash, label: "Cancelaciones / no-show", value: `${stats.cancelRate}%` },
    { icon: Users2, label: "Clientes atrasados", value: String(overdueCount), href: "/admin/clientes" },
  ];

  const revenueConfig = {
    total: { label: "Ingresos", color: "var(--chart-1)" },
  } satisfies ChartConfig;


  return (
    <>
      <PageHeader title="Dashboard" description="Métricas completas de tu barbería." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const body = (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <card.icon className="size-4" aria-hidden />
                  {card.label}
                </CardDescription>
                <CardTitle className="text-2xl">{isLoading ? "—" : card.value}</CardTitle>
              </CardHeader>
            </Card>
          );

          return card.href ? (
            <Link key={card.label} to={card.href} className="block transition-opacity hover:opacity-90">
              {body}
            </Link>
          ) : (
            <div key={card.label}>{body}</div>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Ingresos por día</CardTitle>
          <CardDescription>Últimos 14 días, sobre turnos marcados como realizados.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Cargando…
            </div>
          ) : (
            <ChartContainer config={revenueConfig} className="h-64 w-full">
              <BarChart data={stats.dailyRevenue}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}
