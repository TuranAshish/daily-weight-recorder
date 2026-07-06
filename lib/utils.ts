import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKg(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)} kg`;
}

export function formatChange(value: number) {
  if (value === 0) return "0 kg";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(Math.abs(value) % 1 === 0 ? 0 : 1)} kg`;
}

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}
