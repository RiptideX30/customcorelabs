import { useMemo, useState, ReactNode } from "react";
import { z } from "zod";
import { Cpu, FileText, Link2, HelpCircle, X, Check, Minus, Plus, Info, Clock } from "lucide-react";

// Service definitions matching App.tsx
const NEW_BUILDS = [
  { id: "basic", title: "Basic Build", price: 0, priceLabel: "Starting at $99", desc: "Pure hardware assembly. No OS or drivers." },
  { id: "ultimate", title: "Ultimate Build", price: 139, priceLabel: "Starting at $139", desc: "Full assembly, OS provisioning, pro routing, 60-min stability stress test." },
] as const;

const SERVICE_REPAIR = [
  { id: "refresh", title: "Desktop Refresh Bundle", price: 49, desc: "Deep clean, airflow re-route, thermal remediation." },
  { id: "diagnostic", title: "Full System Diagnostic", price: 25, desc: "12-point check. 100% credited toward repairs." },
  { id: "software", title: "Software Install", price: 39, desc: "Clean OS install + driver configuration. macOS only for Apple devices — only needed if corruption or major issues occur." },
  { id: "cables", title: "Pro Cable Management", price: 18, desc: "Combs, velcro, precision routing." },
  { id: "wipe", title: "Secure Drive Wipe", price: 15, priceLabel: "$15/drive", desc: "Multi-pass military-grade erasure.", hasQuantity: true },
  { id: "upgrade", title: "Hardware Upgrade", price: 0, priceLabel: "Quoted", desc: "Component swap-in (GPU, RAM, storage)." },
] as const;

const PERFORMANCE_TUNING = [
  { id: "bios", title: "BIOS / Firmware Tuning", price: 35, desc: "Flash optimization, custom fan curves, voltage tuning." },
  { id: "validation", title: "24-Hour Bench Validation", price: 59, desc: "Extended stress testing and stability verification." },
  { id: "overclock", title: "Memory + CPU Overclock Profile", price: 49, desc: "Custom performance tuning for maximum throughput." },
] as const;

type ServiceId = typeof NEW_BUILDS[number]["id"] | typeof SERVICE_REPAIR[number]["id"] | typeof PERFORMANCE_TUNING[number]["id"];
type TabId = "new-builds" | "service-repair" | "performance-tuning";

const TABS: { id: TabId; label: string; tag: string }[] = [
  { id: "new-builds", label: "New Builds", tag: "A · choose one" },
  { id: "service-repair", label: "Service & Repair", tag: "B · pick any" },
  { id: "performance-tuning", label: "Performance & Tuning", tag: "C · pick any" },
];

function SubmittedState() {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-8 w-8" />
      </div>
      <h3 className="text-[24px] font-semibold tracking-tight">Lab Request Received.</h3>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-mute">
        A technician will reach out to you within 48 hours.
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

// PCPartPicker Instructions Modal Component
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
          <X className="h-4 w-4" />
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
                Visit <a href="https://pcpartpicker.com" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">pcpartpicker.com</a> and create a free account.
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
                Select each component category (CPU, GPU, Motherboard, etc.) and add your desired parts. The site will automatically check compatibility.
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
                Click the "Share" button at the top, then copy the public link. Paste it in the form above.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-6 rounded-md border hairline bg-secondary/40 px-4 py-3 text-[13px] text-slate-mute">
          <span className="font-medium text-primary">Tip:</span> Make sure your list is set to "Public" so we can view it.
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

// Case Details Explanation Modal
function CaseDetailsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
          <X className="h-4 w-4" />
        </button>

        <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
          Why we ask
        </div>
        <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em]">
          Case and Power Supply Details
        </h3>

        <div className="mt-6 space-y-5">
          <div>
            <h4 className="text-[15px] font-semibold text-foreground">Why We Ask About ITX (Small Form Factor) Cases</h4>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-mute">
              Small Form Factor (ITX) builds require a specialized level of precision and patience because there is zero margin for error inside a compact enclosure. Managing cables, routing thick power connectors, and orienting component brackets in a tight space drastically increases the assembly time and requires a highly strategic build order compared to a spacious standard tower. Asking this upfront ensures we allocate the proper bench hours and engineering focus required to deliver a flawless, high-airflow build without damaging fragile, densely packed components.
            </p>
            <div className="mt-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-[13px] font-medium text-primary">
              ITX / SFF builds: <strong>+$30</strong> labor surcharge
            </div>
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-foreground">Why We Ask About Non-Modular Power Supplies</h4>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-mute">
              Unlike modular power supplies that let us plug in only the specific cables your system actually needs, non-modular power supplies come with a thick, permanent bundle of every single potential cable attached. This means we have to manually hide, secure, and tightly route massive, unused cables inside the basement of your case while maintaining optimal airflow. We ask about this ahead of time so we can properly evaluate the structural cable management complexity and ensure your final build remains clean, organized, and perfectly ventilated.
            </p>
            <div className="mt-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-[13px] font-medium text-primary">
              Non-modular PSU: <strong>+$15</strong> labor surcharge
            </div>
          </div>
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

