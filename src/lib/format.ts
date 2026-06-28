import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals).replace(".", ",")} %`;
}

export function formatTrend(n: number | null, suffix = ""): string {
  if (n === null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}${suffix}`;
}

export function formatDateDE(iso: string): string {
  return format(parseISO(iso), "dd.MM.yyyy", { locale: de });
}
