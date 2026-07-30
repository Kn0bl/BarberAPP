import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CalendarPlus,
  Home,
  Scissors,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import type { AppRole } from "@/features/auth/types";

export interface NavItem {
  /** Ruta destino (TanStack Router path). */
  to: string;
  label: string;
  icon: LucideIcon;
  /** Se muestra en la barra inferior móvil. */
  primary?: boolean;
}

export const CLIENT_NAV: NavItem[] = [
  { to: "/inicio", label: "Inicio", icon: Home, primary: true },
  { to: "/reservar", label: "Reservar", icon: CalendarPlus, primary: true },
  { to: "/mis-turnos", label: "Mis turnos", icon: CalendarDays, primary: true },
  { to: "/perfil", label: "Perfil", icon: UserRound, primary: true },
];

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin/agenda", label: "Agenda", icon: CalendarDays, primary: true },
  { to: "/admin/clientes", label: "Clientes", icon: Users, primary: true },
  { to: "/admin/servicios", label: "Servicios", icon: Scissors, primary: true },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings, primary: true },
  { to: "/admin/perfil", label: "Perfil", icon: UserRound },
];

export function navForRole(role: AppRole): NavItem[] {
  return role === "admin" ? ADMIN_NAV : CLIENT_NAV;
}

export function homeForRole(role: AppRole): string {
  return role === "admin" ? "/admin/agenda" : "/inicio";
}
