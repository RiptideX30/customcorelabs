const SYSTEM_BUILD_TRACK = [
  "Order Received",
  "Parts Ordered",
  "Parts Received",
  "Assembly",
  "Validation",
  "Ready for Pickup",
  "Completed",
];

const SERVICE_REPAIR_TRACK = [
  "Order Received",
  "Diagnosis",
  "Parts Ordered",
  "Repairing",
  "Validation",
  "Ready for Pickup",
  "Completed",
];

const PERFORMANCE_TUNING_TRACK = [
  "Order Recieved",
  "Profiling",
  "Modification",
  "Benchmarking",
  "Thermal Testing",
  "Ready for Pickup",
  "Completed",
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
