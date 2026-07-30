import type { Session, User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

/** Roles del sistema. Solo `owner` administra; se asigna manualmente. */
export type AppRole = "owner" | "customer";

export type Profile = Tables<"profiles">;
export type Barbershop = Tables<"barbershops">;

/** Contexto de sesión resuelto una sola vez y compartido vía router context. */
export interface AuthContext {
  user: User;
  profile: Profile | null;
  role: AppRole;
  barbershopId: string | null;
}

export type MaybeSession = Session | null;
