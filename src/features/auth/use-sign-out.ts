import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { signOut } from "./api";

/** Cierre de sesión con limpieza de caché, compartido por el menú y el perfil. */
export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOut();
      await navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("No pudimos cerrar la sesión. Intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return { signOut: handleSignOut, pending };
}
