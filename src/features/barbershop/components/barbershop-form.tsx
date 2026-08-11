import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/common/loading-state";
import { useBarbershop, useUpdateBarbershop } from "@/features/barbershop/api";

const barbershopSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre de la barbería"),
  phone: z.string().trim().max(30, "Teléfono demasiado largo").optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  address: z.string().trim().max(200, "Dirección demasiado larga").optional().or(z.literal("")),
});

type BarbershopValues = z.infer<typeof barbershopSchema>;

export function BarbershopForm({ barbershopId }: { barbershopId: string | null }) {
  const barbershop = useBarbershop(barbershopId);
  const updateBarbershop = useUpdateBarbershop(barbershopId);

  const form = useForm<BarbershopValues>({
    resolver: zodResolver(barbershopSchema),
    defaultValues: { name: "", phone: "", email: "", address: "" },
  });

  useEffect(() => {
    if (barbershop.data) {
      form.reset({
        name: barbershop.data.name ?? "",
        phone: barbershop.data.phone ?? "",
        email: barbershop.data.email ?? "",
        address: barbershop.data.address ?? "",
      });
    }
  }, [barbershop.data, form]);

  if (barbershop.isLoading) return <LoadingState rows={2} />;

  async function onSubmit(values: BarbershopValues) {
    try {
      await updateBarbershop.mutateAsync({
        name: values.name,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
      });
      toast.success("Datos de la barbería actualizados");
      form.reset(values);
    } catch {
      toast.error("No pudimos guardar los cambios");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateBarbershop.isPending || !form.formState.isDirty}>
          {updateBarbershop.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Form>
  );
}
