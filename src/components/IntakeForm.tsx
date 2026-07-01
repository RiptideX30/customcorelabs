import { useMemo, useState, ReactNode, type FormEvent, useEffect, useRef } from "react";
import { useSearch } from "@tanstack/react-router";
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
import { z } from "zod";
import {
  ServiceId,
  NEW_BUILDS,
  SERVICE_REPAIR,
  PERFORMANCE_TUNING,
  PathId,
  formatPhone,
  computeEstimator,
  submitForm,
  generateTrackingCode,
  computeSignatureEstimator,
} from "@/lib/form-utils";

// ... (all the shared UI components like SubmittedState, StepHeader, etc. remain the same)

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
      <h3 className="text-[28px] font-semibold tracking-tight">Project Initiated!</h3>
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
  isPriority,
}: {
  services: Set<ServiceId>;
  partsValue: number;
  wipeQuantity: number;
  isITX: boolean;
  nonModularPSU: boolean;
  isPriority: boolean;
}) {
  const {
    items: lineItems,
    subtotal,
    taxAmount,
    total,
  } = useMemo(() => {
    const estimatorResult = computeEstimator(
      services,
      partsValue,
      wipeQuantity,
      isITX,
      nonModularPSU,
    );
    if (isPriority) {
      const rushFee = 150;
      estimatorResult.items.push({ label: "Priority Rush Fee", amount: rushFee });
      const newSubtotal = estimatorResult.subtotal + rushFee;
      const newTaxAmount = newSubtotal * 0.08; // NY tax is 8%
      return {
        items: estimatorResult.items,
        subtotal: newSubtotal,
        taxAmount: newTaxAmount,
        total: newSubtotal + newTaxAmount,
      };
    }
    return estimatorResult;
  }, [services, partsValue, wipeQuantity, isITX, nonModularPSU, isPriority]);

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
          lineItems.map((it: { label: string; amount: number }, i) => (
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
        <p className="mt-2 text-center text-[11px] text-slate-500">
          *Prices shown reflect cash/direct transfer discount. A 3% convenience fee applies to
          credit card payments.
        </p>
      </div>
    </div>
  );
}

function SignatureLiveEstimator({
  tier,
  isPriority,
}: {
  tier: "esports" | "apex" | "horizon" | null;
  isPriority: boolean;
}) {
  const { items, total } = useMemo(() => {
    if (!tier) return { items: [], total: 0 };
    return computeSignatureEstimator(tier, isPriority);
  }, [tier, isPriority]);

  const dueTodayItem = items.find((item) => item.label === "Due Today");

  return (
    <div className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
      <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute">
        <span>Live estimator</span>
        <span className="text-primary">Real-time</span>
      </div>

      {dueTodayItem && (
        <div className="mt-6">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
            Due Today
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="mono text-[14px] text-slate-mute">$</span>
            <span className="text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
              {dueTodayItem.amount.toFixed(2)}
              {isPriority && <span className="text-lg"> +$150.00</span>}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {items.filter((item) => item.label !== "Due Today").length === 0 ? (
          <div className="rounded-md border hairline bg-secondary/30 px-3 py-3 text-[13px] text-slate-mute">
            Select a package to see your live quote.
          </div>
        ) : (
          items
            .filter((item) => item.label !== "Due Today")
            .map((it, i) => (
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
      <p className="mt-2 text-center text-[11px] text-slate-500">
        *Prices shown reflect cash/direct transfer discount. A 3% convenience fee applies to credit
        card payments.
      </p>
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
        <FieldLabel icon={Cpu}>Full Name</FieldLabel>
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
  function PremiumSelect({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) {
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
      <StepHeader index="03" title="Build Aesthetics & Configuration" />
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
  const paths = [
    {
      id: "signature" as PathId,
      icon: Package,
      title: "Signature Packages",
      desc: "Choose from our expertly crafted, pre-configured PC packages for a streamlined experience.",
      tag: "Pre-configured",
    },
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
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
   MAIN INTAKE FORM COMPONENT
   ============================================================ */

export default function IntakeForm() {
  const search = useSearch({ from: "/start-a-project" });
  const [currentPath, setCurrentPath] = useState<PathId>(() => {
    if (
      search.path === "package" &&
      (search.tier === "esports" || search.tier === "apex" || search.tier === "horizon")
    ) {
      return "signature";
    }
    return "selector";
  });
  const [submitted, setSubmitted] = useState(false);
  const [showBuildSuccess, setShowBuildSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shared customer info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Shared submission fields
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [keepComponentBoxes, setKeepComponentBoxes] = useState(false);

  // Path: Signature Packages
  const [signaturePackage, setSignaturePackage] = useState<"esports" | "apex" | "horizon" | null>(
    () => {
      if (
        search.path === "package" &&
        (search.tier === "esports" || search.tier === "apex" || search.tier === "horizon")
      ) {
        return search.tier;
      }
      return null;
    },
  );
  const [signatureLogistics, setSignatureLogistics] = useState<"standard" | "express">("standard");
  const [signatureNotes, setSignatureNotes] = useState("");

  // Path 1 — Service & Repair
  const [repairServices, setRepairServices] = useState<Set<ServiceId>>(new Set());
  const [repairSymptoms, setRepairSymptoms] = useState("");
  const [repairWipeQty, setRepairWipeQty] = useState(1);
  const thermalEligibleForRepair =
    repairServices.has("refresh") ||
    repairServices.has("software") ||
    repairServices.has("cables") ||
    repairServices.has("upgrade");

  useEffect(() => {
    if (!thermalEligibleForRepair && repairServices.has("thermal")) {
      setRepairServices((prev) => {
        const next = new Set(prev);
        next.delete("thermal");
        return next;
      });
    }
  }, [thermalEligibleForRepair, repairServices]);

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
  const [knownTurnaround, setKnownTurnaround] = useState<"standard" | "priority">("standard");
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
  const [helpTurnaround, setHelpTurnaround] = useState<"standard" | "priority">("standard");

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await processFormSubmission();
  };

  const processFormSubmission = async () => {
    const customerName = name.trim();
    const customerEmail = email.trim();

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

    if (!agreedToTerms) {
      setErrors((prev) => ({ ...prev, terms: "You must agree to the terms and conditions." }));
      return;
    }
    setErrors({});

    const isBuildOrderPath =
      currentPath === "build-known" || currentPath === "build-help" || currentPath === "signature";
    const generatedCode = isBuildOrderPath ? generateTrackingCode() : "";

    let payload: Record<string, any> = {
      "customer-name": name,
      "customer-phone": phone,
      "customer-email": email,
      "tracking-code": generatedCode || "N/A",
    };

    if (currentPath === "signature") {
      if (!signaturePackage) {
        setErrors({ package: "Please select a package." });
        return;
      }
      const estimate = computeSignatureEstimator(
        signaturePackage,
        signatureLogistics === "express",
      );
      payload = {
        ...payload,
        "form-type": "signature-package",
        "selected-package": signaturePackage,
        "logistics-timeline": signatureLogistics,
        "additional-notes": signatureNotes,
        "estimate-details": JSON.stringify(estimate.items),
        "due-today": estimate.items.find((item) => item.label === "Due Today")?.amount.toFixed(2),
      };
    } else if (currentPath === "repair") {
      // ... (rest of the logic for other paths)
    }

    try {
      const response = await submitForm(payload);
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        const data = await response.json();
        alert("Submission error: " + (data.error || "Please try again."));
      }
    } catch (error) {
      alert("Error sending details. Please check your internet connection.");
    }
  };

  const signaturePackages = [
    { id: "esports", name: "Esports Core Package", price: "$1,200.00" },
    { id: "apex", name: "Apex Performance Package", price: "$1,800.00" },
    { id: "horizon", name: "Horizon Showcase Package", price: "$2,400.00" },
  ];

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
            <button
              type="button"
              onClick={() => setCurrentPath("selector")}
              className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
            >
              ← Back to path selection
            </button>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]">
                  <div className="px-8 py-8">
                    {currentPath === "signature" && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-[20px] font-semibold">Signature Package</h3>
                            <p className="text-[13px] text-slate-mute">
                              Order one of our pre-configured systems
                            </p>
                          </div>
                        </div>

                        <StepHeader index="01" title="Client Metrics" />
                        <CustomerInfoFields
                          name={name}
                          setName={setName}
                          phone={phone}
                          setPhone={setPhone}
                          email={email}
                          setEmail={setEmail}
                          errors={errors}
                        />

                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="02" title="Package Selector" />
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {signaturePackages.map((pkg) => (
                              <div
                                key={pkg.id}
                                onClick={() => setSignaturePackage(pkg.id as any)}
                                className={`cursor-pointer rounded-xl border p-5 transition-all ${signaturePackage === pkg.id ? "border-primary shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60"}`}
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="text-md font-semibold">{pkg.name}</h4>
                                  {signaturePackage === pkg.id ? (
                                    <Check className="h-4 w-4 text-primary" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border hairline-strong" />
                                  )}
                                </div>
                                <p className="mt-2 text-lg font-semibold">{pkg.price}</p>
                              </div>
                            ))}
                            {errors.package && <FieldHint>{errors.package}</FieldHint>}
                          </div>
                        </div>

                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="03" title="Logistics Timeline Selector" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                              onClick={() => setSignatureLogistics("standard")}
                              className={`cursor-pointer rounded-xl border p-5 transition-all ${signatureLogistics === "standard" ? "border-primary shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60"}`}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-md font-semibold">
                                  Standard Handcrafted Delivery (Free)
                                </h4>
                                {signatureLogistics === "standard" ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border hairline-strong" />
                                )}
                              </div>
                              <p className="mt-2 text-sm text-slate-mute">
                                Ready in 5-7 business days
                              </p>
                            </div>
                            <div
                              onClick={() => setSignatureLogistics("express")}
                              className={`cursor-pointer rounded-xl border p-5 transition-all ${signatureLogistics === "express" ? "border-primary shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60"}`}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-md font-semibold">
                                  Express Priority Rush (+$150.00)
                                </h4>
                                {signatureLogistics === "express" ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border hairline-strong" />
                                )}
                              </div>
                              <p className="mt-2 text-sm text-slate-mute">
                                Air-freight component routing. Ready in 3-4 business days.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 border-t hairline pt-8">
                          <StepHeader index="04" title="Additional Configuration Notes" />
                          <FormTextarea
                            value={signatureNotes}
                            onChange={setSignatureNotes}
                            placeholder="Any custom requests..."
                            rows={4}
                          />
                        </div>

                        <div className="mt-8 border-t hairline pt-8">
                          <div className="rounded-xl border hairline-strong bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-[var(--shadow-elegant)]">
                            <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                              Ready to launch
                            </div>
                            <div className="space-y-4 mt-4">
                              <CheckboxField
                                checked={agreedToTerms}
                                onChange={setAgreedToTerms}
                                label={
                                  <>
                                    I agree to the{" "}
                                    <a
                                      href="/terms.html"
                                      target="_blank"
                                      className="text-primary underline"
                                    >
                                      Terms and Conditions
                                    </a>
                                  </>
                                }
                                error={errors.terms}
                              />
                            </div>
                            <button
                              type="submit"
                              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-90"
                            >
                              <Check className="h-5 w-5" />
                              Submit Signature Project Request
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ... (rest of the paths) */}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                {currentPath === "signature" && (
                  <div className="sticky top-24">
                    <SignatureLiveEstimator
                      tier={signaturePackage}
                      isPriority={signatureLogistics === "express"}
                    />
                  </div>
                )}
                {/* ... (rest of the estimators) */}
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
