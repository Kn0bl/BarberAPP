import { Link, useRouterState } from "@tanstack/react-router";

import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Navegación inferior — mobile first. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const visible = items.filter((item) => item.primary);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 rounded-full border border-border/60 bg-card/80 shadow-raised backdrop-blur-xl md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}>
        {visible.map((item) => {
          const active = isActive(pathname, item.to);
          if (item.featured) {
            return (
              <li key={item.to} className="relative flex justify-center">
                <Link
                  to={item.to}
                  className={cn(
                    "flex -translate-y-3 flex-col items-center gap-1 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full border border-border shadow-md transition-colors",
                      active ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                    )}
                  >
                    <item.icon className="size-6" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          }
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Navegación lateral — tablet y escritorio. */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav aria-label="Navegación principal" className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