type ServiceCardData = {
  id: ServiceId;
  title: string;
  price: number;
  priceLabel?: string;
  desc: string;
  hasQuantity?: boolean;
};

// Service Card Component (used in all tabs)
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
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">Unavailable</span>
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
          {service.priceLabel || `$${service.price}`}
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

// Live Estimator Card Component
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
  isITX: string;
  nonModularPSU: string;
}) {
  const lineItems = useMemo(() => {
    const items: { label: string; amount: number }[] = [];

    if (services.has("basic")) {
      const basicAmount = partsValue < 1000 ? 99 : partsValue < 2000 ? 139 : partsValue < 2500 ? 179 : 229;
      items.push({ label: `Basic Build · $${basicAmount}`, amount: basicAmount });
    }
    if (services.has("ultimate")) {
      const ultimateAmount = partsValue < 1000 ? 139 : partsValue < 2000 ? 179 : +(partsValue * 0.08).toFixed(2) + 49;
      items.push({ label: `Ultimate Build · $${ultimateAmount}`, amount: ultimateAmount });
    }
    if (services.has("refresh")) items.push({ label: "Desktop Refresh Bundle", amount: 49 });
    if (services.has("diagnostic")) items.push({ label: "Full System Diagnostic", amount: 25 });
    if (services.has("software")) items.push({ label: "Software Install", amount: 39 });
    if (services.has("cables")) items.push({ label: "Pro Cable Management", amount: 18 });
    if (services.has("wipe")) items.push({ label: `Secure Drive Wipe × ${wipeQuantity}`, amount: 15 * wipeQuantity });
    if (services.has("upgrade")) items.push({ label: "Hardware Upgrade · TBD", amount: 0 });
    if (services.has("bios")) items.push({ label: "BIOS / Firmware Tuning", amount: 35 });
    if (services.has("validation")) items.push({ label: "24-Hour Bench Validation", amount: 59 });
    if (services.has("overclock")) items.push({ label: "Memory + CPU Overclock Profile", amount: 49 });

    // Surcharges
    if (isITX === "yes") items.push({ label: "ITX / SFF surcharge", amount: 30 });
    if (nonModularPSU === "yes") items.push({ label: "Non-modular PSU surcharge", amount: 15 });

    return items;
  }, [services, partsValue, wipeQuantity, isITX, nonModularPSU]);

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
      <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute">
        <span>Live estimate</span>
        <span className="text-primary">Real-time</span>
      </div>

      <div className="mt-6">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">Total labor</div>
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

      <div className="mt-6 rounded-md border hairline bg-secondary/40 px-4 py-3 text-[12.5px] leading-relaxed text-slate-ink">
        <span className="font-medium text-primary">Note:</span> Final pricing is determined by your parts budget tier and selected services.
      </div>
    </div>
  );
}

export default function IntakeForm() {
  const [activeTab, setActiveTab] = useState<TabId>("new-builds");
  const [selectedBuild, setSelectedBuild] = useState<ServiceId | null>(null);
  const [selectedServices, setSelectedServices] = useState<Set<ServiceId>>(new Set());
  const [selectedPerformance, setSelectedPerformance] = useState<Set<ServiceId>>(new Set());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pcpp, setPcpp] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [noPCPP, setNoPCPP] = useState(false);
  const [showPCPPModal, setShowPCPPModal] = useState(false);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [partsValueStr, setPartsValueStr] = useState("");
  const [wipeQuantity, setWipeQuantity] = useState(1);
  const [timeSlot, setTimeSlot] = useState("");
  const [isITX, setIsITX] = useState("");
  const [nonModularPSU, setNonModularPSU] = useState("");

  const partsValue = Math.max(0, Number(partsValueStr) || 0);

