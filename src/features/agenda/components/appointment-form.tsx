import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Service } from "@/features/services/api";
import { formatCurrency } from "@/lib/format";
import {
  manualAppointmentSchema,
  PAYMENT_METHODS,
  type ManualAppointmentValues,
} from "../schemas";

interface AppointmentFormProps {
  services: Service[];
  defaultValues?: Partial<ManualAppointmentValues>;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: ManualAppointmentValues, service: Service | undefined) => void;
}

/** Formulario compartido para crear y editar turnos manuales. */
export function AppointmentForm({
  services,
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
}: AppointmentFormProps) {
  const form = useForm<ManualAppointmentValues>({
    resolver: zodResolver(manualAppointmentSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      serviceId: "",
      paymentMethod: "cash",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (!form.getValues("serviceId") && services[0]) {
      form.setValue("serviceId", services[0].id);
    }
  }, [services, form]);

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          onSubmit(
            values,
            services.find((service) => service.id === values.serviceId),
          ),
        )}
      >
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del cliente</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono (opcional)</FormLabel>
              <FormControl>
                <Input inputMode="tel" placeholder="11 5555 5555" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servicio</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí un servicio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} · {formatCurrency(service.price_cents)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de pago</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
