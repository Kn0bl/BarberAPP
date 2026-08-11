import { createFileRoute } from "@tanstack/react-router";
import { Building2, Clock, UserRound, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleEditor } from "@/features/agenda/components/schedule-editor";
import { BarbershopForm } from "@/features/barbershop/components/barbershop-form";

export const Route = createFileRoute("/_authenticated/_admin/admin/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — Panel Navaja" },
      { name: "description", content: "Horarios de atención, datos de la barbería y cuenta." },
      { property: "og:title", content: "Configuración — Panel Navaja" },
      { property: "og:description", content: "Horarios de atención, datos de la barbería y cuenta." },
    ],
  }),
  component: AdminSettingsPage,
});

const SECTIONS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: UserRound,
    title: "Cuenta",
    description: "Tus datos personales y preferencias de sesión.",
  },
];

function AdminSettingsPage() {
  const { auth } = Route.useRouteContext();

  return (
    <>
      <PageHeader title="Configuración" description="Ajustes de la barbería y de tu cuenta." />

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-primary" aria-hidden />
              Horarios
            </CardTitle>
            <CardDescription>
              Definí los días y horarios en que atiende tu barbería.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleEditor barbershopId={auth.barbershopId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" aria-hidden />
              Barbería
            </CardTitle>
            <CardDescription>
              Nombre, dirección y datos de contacto que ven tus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarbershopForm barbershopId={auth.barbershopId} />
          </CardContent>
        </Card>

        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <section.icon className="size-4 text-primary" aria-hidden />
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
              <p className="pt-1 text-xs text-muted-foreground">Próximamente editable.</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}

