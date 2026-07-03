
import {
  CheckCircle2,
  Circle,
  PackageCheck,
  ShieldCheck,
  Wrench,
  Loader2,
  Package,
  Search,
  Gauge,
  Cog,
  Zap,
  Thermometer,
} from "lucide-react";

export type BuildStatus =
  | "received"
  | "parts_ordered"
  | "parts_received"
  | "assembly"
  | "validation"
  | "ready_for_pickup"
  | "completed"
  | "diagnosis"
  | "repairing"
  | "profiling"
  | "modification"
  | "benchmarking"
  | "thermal_testing";

export type Build = {
  trackingCode: string;
  customerName: string;
  services: string[];
  status: BuildStatus;
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
};

export const STATUS_LABELS: Record<string, string> = {
  received: "Order Received",
  parts_ordered: "Parts Ordered",
  parts_received: "Parts Received",
  assembly: "Assembly",
  diagnosis: "Diagnosis",
  repairing: "Repairing",
  profiling: "Profiling",
  modification: "Modification",
  benchmarking: "Benchmarking",
  thermal_testing: "Thermal Testing",
  validation: "Validation",
  ready_for_pickup: "Ready for Pickup",
  completed: "Completed",
};

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  received: <Circle />,
  parts_ordered: <Loader2 className="animate-spin" />,
  parts_received: <Package />,
  assembly: <Wrench />,
  diagnosis: <Search />,
  repairing: <Wrench />,
  profiling: <Gauge />,
  modification: <Cog />,
  benchmarking: <Zap />,
  thermal_testing: <Thermometer />,
  validation: <ShieldCheck />,
  ready_for_pickup: <PackageCheck />,
  completed: <CheckCircle2 />,
};

export const STATUS_COLORS: Record<string, string> = {
  received: "border-slate-300 bg-slate-100 text-slate-600",
  parts_ordered: "border-blue-300 bg-blue-100 text-blue-600",
  parts_received: "border-blue-300 bg-blue-100 text-blue-600",
  assembly: "border-blue-300 bg-blue-100 text-blue-600",
  diagnosis: "border-yellow-300 bg-yellow-100 text-yellow-600",
  repairing: "border-blue-300 bg-blue-100 text-blue-600",
  profiling: "border-purple-300 bg-purple-100 text-purple-600",
  modification: "border-purple-300 bg-purple-100 text-purple-600",
  benchmarking: "border-purple-300 bg-purple-100 text-purple-600",
  thermal_testing: "border-purple-300 bg-purple-100 text-purple-600",
  validation: "border-yellow-300 bg-yellow-100 text-yellow-600",
  ready_for_pickup: "border-green-300 bg-green-100 text-green-600",
  completed: "border-green-400 bg-green-200 text-green-800",
};
