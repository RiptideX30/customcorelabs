
export const TRACKS = {
  BUILD: [
    "Parts Procurement & Reception",
    "Core Hardware Assembly",
    "Cable Architecture",
    "OS & Validation Bench",
    "Certified for Collection",
  ],
  REPAIR: [
    "Device Workshop Intake",
    "Deep Diagnostics & Trace Isolation",
    "Service Implementation",
    "Post-Service Validation",
    "Certified for Collection",
  ],
  UPGRADE: [
    "Device Workshop Intake",
    "Legacy De-installation",
    "Component Provisioning",
    "Bandwidth & Driver Validation",
    "Certified for Collection",
  ],
  TUNING: [
    "Device Workshop Intake",
    "Calibration & Firmware Update",
    "Profiling & Memory Training",
    "Deep Validation Stability Testing",
    "Certified for Collection",
  ],
};

export const SERVICE_TO_TRACK_MAP: Record<string, keyof typeof TRACKS> = {
  // BUILD
  "Basic Build": "BUILD",
  "Ultimate Build": "BUILD",
  // REPAIR
  "Desktop Refresh Bundle": "REPAIR",
  "Full System Diagnostic": "REPAIR",
  "Software Install": "REPAIR",
  "Secure Drive Wipe": "REPAIR",
  // UPGRADE
  "Pro Cable Management": "UPGRADE",
  "Hardware Upgrade": "UPGRADE",
  "Fresh Thermal Paste": "UPGRADE",
  // TUNING
  "BIOS / Firmware Tuning": "TUNING",
  "24-Hour Bench Validation": "TUNING",
  "Memory + CPU Overclock Profile": "TUNING",
};

export const STEP_ICONS: Record<string, string> = {
    "Parts Procurement & Reception": "📦",
    "Core Hardware Assembly": "🔧",
    "Cable Architecture": "🔌",
    "OS & Validation Bench": "⚡",
    "Certified for Collection": "✅",
    "Device Workshop Intake": "📥",
    "Deep Diagnostics & Trace Isolation": "🔍",
    "Service Implementation": "🛠️",
    "Post-Service Validation": "🧪",
    "Legacy De-installation": "🔩",
    "Component Provisioning": "⚙️",
    "Bandwidth & Driver Validation": "📡",
    "Calibration & Firmware Update": "🎛️",
    "Profiling & Memory Training": "🧠",
    "Deep Validation Stability Testing": "🔥",
  };

export function getTrackForServices(services: string[]): string[] {
  for (const service of services) {
    const trackName = SERVICE_TO_TRACK_MAP[service];
    if (trackName) {
      return TRACKS[trackName];
    }
  }
  return TRACKS.BUILD;
}
