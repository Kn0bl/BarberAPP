/**
 * Generación de horarios de la agenda.
 * Los horarios reales viven en `availability` (por barbería y día de semana)
 * y el intervalo de turno en `barbershop_settings.slot_interval_minutes`.
 */

export interface WeekdayWindow {
  /** 0 (domingo) a 6 (sábado) */
  weekday: number;
  /** Minutos desde medianoche */
  startMinutes: number;
  endMinutes: number;
}

export interface DaySlot {
  /** `10:30` — clave estable dentro del día. */
  time: string;
  start: Date;
  end: Date;
}

function getDayWindow(date: Date, availability: WeekdayWindow[]): WeekdayWindow | null {
  return availability.find((window) => window.weekday === date.getDay()) ?? null;
}

export function isOpenDay(date: Date, availability: WeekdayWindow[]): boolean {
  return getDayWindow(date, availability) !== null;
}

export function generateDaySlots(
  date: Date,
  availability: WeekdayWindow[],
  slotMinutes: number,
): DaySlot[] {
  const window = getDayWindow(date, availability);
  if (!window || slotMinutes <= 0) return [];

  const slots: DaySlot[] = [];
  for (let minutes = window.startMinutes; minutes < window.endMinutes; minutes += slotMinutes) {
    const start = new Date(date);
    start.setHours(0, minutes, 0, 0);
    const end = new Date(start.getTime() + slotMinutes * 60_000);

    if (end.getHours() * 60 + end.getMinutes() > window.endMinutes) break;

    slots.push({
      time: `${`${start.getHours()}`.padStart(2, "0")}:${`${start.getMinutes()}`.padStart(2, "0")}`,
      start,
      end,
    });
  }

  return slots;
}

export function dayRange(date: Date) {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

interface BusyRange {
  start: number;
  end: number;
}

/**
 * Horarios en los que se puede iniciar un turno de `durationMinutes`
 * sin superponerse con turnos activos, bloqueos del día, ni pasarse
 * del horario de cierre.
 */
export function getAvailableSlots(
  date: Date,
  durationMinutes: number,
  availability: WeekdayWindow[],
  slotMinutes: number,
  minNoticeMinutes: number,
  agendaDay: {
    appointments: { starts_at: string; ends_at: string; status: string }[];
    blocks: { starts_at: string; ends_at: string }[];
  },
): DaySlot[] {
  const window = getDayWindow(date, availability);
  if (!window) return [];

  const closing = new Date(date);
  closing.setHours(0, window.endMinutes, 0, 0);

  const busy: BusyRange[] = [
    ...agendaDay.appointments
      .filter((appointment) => appointment.status !== "cancelled")
      .map((appointment) => ({
        start: new Date(appointment.starts_at).getTime(),
        end: new Date(appointment.ends_at).getTime(),
      })),
    ...agendaDay.blocks.map((block) => ({
      start: new Date(block.starts_at).getTime(),
      end: new Date(block.ends_at).getTime(),
    })),
  ];

  const earliestBookable = Date.now() + minNoticeMinutes * 60_000;

  return generateDaySlots(date, availability, slotMinutes).filter((slot) => {
    const start = slot.start.getTime();
    const end = start + durationMinutes * 60_000;

    if (end > closing.getTime()) return false;
    if (start < earliestBookable) return false;
    return !busy.some((range) => start < range.end && end > range.start);
  });
}
