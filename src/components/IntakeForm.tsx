import { useMemo, useState, ReactNode, type FormEvent } from "react";
import { z } from "zod";
import {
  Cpu,
  FileText,
  Link2,
  HelpCircle,
  Check,
  Minus,
  Plus,
  Info,
  Wrench,
  Package,
  Lightbulb,
  Monitor,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef } from "react";

/* ============================================================
   DATA DEFINITIONS
   ============================================================ */

type ServiceId =
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

const NEW_BUILDS = [
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

const SERVICE_REPAIR = [
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

const PERFORMANCE_TUNING = [
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

type PathId = "selector" | "repair" | "build-known" | "build-help";

/* ============================================================
   HELPERS
   ============================================================ */

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function computeEstimator(
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
  if (services.has("refresh"))
    items.push({ label: "Desktop Refresh Bundle", amount: 49, taxable: true });
  if (services.has("diagnostic")) items.push({ label: "Full System Diagnostic", amount: 25 });
  if (services.has("software")) items.push({ label: "Software Install", amount: 39 });
  if (services.has("cables"))
    items.push({ label: "Pro Cable Management", amount: 18, taxable: true });
  if (services.has("wipe"))
    items.push({
      label: `Secure Drive Wipe × ${wipeQuantity}`,
      amount: 15 * wipeQuantity,
      taxable: true,
    });
  if (services.has("upgrade"))
    items.push({ label: "Hardware Upgrade · TBD", amount: 0, taxable: true });
  if (services.has("thermal")) {
    const isComplimentary = services.has("basic") || services.has("ultimate");
    items.push({
      label: `Fresh Thermal Paste ${isComplimentary ? "(Complimentary)" : "(add-on)"}`,
      amount: isComplimentary ? 0 : 10,
      taxable: !isComplimentary,
    });
  }
  if (services.has("bios")) items.push({ label: "BIOS / Firmware Tuning", amount: 35 });
  if (services.has("validation")) items.push({ label: "24-Hour Bench Validation", amount: 59 });
  if (services.has("overclock"))
    items.push({ label: "Memory + CPU Overclock Profile", amount: 49 });

  if (isITX) items.push({ label: "ITX / SFF Case Surcharge", amount: 30, taxable: true });
  if (nonModularPSU) items.push({ label: "Non-Modular PSU Surcharge", amount: 15, taxable: true });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxableSubtotal = items.reduce((sum, item) => (item.taxable ? sum + item.amount : sum), 0);
  const taxAmount = +(taxableSubtotal * 0.08).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);
  return { items, subtotal, taxAmount, total };
}

/* ============================================================
   SHARED UI COMPONENTS
   ============================================================ */

function SubmittedState() {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-8 w-8" />
      </div>
      <h3 className="text-[24px] font-semibold tracking-tight">Request Received.</h3>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-mute">
        A technician will reach out to you within 24 hours.
      </p>
    </div>
  );
}

function BuildOrderSuccess() {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-8 w-8" />
      </div>
      <h3 className="text-[28px] font-semibold tracking-tight">Project Initiated! 🚀</h3>
      <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-slate-600">
        Thanks! We are reviewing your build specifications and drafting your custom component list.
        Check your email shortly to sign your digital service agreement so we can order your parts.
        Once your PC is fully built and tested at our Victor testing bench, we will email you a
        secure link to schedule your final pickup appointment.
      </p>
    </div>
  );
}

function StepHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="mono text-primary text-[14px] font-bold">{index}</div>
      <h3 className="text-[20px] font-semibold">{title}</h3>
    </div>
  );
}

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
}) {
  return (
    <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
      <Icon className="h-4 w-4 text-primary" />
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}

function FormInput({
  value,
  onChange,
  placeholder,
  error,
  disabled,
  type = "text",
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  type?: string;
  prefix?: string;
}) {
  return (
    <div>
      {prefix ? (
        <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-background px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <span className="mono text-[14px] text-slate-mute">{prefix}</span>
          <input
            type={type}
            className="w-full bg-transparent text-[14px] text-foreground placeholder:text-slate-mute/70 focus:outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      ) : (
        <input
          type={type}
          className="w-full rounded-md border border-slate-300 bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-slate-mute/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {error && <FieldHint>{error}</FieldHint>}
    </div>
  );
}

function FormTextarea({
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <div>
      <textarea
        className="w-full rounded-md border border-slate-300 bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-slate-mute/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {error && <FieldHint>{error}</FieldHint>}
    </div>
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-slate-strong bg-background text-primary focus:ring-primary h-4 w-4"
        />
        <span className="text-sm text-slate-ink">{label}</span>
      </label>
      {error && <FieldHint>{error}</FieldHint>}
    </div>
  );
}

type ServiceCardData = {
  id: ServiceId;
  title: string;
  price?: number;
  priceLabel?: string;
  desc: string;
  hasQuantity?: boolean;
};

function ServiceCard({
  service,
  selected,
  onSelect,
  quantity,
  onQuantityChange,
  disabled,
}: {
  service: ServiceCardData;
  selected: boolean;
  onSelect: () => void;
  quantity?: number;
  onQuantityChange?: (delta: number) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`group flex cursor-pointer flex-col gap-3 rounded-xl border bg-background p-5 transition-all ${
        disabled
          ? "hairline pointer-events-none opacity-40 bg-zinc-100"
          : selected
            ? "border-primary shadow-[var(--shadow-glow)]"
            : "hairline-strong hover:border-primary/60"
      }`}
      onClick={disabled ? undefined : onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
          {service.id.toUpperCase()}
        </div>
        {disabled ? (
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
            Unavailable
          </span>
        ) : selected ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <div className="h-4 w-4 rounded-full border hairline-strong" />
        )}
      </div>
      <div>
        <div className="text-[16px] font-semibold">{service.title}</div>
        <p className="mt-1 text-[13px] text-slate-mute">{service.desc}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[20px] font-semibold tabular-nums tracking-[-0.02em]">
          {service.priceLabel || (service.price ? `$${service.price}` : "")}
        </div>
        {service.hasQuantity && selected && onQuantityChange && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onQuantityChange(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border hairline-strong hover:border-primary hover:text-primary"
              disabled={quantity! <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border hairline-strong hover:border-primary hover:text-primary"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveEstimator({
  services,
  partsValue,
  wipeQuantity,
  isITX,
  nonModularPSU,
}: {
  services: Set<ServiceId>;
  partsValue: number;
  wipeQuantity: number;
  isITX: boolean;
  nonModularPSU: boolean;
}) {
  const {
    items: lineItems,
    subtotal,
    taxAmount,
    total,
  } = useMemo(
    () => computeEstimator(services, partsValue, wipeQuantity, isITX, nonModularPSU),
    [services, partsValue, wipeQuantity, isITX, nonModularPSU],
  );

  return (
    <div className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
      <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute">
        <span>Live estimate</span>
        <span className="text-primary">Real-time</span>
      </div>
      <div className="mt-6">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
          Total labor
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="mono text-[14px] text-slate-mute">$</span>
          <span className="text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
            {total.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {lineItems.length === 0 ? (
          <div className="rounded-md border hairline bg-secondary/30 px-3 py-3 text-[13px] text-slate-mute">
            Select services to see your live quote.
          </div>
        ) : (
          lineItems.map((it, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b hairline py-2 text-[13px]"
            >
              <span className="text-slate-ink">{it.label}</span>
              <span className="mono tabular-nums text-foreground">${it.amount.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 border-t hairline pt-3 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-ink">Estimated tax (NY 8%)</span>
          <span className="mono tabular-nums text-foreground">${taxAmount.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">Estimated total</span>
          <span className="text-[20px] font-semibold tabular-nums">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PCPARTPICKER INSTRUCTIONS MODAL
   ============================================================ */

function PCPPInstructionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border hairline-strong bg-background p-6 md:p-8 shadow-[var(--shadow-elegant)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border hairline-strong text-slate-ink hover:border-primary hover:text-primary"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
          How-To Guide
        </div>
        <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em]">
          Creating a PCPartPicker List
        </h3>
        <p className="mt-2 text-[13px] text-slate-mute">
          Follow these simple steps to create your parts list:
        </p>
        <ol className="mt-6 space-y-4">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              1
            </span>
            <div>
              <div className="text-[14px] font-medium">Go to PCPartPicker</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Visit{" "}
                <a
                  href="https://pcpartpicker.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  pcpartpicker.com
                </a>{" "}
                and create a free account.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              2
            </span>
            <div>
              <div className="text-[14px] font-medium">Start a New Build</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Click "Start System Builder" or "Create New Build" from your dashboard.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              3
            </span>
            <div>
              <div className="text-[14px] font-medium">Add Your Components</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Select each component category and add your desired parts.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              4
            </span>
            <div>
              <div className="text-[14px] font-medium">Copy the Share Link</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Click the "Share" button, then copy the public link. Paste it in the form.
              </p>
            </div>
          </li>
        </ol>
        <div className="mt-6 rounded-md border hairline bg-secondary/40 px-4 py-3 text-[13px] text-slate-mute">
          <span className="font-medium text-primary">Tip:</span> Make sure your list is set to
          "Public" so we can view it.
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   CUSTOMER INFO FIELDS (shared across all paths)
   ============================================================ */

function CustomerInfoFields({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  errors,
}: {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <FieldLabel icon={Cpu}>Customer Name</FieldLabel>
        <FormInput value={name} onChange={setName} placeholder="Jane Doe" error={errors.name} />
      </div>
      <div>
        <FieldLabel icon={Cpu}>Phone Number</FieldLabel>
        <FormInput
          value={phone}
          onChange={(v) => setPhone(formatPhone(v))}
          placeholder="(585) 555-0142"
          type="tel"
          error={errors.phone}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel icon={Cpu}>Email Address</FieldLabel>
        <FormInput
          value={email}
          onChange={setEmail}
          placeholder="jane@email.com"
          type="email"
          error={errors.email}
        />
      </div>
    </div>
  );
}

/* ============================================================
   BUILD LOOK FIELDS (shared across Paths 2 & 3)
   ============================================================ */

function BuildLookFields({
  rgbPref,
  setRgbPref,
  colorPref,
  setColorPref,
  extraFans,
  setExtraFans,
  lookDescription,
  setLookDescription,
}: {
  rgbPref: string;
  setRgbPref: (v: string) => void;
  colorPref: string;
  setColorPref: (v: string) => void;
  extraFans: string;
  setExtraFans: (v: string) => void;
  lookDescription: string;
  setLookDescription: (v: string) => void;
}) {
  // Reusable Premium Custom Dropdown Component
  function PremiumSelect({ label, value, onChange, options }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Safely close the menu overlay if clicking anywhere else on the page
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className="relative" ref={dropdownRef}>
        <label className="mb-2 block text-[13px] font-semibold text-slate-700">{label}</label>

        {/* Custom Trigger Base Input Box */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-background px-4 py-3 text-[14px] text-slate-800 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gradient-to-r from-primary/5 to-background shadow-[var(--shadow-glow)] text-left"
        >
          <span className={!selectedOption ? "text-slate-400" : ""}>
            {selectedOption ? selectedOption.label : "Select..."}
          </span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Styled Floating Option List Overlay */}
        {isOpen && (
          <ul className="absolute z-50 mt-1.5 w-full rounded-md border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer rounded px-3 py-2 text-[14px] transition-colors ${
                  value === opt.value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Your Main Section Return Code
  return (
    <div id="intake-form">
      <StepHeader index="05" title="Build Aesthetics & Configuration" />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PremiumSelect
          label="RGB Preference"
          value={rgbPref}
          onChange={setRgbPref}
          options={[
            { value: "", label: "Select..." },
            { value: "rgb", label: "RGB Lighting" },
            { value: "no-rgb", label: "No RGB (Stealth)" },
            { value: "no-preference", label: "No Preference" },
          ]}
        />

        <PremiumSelect
          label="Color Scheme"
          value={colorPref}
          onChange={setColorPref}
          options={[
            { value: "", label: "Select..." },
            { value: "white", label: "White" },
            { value: "black", label: "Black" },
            { value: "mixed", label: "Mixed (White + Black)" },
            { value: "no-preference", label: "No Preference" },
          ]}
        />

        <PremiumSelect
          label="Extra Case Fans"
          value={extraFans}
          onChange={setExtraFans}
          options={[
            { value: "", label: "Select..." },
            { value: "stock", label: "Stock fans only" },
            { value: "extra", label: "Add extra fans" },
            { value: "no-preference", label: "No Preference" },
          ]}
        />
      </div>

      <div className="mt-4">
        <FieldLabel icon={Monitor}>Desired Look Description</FieldLabel>
        <FormTextarea
          value={lookDescription}
          onChange={setLookDescription}
          placeholder="Describe the look you're going for — e.g., 'clean all-white setup with subtle RGB', 'stealth blackout with no lights', 'sleeper build in an old case'"
          rows={3}
        />
      </div>
    </div>
  );
}

/* ============================================================
   ITX & PSU SURCHARGE FIELDS
   ============================================================ */

function BuildSurchargeFields({
  isITX,
  setIsITX,
  nonModularPSU,
  setNonModularPSU,
}: {
  isITX: boolean;
  setIsITX: (v: boolean) => void;
  nonModularPSU: boolean;
  setNonModularPSU: (v: boolean) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${isITX ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60"}`}
      >
        <input
          type="checkbox"
          checked={isITX}
          onChange={(e) => setIsITX(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        />
        <div>
          <div className="text-[14px] font-semibold">ITX / SFF Case</div>
          <div className="text-[12px] text-slate-mute">
            +$30 surcharge — tighter build, more labor
          </div>
        </div>
      </label>
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${nonModularPSU ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60"}`}
      >
        <input
          type="checkbox"
          checked={nonModularPSU}
          onChange={(e) => setNonModularPSU(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        />
        <div>
          <div className="text-[14px] font-semibold">Non-Modular PSU</div>
          <div className="text-[12px] text-slate-mute">
            +$15 surcharge — extra cable routing work
          </div>
        </div>
      </label>
    </div>
  );
}

/* ============================================================
   PATH SELECTOR — Entry point
============================================================ */
function PathSelector({ onSelect }: { onSelect: (path: PathId) => void }) {
  // 🟩 PASTE THIS REPLACING THE HASH EFFECT INSIDE PathSelector:
  useEffect(() => {
    const handleProfileTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<PathId>;
      if (customEvent.detail) {
        onSelect(customEvent.detail);
      }
    };

    window.addEventListener("select-profile-path", handleProfileTrigger);
    return () => window.removeEventListener("select-profile-path", handleProfileTrigger);
  }, [onSelect]);

  const paths = [
    {
      id: "repair" as PathId,
      icon: Wrench,
      title: "Service & Repair",
      desc: "Diagnostics, cleaning, upgrades, software install, and more for your existing machine.",
      tag: "Drop-off & Pickup",
    },
    {
      id: "build-known" as PathId,
      icon: Package,
      title: "Build — I Know My Parts",
      desc: "You have a PCPartPicker list ready. I source the parts, build it, and you pick up the finished PC.",
      tag: "Pickup Only",
    },
    {
      id: "build-help" as PathId,
      icon: Lightbulb,
      title: "Build — Help Me Decide",
      desc: "Not sure what parts to get? Tell me your budget and needs, and I'll spec and build it all for you.",
      tag: "Pickup Only",
    },
  ];

  return (
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {paths.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="group relative flex flex-col items-start rounded-xl border-2 border-transparent bg-background p-8 text-left shadow-[var(--shadow-elegant)] transition-all hover:border-primary/60 hover:shadow-[var(--shadow-glow)]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Icon className="h-7 w-7" />
            </div>
            <div className="mono mt-6 inline-flex items-center gap-1.5 rounded-full border hairline-strong bg-secondary/50 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-mute">
              {p.tag}
            </div>
            <h3 className="mt-4 text-[22px] font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">{p.desc}</p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary group-hover:gap-2 transition-all">
              Select <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   SUBMIT LOGIC (shared)
   ============================================================ */

async function submitForm(payload: Record<string, string>) {
  const response = await fetch("https://submit-form.cdwojick.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return response;
}

/* ============================================================
   MAIN INTAKE FORM COMPONENT
   ============================================================ */

/** Generate a short, human-friendly tracking code: CCL-A7F3 */
export function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 to avoid confusion
  let code = "CCL-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function IntakeForm() {
  const [currentPath, setCurrentPath] = useState<PathId>("selector");
  const [submitted, setSubmitted] = useState(false);
  const [showBuildSuccess, setShowBuildSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState(""); // Added state string container
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shared customer info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Path 1 — Service & Repair
  const [repairServices, setRepairServices] = useState<Set<ServiceId>>(new Set());
  const [repairSymptoms, setRepairSymptoms] = useState("");
  const [repairWipeQty, setRepairWipeQty] = useState(1);

  // Path 2 — Build Known Parts
  const [knownBuild, setKnownBuild] = useState<ServiceId | null>(null);
  const [knownPCPP, setKnownPCPP] = useState("");
  const [knownNoPCPP, setKnownNoPCPP] = useState(false);
  const [knownPartsValue, setKnownPartsValue] = useState("");
  const [knownITX, setKnownITX] = useState(false);
  const [knownNonModular, setKnownNonModular] = useState(false);
  const [knownPerformance, setKnownPerformance] = useState<Set<ServiceId>>(new Set());
  const [knownRgb, setKnownRgb] = useState("");
  const [knownColor, setKnownColor] = useState("");
  const [knownFans, setKnownFans] = useState("");
  const [knownLook, setKnownLook] = useState("");
  const [knownNotes, setKnownNotes] = useState("");
  const [showPCPP, setShowPCPP] = useState(false);

  // Path 3 — Build Help
  const [helpBudget, setHelpBudget] = useState("");
  const [helpPurpose, setHelpPurpose] = useState("");
  const [helpITX, setHelpITX] = useState(false);
  const [helpNonModular, setHelpNonModular] = useState(false);
  const [helpRgb, setHelpRgb] = useState("");
  const [helpColor, setHelpColor] = useState("");
  const [helpFans, setHelpFans] = useState("");
  const [helpLook, setHelpLook] = useState("");
  const [helpNotes, setHelpNotes] = useState("");

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await processFormSubmission();
  };

  const processFormSubmission = async () => {
    const customerName = name.trim();
    const customerEmail = email.trim();
    const selectedPath = currentPath;
    const isDropOffPath = selectedPath === "repair";
    const isBuildOrderPath = selectedPath === "build-known" || selectedPath === "build-help";

    const baseSchema = z.object({
      name: z.string().trim().min(2, "Name is required"),
      email: z.string().trim().email("Valid email required"),
      phone: z.string().trim().min(10, "Phone number required (10 digits)"),
    });

    const baseCheck = baseSchema.safeParse({ name, email, phone });
    if (!baseCheck.success) {
      const e: Record<string, string> = {};
      for (const issue of baseCheck.error.issues) {
        e[issue.path[0] as string] = issue.message;
      }
      setErrors(e);
      return;
    }
    setErrors({});

    // Generate tracking identifier only if initializing a hardware system pipeline
    const generatedCode = isBuildOrderPath ? generateTrackingCode() : "";

    // Build payload based on path
    let payload: Record<string, string> = {
      "customer-name": name,
      "customer-phone": phone,
      "customer-email": email,
      "payment-terms":
        "Parts cost is collected before any orders are placed. Labor and services are due after final pickup and validation.",
      "customer-state": "NY",
      "tracking-code": generatedCode || "N/A", // Hooked straight into worker stream
    };

    const partsValueNum = Math.max(0, Number(knownPartsValue) || 0);

    if (currentPath === "repair") {
      if (!repairSymptoms.trim()) {
        setErrors({ symptoms: "Please describe your issue" });
        return;
      }
      const repServicesText = [...repairServices]
        .map((id) => {
          const s =
            SERVICE_REPAIR.find((x) => x.id === id) || PERFORMANCE_TUNING.find((x) => x.id === id);
          return s ? s.title : id;
        })
        .join(", ");

      payload = {
        ...payload,
        "form-type": "service-repair",
        "selected-services": repServicesText || "None selected",
        "symptoms-details": repairSymptoms,
        "pcpartpicker-url": "N/A",
        "parts-value": "N/A",
        "estimate-subtotal": "",
        "estimate-tax": "",
        "estimate-total": "",
      };
    } else if (currentPath === "build-known") {
      const allServices = new Set<ServiceId>();
      if (knownBuild) allServices.add(knownBuild);
      knownPerformance.forEach((s) => allServices.add(s));
      if (allServices.has("ultimate") || allServices.has("basic")) allServices.add("thermal");
      const estimate = computeEstimator(allServices, partsValueNum, 1, knownITX, knownNonModular);
      const srvText = [...allServices]
        .map((id) => {
          const s = [...NEW_BUILDS, ...PERFORMANCE_TUNING].find((x) => x.id === id);
          return s ? s.title : id;
        })
        .join(", ");
      const lookText = [knownRgb, knownColor, knownFans].filter(Boolean).join(" · ");

      payload = {
        ...payload,
        "form-type": "build-known-parts",
        "selected-services": srvText || "None selected",
        "pcpartpicker-url": knownNoPCPP
          ? "No URL given - Customer will provide parts list later"
          : knownPCPP,
        "parts-value": `$${partsValueNum.toFixed(2)}`,
        "symptoms-details": `Look: ${lookText}${knownLook ? ` — ${knownLook}` : ""}${knownNotes ? `\nNotes: ${knownNotes}` : ""}`,
        "itx-sff-case": knownITX ? "Yes" : "No",
        "non-modular-psu": knownNonModular ? "Yes" : "No",
        "estimate-subtotal": `$${estimate.subtotal.toFixed(2)}`,
        "estimate-tax": `$${estimate.taxAmount.toFixed(2)}`,
        "estimate-total": `$${estimate.total.toFixed(2)}`,
      };
    } else if (currentPath === "build-help") {
      const lookText = [helpRgb, helpColor, helpFans].filter(Boolean).join(" · ");
      payload = {
        ...payload,
        "form-type": "build-consultation",
        "selected-services": "Consultation — needs parts selection help",
        "pcpartpicker-url": "N/A",
        "parts-value": helpBudget ? `Budget: $${helpBudget}` : "N/A",
        "symptoms-details": `Purpose: ${helpPurpose || "Not specified"}\nLook: ${lookText}${helpLook ? ` — ${helpLook}` : ""}${helpNotes ? `\nNotes: ${helpNotes}` : ""}`,
        "itx-sff-case": helpITX ? "Yes" : "No",
        "non-modular-psu": helpNonModular ? "Yes" : "No",
        "estimate-subtotal": "",
        "estimate-tax": "",
        "estimate-total": "",
      };
    }

    const encodedCustomerName = encodeURIComponent(customerName);
    const encodedCustomerEmail = encodeURIComponent(customerEmail);
    const zcalCalendarUrl = `https://zcal.co?name=${encodedCustomerName}&email=${encodedCustomerEmail}`;

    if (isDropOffPath) {
      window.location.assign(zcalCalendarUrl);
      return;
    }

    try {
      // 1. Send the data to your worker so it saves to Cloudflare KV
      const response = await submitForm(payload);

      if (response.ok) {
        // 2. Set your submitted state to true for everyone
        setSubmitted(true);

        // 3. Clear any transient build success views to keep layout uniform
        setShowBuildSuccess(false);

        // 4. Smoothly scroll them to your custom booking info area
        setTimeout(() => {
          document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        const data = await response.json();
        alert("Submission error: " + (data.error || "Please try again."));
      }
    } catch {
      alert("Error sending details. Please check your internet connection.");
    }
  };

  if (showBuildSuccess) {
    return (
      <section id="book" className="border-b hairline bg-secondary/30">
        <div className="mx-auto max-w-[1280px] px-8 py-28">
          <div className="grid grid-cols-12 items-end gap-8">
            <div className="col-span-3">
              <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">
                § 05
              </div>
              <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
                Project intake · Form 003
              </div>
            </div>
            <h2 className="col-span-9 text-[56px] font-semibold leading-none tracking-[-0.03em]">
              Start a project
            </h2>
          </div>
          <div className="mt-16 overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]">
            {/* Added code prop context to your success container child module */}
            <BuildOrderSuccess />
          </div>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section id="book" className="border-b hairline bg-secondary/30">
        <div className="mx-auto max-w-[1280px] px-8 py-28">
          <div className="grid grid-cols-12 items-end gap-8">
            <div className="col-span-3">
              <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">
                § 05
              </div>
              <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
                Project intake · Form 003
              </div>
            </div>
            <h2 className="col-span-9 text-[56px] font-semibold leading-none tracking-[-0.03em]">
              Start a project
            </h2>
          </div>
          <div className="mt-16 overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]">
            <SubmittedState />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="border-b hairline bg-secondary/30">
      <PCPPInstructionsModal isOpen={showPCPP} onClose={() => setShowPCPP(false)} />
      <div className="mx-auto max-w-[1280px] px-8 py-28">
        <div className="grid grid-cols-12 items-end gap-8">
          <div className="col-span-3">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 05</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              Project intake · Form 003
            </div>
          </div>
          <h2 className="col-span-9 text-[56px] font-semibold leading-none tracking-[-0.03em]">
            Start a project
          </h2>
        </div>

        {currentPath === "selector" && (
          <>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-mute">
              Choose the path that best describes what you need. We source premium parts when needed
              and prepare your system for final pickup with clear payment milestones.
            </p>
            <PathSelector onSelect={setCurrentPath} />
          </>
        )}

        {currentPath !== "selector" && (
          <form onSubmit={handleFormSubmit}>
            {/* Back button */}
            <button
              type="button"
              onClick={() => setCurrentPath("selector")}
              className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
            >
              ← Back to path selection
            </button>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Area */}
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]">
                  <div className="px-8 py-8">
                    {/* ===== PATH 1: SERVICE & REPAIR ===== */}
                    {currentPath === "repair" && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Wrench className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-[20px] font-semibold">Service & Repair</h3>
                            <p className="text-[13px] text-slate-mute">
                              Diagnostics, maintenance, upgrades for your existing machine
                            </p>
                          </div>
                        </div>

                        <StepHeader index="01" title="Select Services" />
                        <p className="text-[13px] text-slate-mute mb-4">
                          Pick any services you need
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {SERVICE_REPAIR.map((s) => (
                            <ServiceCard
                              key={s.id}
                              service={s}
                              selected={repairServices.has(s.id)}
                              onSelect={() => {
                                setRepairServices((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(s.id)) {
                                    next.delete(s.id);
                                    if (s.id === "wipe") setRepairWipeQty(1);
                                  } else {
                                    next.add(s.id);
                                  }
                                  return next;
                                });
                              }}
                              quantity={s.id === "wipe" ? repairWipeQty : undefined}
                              onQuantityChange={
                                s.id === "wipe"
                                  ? (d) => setRepairWipeQty((p) => Math.max(1, p + d))
                                  : undefined
                              }
                            />
                          ))}
                        </div>

                        {/* Performance tuning addons for repair */}
                        <div className="mt-8">
                          <StepHeader index="02" title="Performance & Tuning (Optional)" />
                          <p className="text-[13px] text-slate-mute mb-4">
                            Add-on services for your machine
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PERFORMANCE_TUNING.map((s) => (
                              <ServiceCard
                                key={s.id}
                                service={s}
                                selected={repairServices.has(s.id)}
                                onSelect={() => {
                                  setRepairServices((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(s.id)) next.delete(s.id);
                                    else next.add(s.id);
                                    return next;
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="03" title="Contact & Issue Details" />
                          <CustomerInfoFields
                            name={name}
                            setName={setName}
                            phone={phone}
                            setPhone={setPhone}
                            email={email}
                            setEmail={setEmail}
                            errors={errors}
                          />
                          <div className="mt-6">
                            <FieldLabel icon={FileText}>Describe the Issue</FieldLabel>
                            <FormTextarea
                              value={repairSymptoms}
                              onChange={setRepairSymptoms}
                              placeholder="Example: PC is running hot, need a deep clean and fresh thermal paste. Also want to upgrade RAM..."
                              error={errors.symptoms}
                            />
                          </div>
                        </div>

                        <div className="mt-8 border-t hairline pt-8">
                          <div className="rounded-xl border hairline-strong bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-[var(--shadow-elegant)]">
                            <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                              Ready to launch
                            </div>
                            <p className="mt-1 text-[13px] text-slate-mute">
                              By submitting you agree to the terms. We'll reach out within 24 hours.
                            </p>
                            <button
                              type="submit"
                              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-90"
                            >
                              <Check className="h-5 w-5" />
                              Submit Service Request
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===== PATH 2: BUILD — KNOWN PARTS ===== */}
                    {currentPath === "build-known" && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-[20px] font-semibold">Build — I Know My Parts</h3>
                            <p className="text-[13px] text-slate-mute">
                              I have a parts list ready — I need you to source and build it
                            </p>
                          </div>
                        </div>

                        <StepHeader index="01" title="Choose Build Type" />
                        <p className="text-[13px] text-slate-mute mb-4">Choose one build service</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {NEW_BUILDS.map((s) => (
                            <ServiceCard
                              key={s.id}
                              service={s}
                              selected={knownBuild === s.id}
                              onSelect={() =>
                                setKnownBuild((prev) => (prev === s.id ? null : s.id))
                              }
                            />
                          ))}
                        </div>

                        {/* Performance tuning addons for build */}
                        <div className="mt-8">
                          <StepHeader index="02" title="Performance & Tuning (Optional)" />
                          <p className="text-[13px] text-slate-mute mb-4">Add-on services</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PERFORMANCE_TUNING.map((s) => (
                              <ServiceCard
                                key={s.id}
                                service={s}
                                selected={knownPerformance.has(s.id)}
                                onSelect={() => {
                                  setKnownPerformance((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(s.id)) next.delete(s.id);
                                    else next.add(s.id);
                                    return next;
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Surcharges */}
                        <div className="mt-8">
                          <StepHeader index="03" title="Build Complexity" />
                          <p className="text-[13px] text-slate-mute mb-2">
                            These help us quote accurately
                          </p>
                          <BuildSurchargeFields
                            isITX={knownITX}
                            setIsITX={setKnownITX}
                            nonModularPSU={knownNonModular}
                            setNonModularPSU={setKnownNonModular}
                          />
                        </div>

                        {/* Parts info */}
                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="04" title="Parts & Contact Info" />
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                              <div className="flex items-center justify-between">
                                <FieldLabel icon={Link2}>PCPartPicker Link</FieldLabel>
                                <button
                                  type="button"
                                  onClick={() => setShowPCPP(true)}
                                  className="inline-flex items-center gap-1 rounded-md border hairline-strong bg-background px-3 py-1.5 text-[12px] font-medium text-primary hover:border-primary hover:text-primary transition-colors"
                                >
                                  <HelpCircle className="h-3.5 w-3.5" />
                                  How to create one
                                </button>
                              </div>
                              <FormInput
                                value={knownPCPP}
                                onChange={setKnownPCPP}
                                placeholder="https://pcpartpicker.com/list/..."
                                disabled={knownNoPCPP}
                              />
                              <label className="mt-2 inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={knownNoPCPP}
                                  onChange={(e) => {
                                    setKnownNoPCPP(e.target.checked);
                                    if (e.target.checked) setKnownPCPP("");
                                  }}
                                  className="rounded border-slate-strong bg-background text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm text-slate-mute">
                                  I don't have a PCPartPicker link
                                </span>
                              </label>
                            </div>
                            <div>
                              <FieldLabel icon={FileText}>Total Parts Value (USD)</FieldLabel>
                              <FormInput
                                value={knownPartsValue}
                                onChange={(v) =>
                                  setKnownPartsValue(v.replace(/[^0-9.]/g, "").slice(0, 9))
                                }
                                placeholder="1850.00"
                                prefix="$"
                              />
                              <p className="mt-2 text-[12px] text-slate-mute">
                                <Info className="inline h-3 w-3 mr-1" />
                                Total cost of all components
                              </p>
                            </div>
                          </div>

                          <CustomerInfoFields
                            name={name}
                            setName={setName}
                            phone={phone}
                            setPhone={setPhone}
                            email={email}
                            setEmail={setEmail}
                            errors={errors}
                          />
                        </div>

                        {/* Build Look */}
                        <div className="mt-8 border-t hairline pt-8">
                          <BuildLookFields
                            rgbPref={knownRgb}
                            setRgbPref={setKnownRgb}
                            colorPref={knownColor}
                            setColorPref={setKnownColor}
                            extraFans={knownFans}
                            setExtraFans={setKnownFans}
                            lookDescription={knownLook}
                            setLookDescription={setKnownLook}
                          />
                        </div>

                        {/* Additional notes */}
                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="06" title="Additional Notes (Optional)" />
                          <FormTextarea
                            value={knownNotes}
                            onChange={setKnownNotes}
                            placeholder="Any other details, special requests, or questions..."
                            rows={3}
                          />
                        </div>

                        <div className="mt-8 border-t hairline pt-8">
                          <div className="rounded-xl border hairline-strong bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-[var(--shadow-elegant)]">
                            <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                              Ready to launch
                            </div>
                            <p className="mt-1 text-[13px] text-slate-mute">
                              By submitting you agree to the terms. We'll reach out within 24 hours.
                            </p>
                            <button
                              type="submit"
                              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-90"
                            >
                              <Check className="h-5 w-5" />
                              Submit Build Request
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===== PATH 3: BUILD — HELP ME DECIDE ===== */}
                    {currentPath === "build-help" && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Lightbulb className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-[20px] font-semibold">Build — Help Me Decide</h3>
                            <p className="text-[13px] text-slate-mute">
                              Tell me your needs and budget, and I'll spec and build the perfect PC
                            </p>
                          </div>
                        </div>

                        <StepHeader index="01" title="Purpose & Budget" />
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <FieldLabel icon={Cpu}>Primary Purpose</FieldLabel>
                            <select
                              value={helpPurpose}
                              onChange={(e) => setHelpPurpose(e.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-background px-4 py-3 text-[14px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">Select purpose...</option>
                              <option value="gaming">Gaming</option>
                              <option value="streaming">Gaming + Streaming</option>
                              <option value="workstation">
                                Workstation (video editing, 3D, etc.)
                              </option>
                              <option value="productivity">Productivity / Office</option>
                              <option value="home-server">Home Server / NAS</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <FieldLabel icon={FileText}>
                              Total Budget (including labor + tax)
                            </FieldLabel>
                            <FormInput
                              value={helpBudget}
                              onChange={(v) => setHelpBudget(v.replace(/[^0-9.]/g, "").slice(0, 9))}
                              placeholder="2500.00"
                              prefix="$"
                            />
                            <p className="mt-2 text-[12px] text-slate-mute">
                              <Info className="inline h-3 w-3 mr-1" />
                              Include everything — parts, labor, and tax
                            </p>
                          </div>
                        </div>

                        {/* Build Complexity */}
                        <div className="mt-8">
                          <StepHeader index="02" title="Build Complexity" />
                          <BuildSurchargeFields
                            isITX={helpITX}
                            setIsITX={setHelpITX}
                            nonModularPSU={helpNonModular}
                            setNonModularPSU={setHelpNonModular}
                          />
                        </div>

                        {/* Build Look */}
                        <div className="mt-8 border-t hairline pt-8">
                          <BuildLookFields
                            rgbPref={helpRgb}
                            setRgbPref={setHelpRgb}
                            colorPref={helpColor}
                            setColorPref={setHelpColor}
                            extraFans={helpFans}
                            setExtraFans={setHelpFans}
                            lookDescription={helpLook}
                            setLookDescription={setHelpLook}
                          />
                        </div>

                        {/* Contact info */}
                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="03" title="Contact Info" />
                          <CustomerInfoFields
                            name={name}
                            setName={setName}
                            phone={phone}
                            setPhone={setPhone}
                            email={email}
                            setEmail={setEmail}
                            errors={errors}
                          />
                        </div>

                        {/* Additional notes */}
                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="04" title="Additional Notes (Optional)" />
                          <FormTextarea
                            value={helpNotes}
                            onChange={setHelpNotes}
                            placeholder="Any specific games, software, or requirements..."
                            rows={3}
                          />
                        </div>

                        <div className="mt-8 border-t hairline pt-8">
                          <div className="rounded-xl border hairline-strong bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-[var(--shadow-elegant)]">
                            <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                              Ready to launch
                            </div>
                            <p className="mt-1 text-[13px] text-slate-mute">
                              By submitting you agree to the terms. We'll reach out within 24 hours.
                            </p>
                            <button
                              type="submit"
                              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-90"
                            >
                              <Check className="h-5 w-5" />
                              Submit Consultation Request
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Estimator (Right sidebar) — only show for paths with pricing */}
              <div className="lg:col-span-4">
                {currentPath === "repair" && (
                  <div className="sticky top-24">
                    <LiveEstimator
                      services={repairServices}
                      partsValue={0}
                      wipeQuantity={repairWipeQty}
                      isITX={false}
                      nonModularPSU={false}
                    />
                  </div>
                )}
                {currentPath === "build-known" && (
                  <div className="sticky top-24">
                    <LiveEstimator
                      services={(() => {
                        const s = new Set<ServiceId>();
                        if (knownBuild) s.add(knownBuild);
                        knownPerformance.forEach((x) => s.add(x));
                        if (knownBuild) s.add("thermal"); // thermal paste always available for builds
                        return s;
                      })()}
                      partsValue={Math.max(0, Number(knownPartsValue) || 0)}
                      wipeQuantity={1}
                      isITX={knownITX}
                      nonModularPSU={knownNonModular}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
