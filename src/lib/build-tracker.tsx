import type { ReactNode } from "react";
import { CheckCircle, XCircle, Loader2, FileText, Ban } from "lucide-react";

export type BuildStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "failed"
  | "cancelled";

export type BuildTimelineEvent = {
  status: string;
  timestamp: string;
};

export type Build = {
  trackingCode: string;
  customerName: string;
  services: string[];
  status: BuildStatus;
  timeline: BuildTimelineEvent[];
  createdAt: string;
};

export const STATUS_LABELS: Record<BuildStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<BuildStatus, string> = {
  pending: "bg-slate-200 text-slate-800",
  "in-progress": "bg-blue-200 text-blue-800",
  completed: "bg-green-200 text-green-800",
  failed: "bg-red-200 text-red-800",
  cancelled: "bg-gray-200 text-gray-800",
};

export const STATUS_ICONS: Record<BuildStatus, ReactNode> = {
  pending: <FileText size={14} />,
  "in-progress": <Loader2 size={14} className="animate-spin" />,
  completed: <CheckCircle size={14} />,
  failed: <XCircle size={14} />,
  cancelled: <Ban size={14} />,
};
