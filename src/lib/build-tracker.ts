export const BUILD_STATUSES = [
  "received",
  "assessing",
  "parts-ordered",
  "in-progress",
  "quality-control",
  "ready-for-pickup",
  "picked-up",
  "abandoned",
] as const;

export type BuildStatus = (typeof BUILD_STATUSES)[number];

export const STATUS_LABELS: Record<BuildStatus, string> = {
  received: "Received",
  assessing: "Assessing",
  "parts-ordered": "Parts Ordered",
  "in-progress": "In Progress",
  "quality-control": "Quality Control",
  "ready-for-pickup": "Ready for Pickup",
  "picked-up": "Picked Up",
  abandoned: "Abandoned",
};

export interface TimelineEvent {
  status: BuildStatus;
  timestamp: string;
  note?: string;
}

export interface BuildRecord {
  trackingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  services: string[];
  status: BuildStatus;
  timeline: TimelineEvent[];
  dropoffDate: string;
  partsValue: string;
  estimateSubtotal: string;
  taxAmount: string;
  totalWithTax: string;
  notes: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const KV_KEY_PREFIX = "build:";
export const kvKey = (trackingCode: string) => `${KV_KEY_PREFIX}${trackingCode}`;

export function isValidStatus(status: string): status is BuildStatus {
  return BUILD_STATUSES.includes(status as BuildStatus);
}

export function generateTrackingCode(length = 6): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
