import { Scissors } from "lucide-react";
import { APP_NAME } from "@/config/app";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showName = true,
}: {
  className?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Scissors className="size-4" aria-hidden />
      </span>
      {showName ? (
        <span className="font-display text-base font-semibold tracking-tight">{APP_NAME}</span>
      ) : null}
    </span>
  );
}
