import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { fetchAuthContext } from "@/features/auth/api";

/**
 * Puerta de sesión. Client-only: la sesión vive en localStorage.
 * Resuelve usuario + perfil + rol una sola vez y lo comparte por contexto.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  staleTime: 5 * 60 * 1000,
  beforeLoad: async () => {
    const auth = await fetchAuthContext();
    if (!auth) throw redirect({ to: "/auth" });
    return { auth };
  },
  component: () => <Outlet />,
});
