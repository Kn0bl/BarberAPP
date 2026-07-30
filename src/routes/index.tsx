import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock3, Sparkles } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Navaja — Reservá tu turno en la barbería" },
      {
        name: "description",
        content:
          "Reservá tu corte online en segundos y dejá que la barbería gestione su agenda desde un solo lugar.",
      },
      { property: "og:title", content: "Navaja — Reservá tu turno en la barbería" },
      {
        property: "og:description",
        content:
          "Reservá tu corte online en segundos y dejá que la barbería gestione su agenda desde un solo lugar.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Reservas simples",
    description: "Elegí servicio, día y horario disponible en pocos toques.",
  },
  {
    icon: Clock3,
    title: "Agenda al día",
    description: "La barbería ve sus turnos, bloqueos y disponibilidad en tiempo real.",
  },
  {
    icon: Sparkles,
    title: "Sin llamadas",
    description: "Confirmaciones automáticas y todo el historial en tu perfil.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/auth">Ingresar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5">
        <section className="py-16 md:py-28">
          <p className="text-sm font-medium text-primary">Gestión de barberías</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            Reservá tu turno en segundos, sin llamadas ni esperas.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Una plataforma clara para clientes y una agenda ordenada para la barbería.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Crear cuenta</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 border-t border-border py-14 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="space-y-2">
              <feature.icon className="size-5 text-primary" aria-hidden />
              <h2 className="text-base font-semibold text-foreground">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 py-10 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Navaja. Todos los derechos reservados.
      </footer>
    </div>
  );
}
