import { z } from "zod";

export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
] as const;

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Realizado",
  cancelled: "Cancelado",
  no_show: "No asistió",
};

export function paymentLabel(value: string | null | undefined) {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label ?? "—";
}

export const manualAppointmentSchema = z.object({
  clientName: z.string().trim().min(2, "Ingresá el nombre del cliente"),
  clientPhone: z.string().trim().max(30, "Teléfono demasiado largo").optional().or(z.literal("")),
  serviceId: z.string().min(1, "Elegí un servicio"),
  paymentMethod: z.enum(["cash", "transfer"]),
});

export type ManualAppointmentValues = z.infer<typeof manualAppointmentSchema>;
