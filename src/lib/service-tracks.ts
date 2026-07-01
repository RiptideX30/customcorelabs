const DEFAULT_TRACK = ["Build Created", "Build Complete"];
const REPAIR_TRACK = ["Received for Service", "Diagnostics", "Repair", "Ready for Pickup"];
const ULTIMATE_TRACK = [
  "Parts Ordered",
  "Parts Received",
  "Assembly",
  "Validation",
  "Ready for Pickup",
];

const SERVICE_TO_TRACK: Record<string, string[]> = {
  "Ultimate Build": ULTIMATE_TRACK,
  "Desktop Refresh Bundle": REPAIR_TRACK,
  "Full System Diagnostic": REPAIR_TRACK,
  "Hardware Upgrade": REPAIR_TRACK,
};

/**
 * Determines the appropriate tracking timeline for a given set of services.
 * @param services An array of service titles.
 * @returns The corresponding array of timeline statuses.
 */
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
