import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined, currency = "INR"): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(d);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

export function parseNumeric(value: string | null | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const cleaned = value.replace(/[₹$€£,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    GROCERY: "Grocery / Kirana",
    MEDICAL: "Medical / Pharmacy",
    RESTAURANT: "Restaurant / Cafe",
    GARMENTS: "Garments / Fashion",
    RETAIL: "General Retail",
    CUSTOM: "Custom",
    grocery: "Grocery / Kirana",
    medical: "Medical / Pharmacy",
    restaurant: "Restaurant / Cafe",
    garments: "Garments / Fashion",
    retail: "General Retail",
    unknown: "Unknown / Custom",
  };
  return labels[category] ?? category;
}

export function categoryColor(category: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    GROCERY: { bg: "bg-[--cat-grocery-accent]", text: "text-[--cat-grocery-text]", border: "border-[--cat-grocery-secondary]" },
    MEDICAL: { bg: "bg-[--cat-medical-accent]", text: "text-[--cat-medical-text]", border: "border-[--cat-medical-secondary]" },
    RESTAURANT: { bg: "bg-[--cat-restaurant-accent]", text: "text-[--cat-restaurant-text]", border: "border-[--cat-restaurant-secondary]" },
    GARMENTS: { bg: "bg-[--cat-garments-accent]", text: "text-[--cat-garments-text]", border: "border-[--cat-garments-secondary]" },
    RETAIL: { bg: "bg-[--cat-retail-accent]", text: "text-[--cat-retail-text]", border: "border-[--cat-retail-secondary]" },
  };
  return colors[category] ?? colors.RETAIL;
}
