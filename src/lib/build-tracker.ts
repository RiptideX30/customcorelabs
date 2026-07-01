/**
 * Build Tracker — shared types, status enum, and utility functions
 * for the Custom Core Labs client portal.
 */

/** Possible build statuses in order of progression */
export const BUILD_STATUSES = ["received", "in-progress", "completed"] as const;

export type BuildStatus = (typeof BUILD_STATUSES)[number];

/** Human-readable labels for each status */
export const STATUS_LABELS: Record<BuildStatus, string> = {
  received: "Received",
  "in-progress": "In Progress",
  completed: "Completed",
};

/** Emoji/icon indicators per status */
export const STATUS_ICONS: Record<BuildStatus, string> = {
  received: "📦",
  "in-progress": "⚡",
  completed: "✅",
};

/** Color classes for status badges */
export const STATUS_COLORS: Record<BuildStatus, string> = {
  received: "bg-zinc-100 text-zinc-500 border-zinc-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

/** A single timeline entry recording a status change */
export interface TimelineEntry {
  status: string;
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
