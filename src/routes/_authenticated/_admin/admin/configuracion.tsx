import { createFileRoute } from "@tanstack/react-router";
import { Building2, Clock, UserRound, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    icon: Clock,
    title: "Horarios",
    description: "Hoy la agenda funciona de lunes a sábado, de 10:00 a 19:00, cada 30 minutos.",
  },
  {
    icon: Building2,
    title: "Barbería",
    description: "Nombre, dirección y datos de contacto que ven tus clientes.",
  },
  {
    icon: UserRound,
    title: "Cuenta",
    description: "Tus datos personales y preferencias de sesión.",
  },
];

function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Configuración" description="Ajustes de la barbería y de tu cuenta." />

      <div className="space-y-3">
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
