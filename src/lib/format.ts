import { DEFAULT_LOCALE } from "@/config/app";

/** Formatea centavos a moneda local. */
export function formatCurrency(cents: number, currency = "ARS") {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

/** `2026-07-31` a partir de un Date local (sin desplazamiento UTC). */
export function toDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Date local a partir de una clave `YYYY-MM-DD`. */
export function fromDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}
