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
