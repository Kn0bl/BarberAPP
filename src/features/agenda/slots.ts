/**
 * Generación de horarios de la agenda.
 * Fase 1: fijo (lunes a sábado, 10:00 a 19:00, cada 30 minutos).
 * La configuración por barbería llega en un sprint posterior.
 */
export const OPEN_HOUR = 10;
export const CLOSE_HOUR = 19;
export const SLOT_MINUTES = 30;

export interface DaySlot {
  /** `10:30` — clave estable dentro del día. */
  time: string;
  start: Date;
  end: Date;
}

/** Domingo (0) cerrado. */
export function isOpenDay(date: Date) {
  return date.getDay() !== 0;
}

export function generateDaySlots(date: Date): DaySlot[] {
  if (!isOpenDay(date)) return [];

  const slots: DaySlot[] = [];
  const total = ((CLOSE_HOUR - OPEN_HOUR) * 60) / SLOT_MINUTES;

  for (let index = 0; index <= total; index += 1) {
    const start = new Date(date);
    start.setHours(OPEN_HOUR, index * SLOT_MINUTES, 0, 0);
    if (start.getHours() > CLOSE_HOUR) break;

    const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);
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
 * sin superponerse con turnos activos ni bloqueos del día.
 */
export function getAvailableSlots(
  date: Date,
  durationMinutes: number,
  agendaDay: {
    appointments: { starts_at: string; ends_at: string; status: string }[];
    blocks: { starts_at: string; ends_at: string }[];
  },
): DaySlot[] {
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

  const now = Date.now();
  const isToday = new Date().toDateString() === date.toDateString();

  return generateDaySlots(date).filter((slot) => {
    const start = slot.start.getTime();
    const end = start + durationMinutes * 60_000;

    if (isToday && start <= now) return false;
    return !busy.some((range) => start < range.end && end > range.start);
  });
}
