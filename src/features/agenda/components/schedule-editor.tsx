import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBarbershopSchedule, useUpdateAvailability } from "@/features/agenda/api";
import type { WeekdayWindow } from "@/features/agenda/slots";

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

interface DayRow {
  enabled: boolean;
  start: string;
  end: string;
}

type DayRows = Record<number, DayRow>;

function minutesToInputValue(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function inputValueToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function buildInitialRows(availability: WeekdayWindow[]): DayRows {
  const rows: DayRows = {};
  for (const day of WEEKDAYS) {
    const window = availability.find((w) => w.weekday === day.value);
    rows[day.value] = window
      ? {
          enabled: true,
          start: minutesToInputValue(window.startMinutes),
          end: minutesToInputValue(window.endMinutes),
        }
      : { enabled: false, start: "09:00", end: "19:00" };
  }
  return rows;
}

export function ScheduleEditor({ barbershopId }: { barbershopId: string | null }) {
  const schedule = useBarbershopSchedule(barbershopId);
  const updateAvailability = useUpdateAvailability(barbershopId);
  const [rows, setRows] = useState<DayRows | null>(null);

  useEffect(() => {
    if (schedule.data) {
      setRows(buildInitialRows(schedule.data.availability));
    }
  }, [schedule.data]);

  if (schedule.isLoading || !rows) return <LoadingState rows={3} />;

  const currentRows = rows;

  const hasInvalidRange = WEEKDAYS.some(
    (day) => currentRows[day.value].enabled && currentRows[day.value].start >= currentRows[day.value].end,
  );

  function updateRow(weekday: number, patch: Partial<DayRow>) {
    setRows((current) =>
      current ? { ...current, [weekday]: { ...current[weekday], ...patch } } : current,
    );
  }

  async function handleSave() {
    const windows: WeekdayWindow[] = WEEKDAYS.filter((day) => currentRows[day.value].enabled).map(
      (day) => ({
        weekday: day.value,
        startMinutes: inputValueToMinutes(currentRows[day.value].start),
        endMinutes: inputValueToMinutes(currentRows[day.value].end),
      }),
    );

    try {
      await updateAvailability.mutateAsync(windows);
      toast.success("Horarios actualizados");
    } catch {
      toast.error("No pudimos guardar los horarios");
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {WEEKDAYS.map((day) => {
          const row = currentRows[day.value];
          return (
            <div
              key={day.value}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
            >
              <Switch
                checked={row.enabled}
                onCheckedChange={(checked) => updateRow(day.value, { enabled: checked })}
                aria-label={day.label}
              />
              <span className="w-24 text-sm font-medium">{day.label}</span>
              {row.enabled ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={row.start}
                    onChange={(event) => updateRow(day.value, { start: event.target.value })}
                    className="w-auto"
                  />
                  <span className="text-xs text-muted-foreground">a</span>
                  <Input
                    type="time"
                    value={row.end}
                    onChange={(event) => updateRow(day.value, { end: event.target.value })}
                    className="w-auto"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>

      {hasInvalidRange && (
        <p className="text-sm text-destructive">
          El horario de cierre debe ser posterior al de apertura.
        </p>
      )}

      <Button
        type="button"
        onClick={handleSave}
        disabled={hasInvalidRange || updateAvailability.isPending}
      >
        {updateAvailability.isPending ? "Guardando..." : "Guardar horarios"}
      </Button>
    </div>
  );
}
