import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/api";
import type { AuthContext } from "@/features/auth/types";

function initials(name: string | null | undefined, fallback: string) {
  const source = name?.trim() || fallback;
  return source
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function UserMenu({ auth, profileHref }: { auth: AuthContext; profileHref: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOut();
      navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("No pudimos cerrar la sesión. Intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  const displayName = auth.profile?.full_name || auth.user.email || "Cuenta";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Abrir menú de cuenta">
          <Avatar className="size-8">
            <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">
              {initials(auth.profile?.full_name, auth.user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{displayName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {auth.role === "admin" ? "Administrador" : "Cliente"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: profileHref })}>
          <UserRound className="size-4" aria-hidden />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={pending} onSelect={(event) => {
          event.preventDefault();
          void handleSignOut();
        }}>
          <LogOut className="size-4" aria-hidden />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
