import { ReportKind, Role } from "@/backend";

const SINHALA_MONTHS = [
  "ජනවාරි",
  "පෙබරවාරි",
  "මාර්තු",
  "අප්‍රේල්",
  "මැයි",
  "ජූනි",
  "ජූලි",
  "අගෝස්තු",
  "සැප්තැම්බර්",
  "ඔක්තෝබර්",
  "නොවැම්බර්",
  "දෙසැම්බර්",
];

const SINHALA_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Convert Western digits in a string to Sinhala numerals. */
export function toSinhalaDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => SINHALA_DIGITS[Number(digit)]);
}

/** Format a whole-rupee amount as `රු. 1,250`. */
export function formatCurrency(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "රු. 0";
  return `රු. ${Math.round(value).toLocaleString("en-US")}`;
}

/** Format a kilogram quantity with up to two decimals. */
export function formatKg(kg: bigint | number): string {
  const value = typeof kg === "bigint" ? Number(kg) : kg;
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** Format a count as a plain grouped integer. */
export function formatCount(count: bigint | number): string {
  const value = typeof count === "bigint" ? Number(count) : count;
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-US");
}

/** Parse a `YYYY-MM-DD` date text into a local Date, or null when invalid. */
export function parseDateText(dateText: string): Date | null {
  if (!dateText) return null;
  const parts = dateText.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    const fallback = new Date(dateText);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a `YYYY-MM-DD` date text as `2026 ජූනි 25`. */
export function formatDate(dateText: string): string {
  const date = parseDateText(dateText);
  if (!date) return dateText || "—";
  return `${date.getFullYear()} ${SINHALA_MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Format a `YYYY-MM-DD` date text as a short `25/06` label. */
export function formatShortDate(dateText: string): string {
  const date = parseDateText(dateText);
  if (!date) return dateText || "—";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}/${month}`;
}

/** Today's date as a `YYYY-MM-DD` string in local time. */
export function todayDateText(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Convert a Motoko nanosecond timestamp into a local Date, or null. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a Motoko nanosecond timestamp as a readable Sinhala date. */
export function formatTimestamp(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()} ${SINHALA_MONTHS[date.getMonth()]} ${day}/${month}`;
}

const ROLE_LABELS: Record<Role, string> = {
  [Role.admin]: "පරිපාලක",
  [Role.officer]: "නිලධාරී",
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? "නිලධාරී";
}

const REPORT_KIND_LABELS: Record<ReportKind, string> = {
  [ReportKind.daily]: "දෛනික",
  [ReportKind.weekly]: "සතිපතා",
  [ReportKind.monthly]: "මාසික",
  [ReportKind.byProduct]: "නිෂ්පාදන අනුව",
  [ReportKind.byFarmer]: "ගොවි අනුව",
  [ReportKind.byOfficer]: "නිලධාරී අනුව",
};

export function reportKindLabel(kind: ReportKind): string {
  return REPORT_KIND_LABELS[kind] ?? "වාර්තාව";
}
