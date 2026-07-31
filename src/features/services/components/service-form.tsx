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
import { serviceSchema, type ServiceValues } from "../api";

interface ServiceFormProps {
  defaultValues?: Partial<ServiceValues>;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: { name: string; priceCents: number }) => void;
}

/** Formulario compartido para crear y editar servicios. */
export function ServiceForm({
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
}: ServiceFormProps) {
  const form = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", price: "", ...defaultValues },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          onSubmit({ name: values.name, priceCents: Math.round(Number(values.price) * 100) }),
        )}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Corte común" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input inputMode="decimal" placeholder="8000" {...field} />
              </FormControl>
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
