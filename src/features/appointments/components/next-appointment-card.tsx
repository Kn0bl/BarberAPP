import { Link } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Resumen mínimo del próximo turno. La lógica de reservas llega en el próximo sprint. */
export interface NextAppointmentSummary {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  status: string;
}

export function NextAppointmentCard({
  appointment,
}: {
  appointment: NextAppointmentSummary | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="size-4 text-primary" aria-hidden />
          Próximo turno
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointment ? (
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Fecha</dt>
                <dd className="text-sm font-medium text-foreground">{appointment.date}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Hora</dt>
                <dd className="text-sm font-medium text-foreground">{appointment.time}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Servicio</dt>
                <dd className="text-sm font-medium text-foreground">{appointment.serviceName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Estado</dt>
                <dd>
                  <Badge variant="secondary">{appointment.status}</Badge>
                </dd>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm">
              <Link to="/mis-turnos">Ver detalles</Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tenés ningún turno reservado.</p>
        )}
      </CardContent>
    </Card>
  );
}
