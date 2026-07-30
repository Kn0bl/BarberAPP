import { supabase } from "@/integrations/supabase/client";
import type { AppRole, AuthContext, Profile } from "./types";

/**
 * Resuelve el usuario actual junto a su perfil y rol.
 * Devuelve null cuando no hay sesión activa.
 */
export async function fetchAuthContext(): Promise<AuthContext | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const user = data.user;

  const [profileResult, roleResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  const profile = (profileResult.data as Profile | null) ?? null;
  const roles = (roleResult.data ?? []).map((row) => row.role as AppRole);
  // El rol `owner` nunca se autoasigna: se crea manualmente en la base.
  const role: AppRole = roles.includes("owner") ? "owner" : "customer";

  return {
    user,
    profile,
    role,
    barbershopId: profile?.barbershop_id ?? null,
  };
}

export interface SignUpInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export async function signUpClient({ fullName, phone, email, password }: SignUpInput) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth`,
      data: { full_name: fullName, phone },
    },
  });
  if (error) throw error;
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Envía el email con el enlace para restablecer la contraseña. */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/restablecer`,
  });
  if (error) throw error;
}

/** Define una contraseña nueva para la sesión de recuperación activa. */
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function updateProfile(userId: string, values: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(values).eq("id", userId);
  if (error) throw error;
}
