import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/features/auth/api";
import { profileSchema, type ProfileValues } from "@/features/auth/schemas";
import type { AuthContext } from "@/features/auth/types";

export function ProfileForm({ auth }: { auth: AuthContext }) {
  const router = useRouter();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: auth.profile?.full_name ?? "",
      phone: auth.profile?.phone ?? "",
    },
  });

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile(auth.user.id, {
        full_name: values.fullName,
        phone: values.phone,
      });
      toast.success("Perfil actualizado");
      router.invalidate();
      form.reset(values);
    } catch {
      toast.error("No pudimos guardar los cambios");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos personales</CardTitle>
        <CardDescription>Mantené tus datos de contacto actualizados.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
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
                    <Input type="tel" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={auth.user.email ?? ""} readOnly disabled />
              <p className="text-sm text-muted-foreground">
                El email no se puede modificar por ahora.
              </p>
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {form.formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
