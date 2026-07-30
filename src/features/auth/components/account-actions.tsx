import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignOut } from "@/features/auth/use-sign-out";

/** Acciones de cuenta reutilizables en el perfil de cliente y de administrador. */
export function AccountActions() {
  const { signOut, pending } = useSignOut();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sesión</CardTitle>
        <CardDescription>Cerrá la sesión en este dispositivo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" disabled={pending} onClick={() => void signOut()}>
          <LogOut className="size-4" aria-hidden />
          {pending ? "Cerrando sesión…" : "Cerrar sesión"}
        </Button>
      </CardContent>
    </Card>
  );
}
