import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, Search, Users } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useClients, type ClientListItem } from "@/features/clients/api";

function whatsappHref(client: ClientListItem) {
  const firstName = client.fullName.trim().split(/\s+/)[0] ?? "";
  const message = `¡Hola ${firstName}! Hace un tiempo que no te vemos por la barbería 💈 ¿Querés reservar tu próximo corte?`;
  return `https://wa.me/${(client.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export const Route = createFileRoute("/_authenticated/_admin/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Panel Navaja" },
      { name: "description", content: "Listado de clientes de la barbería con su historial de turnos." },
      { property: "og:title", content: "Clientes — Panel Navaja" },
      { property: "og:description", content: "Listado de clientes de la barbería con su historial de turnos." },
    ],
  }),
  component: AdminClientsPage,
});

function AdminClientsPage() {
  const { auth } = Route.useRouteContext();
  const [term, setTerm] = useState("");
  const clients = useClients(auth.barbershopId);

  const filtered = useMemo(() => {
    const query = term.trim().toLowerCase();
    const list = clients.data ?? [];
    if (!query) return list;
    return list.filter(
      (client) =>
        client.fullName.toLowerCase().includes(query) ||
        (client.phone ?? "").toLowerCase().includes(query),
    );
  }, [clients.data, term]);

  return (
    <>
      <PageHeader title="Clientes" description="Todas las personas registradas en tu barbería." />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre o teléfono"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          aria-label="Buscar clientes"
        />
      </div>

      {clients.isLoading ? <LoadingState rows={4} /> : null}
      {clients.isError ? <ErrorState onRetry={() => clients.refetch()} /> : null}

      {clients.isSuccess && filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={term ? "Sin resultados" : "Todavía no hay clientes"}
          description={
            term
              ? "Probá con otro nombre o teléfono."
              : "Cada persona que se registre en la app va a aparecer en esta lista."
          }
        />
      ) : null}

      {filtered.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((client) => (
            <li key={client.id} className="flex items-start gap-4 px-4 py-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{client.fullName}</p>
                  {!client.hasAccount ? (
                    <Badge variant="outline" className="text-[10px]">
                      Sin cuenta
                    </Badge>
                  ) : null}
                  {client.isOverdue ? (
                    <Badge variant="destructive" className="text-[10px]">
                      Atrasado
                    </Badge>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {client.phone ?? "Sin teléfono"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {client.daysSinceLastVisit !== null
                    ? `Último corte: hace ${client.daysSinceLastVisit} días${
                        client.typicalGapDays !== null
                          ? ` (suele venir cada ~${client.typicalGapDays} días)`
                          : ""
                      }`
                    : "Sin cortes registrados"}
                </p>
                {client.phone ? (
                  <a
                    href={whatsappHref(client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-primary hover:underline"
                  >
                    <MessageCircle className="size-3.5" aria-hidden />
                    Contactar
                  </a>
                ) : null}
              </div>
              <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
                {client.visits} {client.visits === 1 ? "visita" : "visitas"}
              </span>
            </li>

          ))}
        </ul>
      ) : null}
    </>
  );
}
