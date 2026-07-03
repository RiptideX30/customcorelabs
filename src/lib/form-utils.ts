import { z } from "zod";

export type ServiceId =
  | "basic"
  | "ultimate"
  | "refresh"
  | "diagnostic"
  | "software"
  | "cables"
  | "wipe"
  | "upgrade"
  | "thermal"
  | "bios"
  | "validation"
  | "overclock";

export const NEW_BUILDS = [
  {
    id: "basic" as ServiceId,
    title: "Basic Build",
    priceLabel: "$109",
    desc: "Pure hardware assembly. No OS or drivers.",
  },
  {
    id: "ultimate" as ServiceId,
    title: "Ultimate Build",
    priceLabel: "Starting at $149",
    desc: "Full assembly, OS provisioning, pro routing, 60-min stress testing, structural component balancing, and BIOS optimization.",
  },
] as const;

export const SERVICE_REPAIR = [
  {
    id: "refresh" as ServiceId,
    title: "Desktop Refresh Bundle",
    price: 49,
    desc: "Deep clean, airflow re-route, thermal remediation.",
  },
  {
    id: "diagnostic" as ServiceId,
    title: "Full System Diagnostic",
    price: 25,
    desc: "12-point check. 100% credited toward repairs.",
  },
  {
    id: "software" as ServiceId,
    title: "Software Install",
    price: 39,
    desc: "Clean OS install + driver configuration.",
  },
  {
    id: "cables" as ServiceId,
    title: "Pro Cable Management",
    price: 18,
    desc: "Combs, velcro, precision routing.",
  },
  {
    id: "wipe" as ServiceId,
    title: "Secure Drive Wipe",
    price: 15,
    priceLabel: "$15/drive",
    desc: "Multi-pass military-grade erasure.",
    hasQuantity: true,
  },
  {
    id: "upgrade" as ServiceId,
    title: "Hardware Upgrade",
    price: 0,
    priceLabel: "Quoted",
    desc: "Component swap-in (GPU, RAM, storage).",
  },
  {
    id: "thermal" as ServiceId,
    title: "Fresh Thermal Paste",
    price: 10,
    priceLabel: "+ $10",
    desc: "Removal, cleanup, fresh application.",
  },
] as const;

export const PERFORMANCE_TUNING = [
  {
    id: "bios" as ServiceId,
    title: "BIOS / Firmware Tuning",
    price: 35,
    desc: "Flash optimization, custom fan curves, voltage tuning.",
  },
  {
    id: "validation" as ServiceId,
    title: "24-Hour Bench Validation",
    price: 59,
    desc: "Extended stress testing and stability verification.",
  },
  {
    id: "overclock" as ServiceId,
    title: "Memory + CPU Overclock Profile",
    price: 49,
    desc: "Custom performance tuning for maximum throughput.",
  },
] as const;

export type PathId = "selector" | "repair" | "build-known" | "build-help" | "signature";

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function computeEstimator(
  services: Set<ServiceId>,
  partsValue: number,
  wipeQuantity: number,
  isITX: boolean,
  nonModularPSU: boolean,
) {
  const items: { label: string; amount: number; taxable?: boolean }[] = [];

  if (services.has("basic")) {
    const basicAmount = partsValue < 1000 ? 99 : partsValue < 2000 ? 119 : 159;
    items.push({ label: `Basic Build · $${basicAmount}`, amount: basicAmount, taxable: true });
  }
  if (services.has("ultimate")) {
    const ultimateAmount = partsValue < 1000 ? 149 : partsValue < 2000 ? 179 : 229;
    items.push({
      label: `Ultimate Build · $${ultimateAmount}`,
      amount: ultimateAmount,
      taxable: true,
    });
  }
  if (services.has("refresh")) {
    items.push({ label: "Desktop Refresh Bundle", amount: 49, taxable: true });
  }
  if (services.has("diagnostic")) {
    items.push({ label: "Full System Diagnostic", amount: 25 });
  }
  if (services.has("software")) {
    items.push({ label: "Software Install", amount: 39 });
  }
  if (services.has("cables")) {
    items.push({ label: "Pro Cable Management", amount: 18, taxable: true });
  }
  if (services.has("wipe")) {
    items.push({
      label: `Secure Drive Wipe × ${wipeQuantity}`,
      amount: 15 * wipeQuantity,
      taxable: true,
    });
  }
  if (services.has("upgrade")) {
    items.push({ label: "Hardware Upgrade · TBD", amount: 0, taxable: true });
  }
  if (services.has("thermal")) {
    const isComplimentary = services.has("basic") || services.has("ultimate");
    items.push({
      label: `Fresh Thermal Paste ${isComplimentary ? "(Complimentary)" : "(add-on)"}`,
      amount: isComplimentary ? 0 : 10,
      taxable: !isComplimentary,
    });
  }
  if (services.has("bios")) {
    items.push({ label: "BIOS / Firmware Tuning", amount: 35 });
  }
  if (services.has("validation")) {
    items.push({ label: "24-Hour Bench Validation", amount: 59 });
  }
  if (services.has("overclock")) {
    items.push({ label: "Memory + CPU Overclock Profile", amount: 49 });
  }

  if (isITX) {
    items.push({ label: "ITX / SFF Case Surcharge", amount: 30, taxable: true });
  }
  if (nonModularPSU) {
    items.push({ label: "Non-Modular PSU Surcharge", amount: 15, taxable: true });
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxableSubtotal = items.reduce((sum, item) => (item.taxable ? sum + item.amount : sum), 0);
  const taxAmount = +(taxableSubtotal * 0.08).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);
  return { items, subtotal, taxAmount, total };
}

export function computeSignatureEstimator(
  tier: "esports" | "apex" | "horizon",
  isPriority: boolean,
) {
  const items: { label: string; amount: number }[] = [];
  let dueToday = 0;

  if (tier === "esports") {
    items.push({ label: "Parts Cost", amount: 1021.0 });
    items.push({ label: "Ultimate Labor", amount: 179.0 });
    dueToday = 1021.0;
  } else if (tier === "apex") {
    items.push({ label: "Parts Cost", amount: 1586.0 });
    items.push({ label: "Ultimate Labor + Tuning", amount: 214.0 });
    dueToday = 1586.0;
  } else if (tier === "horizon") {
    items.push({ label: "Parts Cost", amount: 2077.0 });
    items.push({ label: "Ultimate Labor + Full Validation Suite", amount: 323.0 });
    dueToday = 2077.0;
  }

  if (isPriority) {
    dueToday += 150.0;
  }

  items.push({ label: "Due Today", amount: dueToday });

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { items, total };
}

export async function submitForm(payload: Record<string, string>) {
  const response = await fetch("https://submit-form.cdwojick.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return response;
}

export function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion
  let code = "CCL-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