// Auto-format phone number: (585) 555-0142
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

  // Combine all selected services for the estimator
  const allSelectedServices = useMemo(() => {
    const combined = new Set<ServiceId>();
    if (selectedBuild) combined.add(selectedBuild);
    selectedServices.forEach((s) => combined.add(s));
    selectedPerformance.forEach((s) => combined.add(s));
    return combined;
  }, [selectedBuild, selectedServices, selectedPerformance]);

  const toggleBuild = (id: ServiceId) => {
    setSelectedBuild((prev) => (prev === id ? null : id));
  };

  // When ultimate build is selected, only "wipe" is available in Service & Repair
  const isServiceDisabled = (id: ServiceId): boolean => {
    return selectedBuild === "ultimate" && id !== "wipe";
  };

  const toggleService = (id: ServiceId) => {
    if (isServiceDisabled(id)) return;
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (id === "wipe") setWipeQuantity(1);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePerformance = (id: ServiceId) => {
    setSelectedPerformance((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleWipeQuantityChange = (delta: number) => {
    setWipeQuantity((prev) => Math.max(1, prev + delta));
  };

  const submit = async () => {
    const check = z.object({
      name: z.string().trim().min(2),
      email: z.string().trim().email(),
      phone: z.string().trim().min(10),
      symptoms: z.string().trim().max(2000),
    }).safeParse({ name, email, phone, pcpp: noPCPP ? "" : pcpp, symptoms });

    if (!check.success) {
      const e: Record<string, string> = {};
      for (const issue of check.error.issues) {
        e[issue.path[0] as string] = issue.message;
      }
      setErrors(e);
      return;
    }

    if (!consent) {
      setErrors((prev) => ({ ...prev, consent: "You must accept the terms to continue" }));
      return;
    }

    setErrors({});

    const activeServicesText = [...allSelectedServices]
      .map((id) => {
        const srv = [...NEW_BUILDS, ...SERVICE_REPAIR, ...PERFORMANCE_TUNING].find((s) => s.id === id);
        return srv ? srv.title : id;
      })
      .join(", ");

    // Get Turnstile token for spam protection
    const turnstileToken = (window as any).turnstile?.getResponse();

    const payload = {
      "customer-name": name,
      "customer-phone": phone,
      "customer-email": email,
      "pcpartpicker-url": noPCPP ? "N/A - Customer will provide parts list later" : pcpp,
      "parts-value": `$${partsValue.toFixed(2)}`,
      "symptoms-details": symptoms,
      "selected-services": activeServicesText || "None selected",
      "preferred-time-slot": timeSlot || "Not specified",
      "itx-sff-case": isITX || "Not specified",
      "non-modular-psu": nonModularPSU || "Not specified",
      "payment-terms": "Zero-Deposit Guarantee — payment due upon successful POST verification at pickup",
      "cf-turnstile-response": turnstileToken || "",
    };

    try {
      const response = await fetch("https://submit-form.cdwojick.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
        // Scroll to the section so the user sees the success state
        setTimeout(() => {
          document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        const data = await response.json();
        alert("Submission error: " + (data.error || "Please try again."));
      }
    } catch (error) {
      alert("Error sending details to server. Please check your internet connection.");
    }
  };

if (submitted) {
  // 1. Safely format the user data variables for a web URL string
  const cleanName  = encodeURIComponent(name || "Client");
  const cleanEmail = encodeURIComponent(email || "");

  // 2. Direct the browser to seamlessly open your live booking calendar
  //    Replace YOUR-CAL-LINK with your actual Cal.com booking slug when ready.
  window.location.href = `https://cal.com/YOUR-CAL-LINK?name=${cleanName}&email=${cleanEmail}`;

  // 3. Fallback blank view to hold the screen while the page loads the redirect
  return null;
}

  return (
    <section id="book" className="border-b hairline bg-secondary/30">
      <PCPPInstructionsModal isOpen={showPCPPModal} onClose={() => setShowPCPPModal(false)} />
      <CaseDetailsModal isOpen={showCaseDetails} onClose={() => setShowCaseDetails(false)} />
      <div className="mx-auto max-w-[1280px] px-8 py-28">
        <div className="grid grid-cols-12 items-end gap-8">
          <div className="col-span-3">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 05</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">Project intake · Form 003</div>
          </div>
          <h2 className="col-span-9 text-[56px] font-semibold leading-none tracking-[-0.03em]">Start a project</h2>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]">
              <div className="px-8 py-8">
                {/* Tab Navigation */}
                <div className="flex gap-2 border-b hairline pb-4">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-slate-mute hover:text-slate-ink hover:bg-secondary/40"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {/* Tab 1: New Builds */}
                  {activeTab === "new-builds" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                          {TABS[0].tag}
                        </span>
                        <span className="text-[13px] text-slate-mute">Choose one build type</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {NEW_BUILDS.map((s) => (
                          <ServiceCard
                            key={s.id}
                            service={s}
                            selected={selectedBuild === s.id}
                            onSelect={() => toggleBuild(s.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Service & Repair */}
                  {activeTab === "service-repair" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                          {TABS[1].tag}
                        </span>
                        <span className="text-[13px] text-slate-mute">Pick any services</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SERVICE_REPAIR.map((s) => (
                          <ServiceCard
                            key={s.id}
                            service={s}
                            selected={selectedServices.has(s.id)}
                            onSelect={() => toggleService(s.id)}
                            disabled={isServiceDisabled(s.id)}
                            quantity={s.id === "wipe" ? wipeQuantity : undefined}
                            onQuantityChange={s.id === "wipe" ? handleWipeQuantityChange : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Performance & Tuning */}
                  {activeTab === "performance-tuning" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                          {TABS[2].tag}
                        </span>
                        <span className="text-[13px] text-slate-mute">Pick any services</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {PERFORMANCE_TUNING.map((s) => (
                          <ServiceCard
                            key={s.id}
                            service={s}
                            selected={selectedPerformance.has(s.id)}
                            onSelect={() => togglePerformance(s.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact & Technical Info */}
                <div className="mt-10 border-t hairline pt-8">
                  <StepHeader index="04" title="Contact & Technical Details" />
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <FieldLabel icon={Cpu}>Customer Name</FieldLabel>
                      <input
                        type="text"
                        className="w-full rounded-[1.25rem] border border-slate-200 bg-white/95 px-4 py-3 text-[14px] text-slate-950 placeholder:text-slate-400 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.35)] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="First & Last Name"
                      />
                      {errors.name && <FieldHint>{errors.name}</FieldHint>}
                    </div>
                    <div>
                      <FieldLabel icon={Cpu}>Phone Number</FieldLabel>
                      <input
                        type="tel"
                        className="w-full rounded-[1.25rem] border border-slate-200 bg-white/95 px-4 py-3 text-[14px] text-slate-950 placeholder:text-slate-400 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.35)] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="(555) 000-0000"
                      />
                      {errors.phone && <FieldHint>{errors.phone}</FieldHint>}
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel icon={Cpu}>Email Address</FieldLabel>
                      <input
                        type="email"
                        className="w-full rounded-[1.25rem] border border-slate-200 bg-white/95 px-4 py-3 text-[14px] text-slate-950 placeholder:text-slate-400 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.35)] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                      />
                      {errors.email && <FieldHint>{errors.email}</FieldHint>}
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel icon={FileText}>Total Parts Value (USD)</FieldLabel>
                      <div className="flex items-center gap-2 rounded-[1.25rem] border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.18)] transition focus-within:border-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/20">
                        <span className="mono text-[14px] text-slate-mute">$</span>
                        <input
                          type="text"
                          className="w-full bg-transparent text-[14px] text-slate-950 placeholder:text-slate-mute/70 focus:outline-none"
                          value={partsValueStr}
                          onChange={(e) => setPartsValueStr(e.target.value.replace(/[^0-9.]/g, "").slice(0, 9))}
                          placeholder="e.g. 1850.00"
                        />
                      </div>
                      <p className="mt-2 text-[12px] text-slate-mute">
                        <Info className="inline h-3 w-3 mr-1" />
                        You can find your total parts value using <a href="https://pcpartpicker.com" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">PCPartPicker</a>
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel icon={Link2}>PCPartPicker Link</FieldLabel>
                        <button
                          type="button"
                          onClick={() => setShowPCPPModal(true)}
                          className="inline-flex items-center gap-1 rounded-md border hairline-strong bg-background px-3 py-1.5 text-[12px] font-medium text-primary hover:border-primary hover:text-primary transition-colors"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          How to create one
                        </button>
                      </div>
                      <input
                        type="url"
                        className="w-full rounded-[1.25rem] border border-slate-200 bg-white/95 px-4 py-3 text-[14px] text-slate-950 placeholder:text-slate-mute/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        value={pcpp}
                        onChange={(e) => setPcpp(e.target.value)}
                        placeholder="https://pcpartpicker.com/list/..."
                        disabled={noPCPP}
                      />
                      {errors.pcpp && <FieldHint>{errors.pcpp}</FieldHint>}
                      <label className="mt-4 inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={noPCPP}
                          onChange={(e) => {
                            setNoPCPP(e.target.checked);
                            if (e.target.checked) setPcpp("");
                          }}
                          className="rounded border-slate-strong bg-background text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-sm text-slate-mute">I don't have a PCPartPicker link</span>
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel icon={FileText}>Describe your project or issues</FieldLabel>
                      <textarea
                        className="w-full rounded-[1.25rem] border border-slate-200 bg-white/95 px-4 py-3 text-[14px] text-slate-950 placeholder:text-slate-mute/70 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.25)] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Example: Building a new gaming PC, need help with cable management and BIOS setup..."
                        rows={4}
                      />
                      {errors.symptoms && <FieldHint>{errors.symptoms}</FieldHint>}
                    </div>

                    <div className="sm:col-span-2">
                      <FieldLabel icon={Info}>
                        Case and Power Supply Details
                        <button
                          type="button"
                          onClick={() => setShowCaseDetails(true)}
                          className="ml-2 text-[11px] font-medium text-primary underline underline-offset-2 hover:opacity-80"
                        >
                          See why we ask
                        </button>
                      </FieldLabel>
                      <p className="mb-3 text-[12.5px] leading-relaxed text-slate-mute">
                        These help us ensure accurate labor quotes for your specific hardware configuration.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                            Is this an ITX / Small Form Factor (SFF) case?
                          </label>
                          <div className="flex gap-4">
                            <label className="inline-flex items-center gap-1.5 text-[13px] text-slate-ink">
                              <input
                                type="radio"
                                name="itx"
                                value="yes"
                                checked={isITX === "yes"}
                                onChange={() => setIsITX("yes")}
                                className="rounded-full border-slate-strong text-primary focus:ring-primary h-4 w-4"
                              />
                              Yes
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-[13px] text-slate-ink">
                              <input
                                type="radio"
                                name="itx"
                                value="no"
                                checked={isITX === "no"}
                                onChange={() => setIsITX("no")}
                                className="rounded-full border-slate-strong text-primary focus:ring-primary h-4 w-4"
                              />
                              No
                            </label>
                          </div>
                          {isITX === "yes" && (
                            <p className="mt-1.5 text-[12px] font-medium text-primary">+$30 ITX surcharge</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                            Does the system use a non-modular power supply?
                          </label>
                          <div className="flex gap-4">
                            <label className="inline-flex items-center gap-1.5 text-[13px] text-slate-ink">
                              <input
                                type="radio"
                                name="psu"
                                value="yes"
                                checked={nonModularPSU === "yes"}
                                onChange={() => setNonModularPSU("yes")}
                                className="rounded-full border-slate-strong text-primary focus:ring-primary h-4 w-4"
                              />
                              Yes
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-[13px] text-slate-ink">
                              <input
                                type="radio"
                                name="psu"
                                value="no"
                                checked={nonModularPSU === "no"}
                                onChange={() => setNonModularPSU("no")}
                                className="rounded-full border-slate-strong text-primary focus:ring-primary h-4 w-4"
                              />
                              No
                            </label>
                          </div>
                          {nonModularPSU === "yes" && (
                            <p className="mt-1.5 text-[12px] font-medium text-primary">+$15 non-modular PSU surcharge</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="rounded border-slate-strong bg-background text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-sm text-slate-ink">
                          I agree to the Custom Core Labs Service Agreement. I understand that 100% of labor is due upon visual confirmation of a successful system POST/boot at pickup.
                        </span>
                      </label>
                      {errors.consent && <FieldHint>{errors.consent}</FieldHint>}
                      <p className="mt-3 text-[12.5px] leading-relaxed text-slate-mute">
                        By submitting a build request, you agree to the terms of the Custom Core Labs Service Agreement, which will be co-signed with a parent or guardian during your 15-minute appointment at our Bushnell's Basin office. Clients under 18 must bring a parent or legal guardian to sign the contract.
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="cf-turnstile" {...{ "data-sitekey": "0x4AAAAAADbwqkm9C4wJZpUt" }} />
                    </div>
                    <div className="sm:col-span-2 mt-6">
                      <div className="rounded-xl border hairline-strong bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-[var(--shadow-elegant)]">
                        <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                          Ready to launch
                        </div>
                        <p className="mt-1 text-[13px] text-slate-mute">
                          By submitting you agree to the terms above. We'll reach out within 48 hours.
                        </p>
                        <button
                          type="button"
                          onClick={submit}
                          disabled={!consent}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                          <Check className="h-5 w-5" />
                          Submit Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Estimator - Bottom Right Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <LiveEstimator services={allSelectedServices} partsValue={partsValue} wipeQuantity={wipeQuantity} isITX={isITX} nonModularPSU={nonModularPSU} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}