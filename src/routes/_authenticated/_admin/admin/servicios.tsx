import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Scissors, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
  type Service,
} from "@/features/services/api";
import { ServiceForm } from "@/features/services/components/service-form";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/_admin/admin/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios — Panel Navaja" },
      { name: "description", content: "Administrá los servicios y precios de tu barbería." },
      { property: "og:title", content: "Servicios — Panel Navaja" },
      { property: "og:description", content: "Administrá los servicios y precios de tu barbería." },
    ],
  }),
  component: AdminServicesPage,
});

type SheetState = { type: "none" } | { type: "create" } | { type: "edit"; service: Service };

function AdminServicesPage() {
  const { auth } = Route.useRouteContext();
  const [sheet, setSheet] = useState<SheetState>({ type: "none" });

  const services = useServices(auth.barbershopId);
  const createService = useCreateService(auth.barbershopId);
  const updateService = useUpdateService(auth.barbershopId);
  const deleteService = useDeleteService(auth.barbershopId);

  const close = () => setSheet({ type: "none" });

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Todos los servicios duran 30 minutos por ahora."
        actions={
          <Button onClick={() => setSheet({ type: "create" })}>
            <Plus className="size-4" aria-hidden />
            Nuevo
          </Button>
        }
      />

      {services.isLoading ? <LoadingState rows={4} /> : null}
      {services.isError ? <ErrorState onRetry={() => services.refetch()} /> : null}

      {services.isSuccess && services.data.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Sin servicios cargados"
          description="Creá tu primer servicio para poder asignarlo a los turnos."
          action={<Button onClick={() => setSheet({ type: "create" })}>Crear servicio</Button>}
        />
      ) : null}

      {services.data && services.data.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {services.data.map((service) => (
            <li key={service.id} className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => setSheet({ type: "edit", service })}
              >
                <p className="truncate text-sm font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(service.price_cents)} · 30 min
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar ${service.name}`}
                disabled={deleteService.isPending}
                onClick={async () => {
                  try {
                    await deleteService.mutateAsync({ id: service.id });
                    toast.success("Servicio eliminado");
                  } catch {
                    toast.error("No pudimos eliminar el servicio");
                  }
                }}
              >
                <Trash2 className="size-4 text-destructive" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <Drawer open={sheet.type !== "none"} onOpenChange={(open) => !open && close()}>
        <DrawerContent className="px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle>
              {sheet.type === "edit" ? "Editar servicio" : "Nuevo servicio"}
            </DrawerTitle>
            <DrawerDescription>Nombre y precio del servicio.</DrawerDescription>
          </DrawerHeader>

          {sheet.type === "create" ? (
            <ServiceForm
              submitLabel="Crear servicio"
              pending={createService.isPending}
              onSubmit={async ({ name, priceCents }) => {
                try {
                  await createService.mutateAsync({ name, priceCents });
                  toast.success("Servicio creado");
                  close();
                } catch {
                  toast.error("No pudimos crear el servicio");
                }
              }}
            />
          ) : null}

          {sheet.type === "edit" ? (
            <ServiceForm
              submitLabel="Guardar cambios"
              pending={updateService.isPending}
              defaultValues={{
                name: sheet.service.name,
                price: String(sheet.service.price_cents / 100),
              }}
              onSubmit={async ({ name, priceCents }) => {
                try {
                  await updateService.mutateAsync({ id: sheet.service.id, name, priceCents });
                  toast.success("Servicio actualizado");
                  close();
                } catch {
                  toast.error("No pudimos actualizar el servicio");
                }
              }}
            />
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  );
}
