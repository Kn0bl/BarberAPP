import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { BottomNav, SidebarNav } from "@/components/layout/nav";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import type { NavItem } from "@/config/navigation";
import type { AuthContext } from "@/features/auth/types";

interface AppShellProps {
  auth: AuthContext;
  items: NavItem[];
  homeHref: string;
  profileHref: string;
  children: ReactNode;
}

/**
 * Layout único para cliente y administrador.
 * Mobile: barra inferior. Tablet/desktop: sidebar fija.
 */
export function AppShell({ auth, items, homeHref, profileHref, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background" style={{ backgroundImage: "linear-gradient(color-mix(in oklch, var(--color-foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--color-foreground) 6%, transparent) 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
        <div className="absolute -top-32 -right-24 size-96 rounded-full bg-primary/35 blur-[100px]" />
        <div className="absolute bottom-0 -left-24 size-96 rounded-full bg-chart-4/30 blur-[100px]" />
      </div>

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border/60 bg-sidebar/90 px-4 py-6 backdrop-blur-xl md:flex">
        <Link to={homeHref} className="mb-8 px-1">
          <Logo />
        </Link>
        <SidebarNav items={items} />
        <div className="mt-auto px-1 text-xs text-muted-foreground">
          {auth.role === "owner" ? "Panel de administración" : "Cuenta de cliente"}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-5">
            <Link to={homeHref} className="md:hidden">
              <Logo />
            </Link>
            <div className="hidden md:block" />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <UserMenu auth={auth} profileHref={profileHref} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
          <div className="mx-auto w-full max-w-4xl space-y-6">{children}</div>
        </main>
      </div>

      <BottomNav items={items} />
    </div>
  );
}
