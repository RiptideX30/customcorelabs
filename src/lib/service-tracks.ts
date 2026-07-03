const SYSTEM_BUILD_TRACK = [
  "received",
  "parts_ordered",
  "parts_received",
  "assembly",
  "validation",
  "ready_for_pickup",
  "completed",
];

const SERVICE_REPAIR_TRACK = [
  "received",
  "diagnosis",
  "parts_ordered",
  "repairing",
  "validation",
  "ready_for_pickup",
  "completed",
];

const PERFORMANCE_TUNING_TRACK = [
  "received",
  "profiling",
  "modification",
  "benchmarking",
  "thermal_testing",
  "ready_for_pickup",
  "completed",
];

const DEFAULT_TRACK = ["received", "completed"];

const SERVICE_TO_TRACK: Record<string, string[]> = {
  // System Build Services
  "Ultimate Build": SYSTEM_BUILD_TRACK,

  // Service & Repair Services
  "Desktop Refresh Bundle": SERVICE_REPAIR_TRACK,
  "Full System Diagnostic": SERVICE_REPAIR_TRACK,
  "Hardware Upgrade": SERVICE_REPAIR_TRACK,
  "Secure Drive Wipe": SERVICE_REPAIR_TRACK,

  // Performance Tuning Services
  "Performance Tuning": PERFORMANCE_TUNING_TRACK,
};

export function getTrackForServices(services: string[]): string[] {
  if (!Array.isArray(services)) {
    return DEFAULT_TRACK;
  }
  for (const service of services) {
    if (SERVICE_TO_TRACK[service]) {
      return SERVICE_TO_TRACK[service];
    }
  }
  return DEFAULT_TRACK;
}
