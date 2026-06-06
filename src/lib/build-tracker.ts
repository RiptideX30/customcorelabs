/**
 * Build Tracker — shared types, status enum, and utility functions
 * for the Custom Core Labs client portal.
 */

/** Possible build statuses in order of progression */
export const BUILD_STATUSES = [
  "received",
  "assembling",
  "cabling",
  "testing",
  "ready",
  "picked-up",
] as const;

export type BuildStatus = (typeof BUILD_STATUSES)[number];

/** Human-readable labels for each status */
export const STATUS_LABELS: Record<BuildStatus, string> = {
  received: "Parts Received",
  assembling: "Assembling",
  cabling: "Cable Routing",
  testing: "Stress Test",
  ready: "Ready for Pickup",
  "picked-up": "Picked Up",
};

/** Emoji/icon indicators per status */
export const STATUS_ICONS: Record<BuildStatus, string> = {
  received: "📦",
  assembling: "🔧",
  cabling: "🔌",
  testing: "⚡",
  ready: "✅",
  "picked-up": "🏁",
};

/** Color classes for status badges */
export const STATUS_COLORS: Record<BuildStatus, string> = {
  received: "bg-blue-100 text-blue-800 border-blue-200",
  assembling: "bg-indigo-100 text-indigo-800 border-indigo-200",
  cabling: "bg-violet-100 text-violet-800 border-violet-200",
  testing: "bg-amber-100 text-amber-800 border-amber-200",
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "picked-up": "bg-zinc-100 text-zinc-500 border-zinc-200",
};

/** A single timeline entry recording a status change */
export interface TimelineEntry {
  status: BuildStatus;
  timestamp: string; // ISO 8601
  note?: string;
}

/** Full build record stored in KV */
export interface BuildRecord {
  trackingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  services: string[];
  status: BuildStatus;
  timeline: TimelineEntry[];
  dropoffDate: string; // ISO date
  pickupCode: string; // 4-digit verification
  partsValue?: string;
  /** Estimated subtotal (labor) sent from form */
  estimateSubtotal?: string;
  /** Tax amount (string, e.g. "$12.34") */
  taxAmount?: string;
  /** Total including tax (string) */
  totalWithTax?: string;
  notes?: string;
  createdAt: string; // ISO 8601
}

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Validation: is a string a valid status */
export function isValidStatus(s: string): s is BuildStatus {
  return BUILD_STATUSES.includes(s as BuildStatus);
}

/** Generate a short, human-friendly tracking code: CCL-A7F3 */
export function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion
  let code = "CCL-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Generate a 4-digit pickup verification code */
export function generatePickupCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Get the next valid status in the progression (or null if already terminal) */
export function nextStatus(current: BuildStatus): BuildStatus | null {
  const idx = BUILD_STATUSES.indexOf(current);
  if (idx === -1 || idx >= BUILD_STATUSES.length - 1) return null;
  return BUILD_STATUSES[idx + 1];
}

/** Get all statuses up to and including the current one */
export function statusHistory(
  current: BuildStatus,
): { status: BuildStatus; label: string; icon: string; reached: boolean }[] {
  const idx = BUILD_STATUSES.indexOf(current);
  return BUILD_STATUSES.map((s, i) => ({
    status: s,
    label: STATUS_LABELS[s],
    icon: STATUS_ICONS[s],
    reached: i <= idx,
  }));
}

/** KV key prefix for build records */
export const KV_KEY_PREFIX = "build:";
export function kvKey(code: string): string {
  return `${KV_KEY_PREFIX}${code}`;
}
