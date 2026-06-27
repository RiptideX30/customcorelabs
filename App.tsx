import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Info, Lock, Youtube, X, MapPin, ShieldCheck } from "lucide-react";
import cclLogo from "@/assets/ccl-logo.jpg";
import IntakeForm from "./IntakeForm";

/* ---------------- Service catalog ---------------- */

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
  | "overclock"
  | "osinstall";

type Service = {
  id: ServiceId;
  title: string;
  priceLabel: string;
  short: string;
  details: string;
  category: "build" | "service" | "addon";
};

const SERVICES: Service[] = [
  {
    id: "basic",
    title: "Basic Build",
    priceLabel: "15% of parts",
    short: "Pure hardware assembly. No OS or drivers.",
    category: "build",
    details:
      "15% of the total parts value. Pure hardware assembly and standard cable routing. No OS or driver installation.",
  },
  {
    id: "ultimate",
    title: "Ultimate Build",
    priceLabel: "$159 flat · <$1,500",
    short: "Full assembly, OS provisioning, pro routing, stress test.",
    category: "build",
    details:
      "$159 flat rate for systems under $1,500, or 8% of parts value if total system is over $1,500. Structural component balancing, micro-vibration standoff fastening, clean-room compressed decontamination, BIOS flash optimization, custom fan curve profiling, unactivated OS provisioning, independent CPU/GPU load stress-testing. A $49 High-End Software Surcharge applies to Ultimate Builds over $1,500.",
  },
  {
    id: "refresh",
    title: "Desktop Refresh Bundle",
    priceLabel: "$59",
    short: "Deep clean, airflow re-route, thermal remediation.",
    category: "service",
    details:
      "Total electrostatic dust extraction, deep static pressure fin cleaning, structural cable management tightening, internal thermal boundary remediation.",
  },
  {
    id: "diagnostic",
    title: "Full System Diagnostic",
    priceLabel: "$40",
    short: "12-point check. 100% credited toward repairs.",
    category: "service",
    details:
      "12-point component stability check, power supply unit (PSU) voltage verification, RAM error scan, and operating system conflict analysis. 100% of this fee is credited back to your repair labor if you fix it with us.",
  },
  {
    id: "software",
    title: "Software Install",
    priceLabel: "$39",
    short: "Clean OS install + driver configuration.",
    category: "service",
    details:
      "Clean installation and updates for Windows, macOS, or Linux. System driver configuration. Note: Software activation keys must be provided by the client.",
  },
  {
    id: "cables",
    title: "Pro Cable Management",
    priceLabel: "$18",
    short: "Combs, velcro, precision routing.",
    category: "service",
    details:
      "Multi-point structural tie routing, mechanical separation of data and power channels, custom combs, layout design to maximize clear-path case static pressure.",
  },
  {
    id: "wipe",
    title: "Secure Drive Wipe",
    priceLabel: "$15",
    short: "Multi-pass military-grade erasure.",
    category: "service",
    details:
      "Military-grade multi-pass structural data erasure to completely protect personal privacy before selling or donating old storage hardware.",
  },
  {
    id: "upgrade",
    title: "Hardware Upgrade",
    priceLabel: "Quoted",
    short: "Component swap-in (GPU, RAM, storage).",
    category: "service",
    details:
      "Targeted component installation on an existing system. Pricing varies by part category. Basic upgrades (fans, RAM, NVMe SSDs): $8-25. Mid-level upgrades (CPU cooler, CPU, PSU, GPU, hard drives): $30-50. High maintenance (case, motherboard): $90-120+. If the part requires CPU or CPU cooler removal, add $10 thermal paste service. Pricing is per part in the highest category—if upgrading parts from multiple categories, you're only charged for the highest tier part.",
  },
  {
    id: "thermal",
    title: "Fresh Thermal Paste",
    priceLabel: "+ $10",
    short: "Add-on. Removal, cleanup, fresh application.",
    category: "addon",
    details:
      "Complete removal of degraded compound, standard isopropyl alcohol cleanup, and precision application of high-end aftermarket thermal paste to the CPU/GPU core.",
  },
  {
    id: "bios",
    title: "BIOS / Firmware Tuning",
    priceLabel: "$49",
    short: "Flash optimization, custom fan curves, voltage tuning.",
    category: "service",
    details:
      "Latest BIOS update installation, custom fan curve profiling for optimal acoustics and thermals, voltage optimization for stability and efficiency.",
  },
  {
    id: "validation",
    title: "24-Hour Bench Validation",
    priceLabel: "$89",
    short: "Extended stress testing and stability verification.",
    category: "service",
    details:
      "Full 24-hour burn-in testing with industry-standard tools. CPU and GPU thermal validation, memory stability testing with MemTest86, storage health verification, and comprehensive system stability reports.",
  },
  {
    id: "overclock",
    title: "Memory + CPU Overclock Profile",
    priceLabel: "$79",
    short: "Custom performance tuning for maximum throughput.",
    category: "service",
    details:
      "Manual memory timing optimization, CPU frequency and voltage tuning, stability validation across multiple workloads, custom performance profiles saved to BIOS.",
  },
  {
    id: "osinstall",
    title: "OS Install & Driver Provisioning",
    priceLabel: "$39",
    short: "Clean Windows/Linux install with all drivers.",
    category: "service",
    details:
      "Clean operating system installation (Windows or Linux), all motherboard and peripheral drivers installed and updated, Windows activation ready (key not included), bloatware-free configuration.",
  },
];

const SERVICE_MAP: Record<ServiceId, Service> = SERVICES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<ServiceId, Service>,
);

/* ---------------- Pricing math ---------------- */

function computeLineItems(active: Set<ServiceId>, partsValue: number) {
  const items: { id: ServiceId; label: string; amount: number }[] = [];

  if (active.has("basic")) {
    items.push({
      id: "basic",
      label: "Basic Build · 15% of parts",
      amount: +(partsValue * 0.15).toFixed(2),
    });
  }
  if (active.has("ultimate")) {
    if (partsValue > 1500) {
      items.push({
        id: "ultimate",
        label: "Ultimate Build · 8% of parts",
        amount: +(partsValue * 0.08).toFixed(2),
      });
      items.push({ id: "ultimate", label: "Software surcharge (>$1,500)", amount: 49 });
    } else {
      items.push({ id: "ultimate", label: "Ultimate Build · flat", amount: 159 });
    }
  }
  if (active.has("refresh"))
    items.push({ id: "refresh", label: "Desktop Refresh Bundle", amount: 59 });
  if (active.has("diagnostic"))
    items.push({ id: "diagnostic", label: "Full System Diagnostic", amount: 40 });
  if (active.has("software")) items.push({ id: "software", label: "Software Install", amount: 39 });
  if (active.has("cables")) items.push({ id: "cables", label: "Pro Cable Management", amount: 18 });
  if (active.has("wipe")) items.push({ id: "wipe", label: "Secure Drive Wipe", amount: 15 });
  if (active.has("upgrade"))
    items.push({ id: "upgrade", label: "Hardware Upgrade · TBD", amount: 0 });
  if (active.has("thermal"))
    items.push({ id: "thermal", label: "Fresh Thermal Paste (add-on)", amount: 10 });
  if (active.has("bios")) items.push({ id: "bios", label: "BIOS / Firmware Tuning", amount: 49 });
  if (active.has("validation"))
    items.push({ id: "validation", label: "24-Hour Bench Validation", amount: 89 });
  if (active.has("overclock"))
    items.push({ id: "overclock", label: "Memory + CPU Overclock Profile", amount: 79 });
  if (active.has("osinstall"))
    items.push({ id: "osinstall", label: "OS Install & Driver Provisioning", amount: 39 });

  const total = items.reduce((s, i) => s + i.amount, 0);
  return { items, total: +total.toFixed(2) };
}

/* ---------------- App ---------------- */

export default function App() {
  const [active, setActive] = useState<Set<ServiceId>>(new Set());
  const [partsValueStr, setPartsValueStr] = useState("");
  const [modal, setModal] = useState<ServiceId | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const partsValue = Math.max(0, Number(partsValueStr) || 0);

  /* ----- Compatibility logic ----- */
  const buildSelected = active.has("basic") || active.has("ultimate");
  const thermalEligible =
    active.has("diagnostic") || active.has("refresh") || active.has("upgrade");

  // Auto-prune incompatible selections whenever rules change.
  useEffect(() => {
    setActive((prev) => {
      const next = new Set(prev);
      let changed = false;
      // Ultimate locks every other option — prune all non-ultimate selections.
      if (next.has("ultimate")) {
        for (const id of Array.from(next)) {
          if (id !== "ultimate") {
            next.delete(id);
            changed = true;
          }
        }
      } else if (next.has("basic")) {
        if (next.has("refresh")) {
          next.delete("refresh");
          changed = true;
        }
        if (next.has("software")) {
          next.delete("software");
          changed = true;
        }
      }
      const eligible = next.has("diagnostic") || next.has("refresh") || next.has("upgrade");
      if (next.has("thermal") && !eligible) {
        next.delete("thermal");
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [active]);

  function isDisabled(id: ServiceId): boolean {
    // Ultimate Build locks every other option to prevent overcharging.
    if (active.has("ultimate") && id !== "ultimate") return true;
    if (id === "basic") return active.has("ultimate");
    if (id === "ultimate") return active.has("basic");
    if (id === "refresh" || id === "software") return buildSelected;
    if (id === "thermal") return !thermalEligible;
    return false;
  }

  function toggle(id: ServiceId) {
    if (isDisabled(id)) return;
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (id === "basic") next.delete("ultimate");
        if (id === "ultimate") next.delete("basic");
        next.add(id);
      }
      return next;
    });
  }

  const { items, total } = useMemo(
    () => computeLineItems(active, partsValue),
    [active, partsValue],
  );

  return (
    <main id="top" className="min-h-screen bg-background text-foreground antialiased">
      <Header />
      <Hero />
      <ServicesGrid
        active={active}
        toggle={toggle}
        isDisabled={isDisabled}
        openModal={(id) => setModal(id)}
      />
      <IntakeForm />
      <Disclosure />
      <Footer onOpenTerms={() => setTermsOpen(true)} />

      {modal && <DetailsModal service={SERVICE_MAP[modal]} onClose={() => setModal(null)} />}
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
    </main>
  );
}

/* ---------------- Header ---------------- */

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b hairline bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <img
            src={cclLogo}
            alt="Custom Core Labs logo"
            className="h-8 w-8 rounded-md object-cover"
          />
          <span className="text-[13px] font-semibold tracking-tight">
            Custom <span className="text-primary">Core</span> Labs
          </span>
        </a>
        <nav className="flex items-center gap-3 md:gap-6 text-[13px] text-slate-ink">
          <a className="hidden sm:inline hover:text-primary transition-colors" href="#services">
            Services
          </a>
          <a className="hidden sm:inline hover:text-primary transition-colors" href="#book">
            Book Appointment
          </a>
          <Link className="hidden sm:inline hover:text-primary transition-colors" to="/showcases">
            Showcases
          </Link>
          <Link className="hidden sm:inline hover:text-primary transition-colors" to="/comparison">
            Comparison
          </Link>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="YouTube channel"
            className="inline-flex items-center gap-1.5 rounded-md border hairline-strong bg-background px-2.5 py-1.5 text-[12px] font-medium text-slate-ink transition-colors hover:border-primary hover:text-primary"
          >
            <Youtube className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">YouTube</span>
          </a>
          <a
            href="#book"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground hover:opacity-90"
          >
            Book
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b hairline">
      <div className="absolute inset-0 lab-grid lab-grid-fade opacity-50" />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border hairline bg-background px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-slate-ink">
            Bench &nbsp;//&nbsp; Bushnell's Basin · Victor, NY
          </span>
        </div>
        <h1 className="mt-6 text-[40px] sm:text-[56px] md:text-[72px] font-semibold leading-[1] tracking-[-0.035em]">
          Desktop towers,
          <br />
          <span className="text-gradient-blue">built to spec.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[15px] md:text-[17px] leading-relaxed text-slate-mute">
          Labor-only desktop assembly, diagnostics, and optimization. You buy the parts at street
          price. We build, validate, and hand the system back ready to boot.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
          >
            See services
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#book"
            className="inline-flex items-center gap-2 rounded-md border hairline-strong bg-background px-5 py-3 text-[14px] font-medium text-slate-ink hover:border-primary hover:text-primary"
          >
            Get an estimate
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Services Grid ---------------- */

function ServicesGrid({
  active,
  toggle,
  isDisabled,
  openModal,
}: {
  active: Set<ServiceId>;
  toggle: (id: ServiceId) => void;
  isDisabled: (id: ServiceId) => boolean;
  openModal: (id: ServiceId) => void;
}) {
  const groups: { title: string; tag: string; ids: ServiceId[] }[] = [
    { title: "New Builds", tag: "A · choose one", ids: ["basic", "ultimate"] },
    {
      title: "Service & Repair",
      tag: "B · pick any",
      ids: ["refresh", "diagnostic", "software", "cables", "wipe", "upgrade"],
    },
    {
      title: "Performance & Tuning",
      tag: "C · pick any",
      ids: ["bios", "validation", "overclock", "osinstall"],
    },
    { title: "Add-on", tag: "D · conditional", ids: ["thermal"] },
  ];

  return (
    <section id="services" className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 01</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              Transparent line items
            </div>
          </div>
          <h2 className="text-[36px] md:text-[56px] font-semibold leading-[1] tracking-[-0.03em]">
            Services
          </h2>
        </div>

        {groups.map((g) => (
          <div key={g.title} className="mt-12">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <div className="flex items-center gap-3">
                <span className="mono flex h-6 items-center rounded-md border hairline-strong bg-background px-2 text-[10px] font-semibold text-primary">
                  {g.tag}
                </span>
                <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight">
                  {g.title}
                </h3>
              </div>
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                {g.ids.length.toString().padStart(2, "0")} {g.ids.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.ids.map((id) => (
                <ServiceCard
                  key={id}
                  service={SERVICE_MAP[id]}
                  active={active.has(id)}
                  disabled={isDisabled(id)}
                  onToggle={() => toggle(id)}
                  onDetails={() => openModal(id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  active,
  disabled,
  onToggle,
  onDetails,
}: {
  service: Service;
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
  onDetails: () => void;
}) {
  return (
    <div
      className={`relative w-full rounded-xl border bg-background p-6 transition-all ${
        disabled
          ? "hairline pointer-events-none opacity-40 bg-zinc-100"
          : active
            ? "border-primary shadow-[var(--shadow-glow)]"
            : "hairline-strong hover:border-primary/60 hover:shadow-[var(--shadow-elegant)]"
      }`}
    >
      <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute">
        <span>{service.id.toUpperCase()}</span>
        {disabled ? (
          <span className="inline-flex items-center gap-1 text-slate-mute">
            <Lock className="h-3 w-3" /> Unavailable
          </span>
        ) : active ? (
          <span className="text-primary">SELECTED ✓</span>
        ) : null}
      </div>

      <h4 className="mt-5 text-[18px] font-semibold tracking-tight">{service.title}</h4>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-mute">{service.short}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-[24px] font-semibold tracking-[-0.02em]">{service.priceLabel}</span>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={active}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-medium transition-all ${
            disabled
              ? "cursor-not-allowed border hairline text-slate-mute"
              : active
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "border hairline-strong bg-background text-slate-ink hover:border-primary hover:text-primary"
          }`}
        >
          {active ? <Check className="h-3.5 w-3.5" /> : null}
          {active ? "Added" : "Add to quote"}
        </button>
        <button
          type="button"
          onClick={onDetails}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border hairline-strong bg-background px-3 py-2 text-[12.5px] font-medium text-slate-ink transition-colors hover:border-primary hover:text-primary"
        >
          <Info className="h-3.5 w-3.5" />
          See Details
        </button>
      </div>

      {service.id === "ultimate" && (
        <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute">
          <span className="text-primary">↳</span> Over $1,500 → 8% of parts + $49 setup.
        </p>
      )}
      {service.id === "diagnostic" && (
        <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute">
          <span className="text-primary">↳</span> 100% credited to repair labor if hired.
        </p>
      )}
      {service.id === "thermal" && disabled && (
        <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute">
          <span className="text-primary">↳</span> Requires Diagnostic, Refresh, or Upgrade.
        </p>
      )}
    </div>
  );
}

/* ---------------- Details Modal ---------------- */

function DetailsModal({ service, onClose }: { service: Service; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Split into bullet items for nicer presentation.
  const bullets = service.details
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border hairline-strong bg-background p-6 sm:p-8 shadow-[var(--shadow-elegant)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border hairline-strong text-slate-ink hover:border-primary hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
          {service.category === "build"
            ? "Build"
            : service.category === "addon"
              ? "Add-on"
              : "Service"}{" "}
          · {service.priceLabel}
        </div>
        <h3 id="modal-title" className="mt-2 text-[24px] font-semibold tracking-[-0.02em]">
          {service.title}
        </h3>

        <ul className="mt-6 space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-slate-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ---------------- Footer ---------------- */

function Footer({ onOpenTerms }: { onOpenTerms: () => void }) {
  return (
    <footer className="bg-background border-t hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-10 md:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={cclLogo}
              alt="Custom Core Labs logo"
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="text-[13px] font-semibold tracking-tight">
              Custom <span className="text-primary">Core</span> Labs
            </span>
          </div>
          <div className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
            <MapPin className="h-3 w-3 text-primary" />
            Labor only · Victor, NY · Greater Rochester area
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-relaxed text-slate-mute">
            © {new Date().getFullYear()} Custom Core Labs. All hardware and activation keys supplied
            by client.
          </p>
          <button
            type="button"
            onClick={onOpenTerms}
            className="self-start text-[12px] font-medium text-primary underline-offset-4 hover:underline"
          >
            Terms & Conditions / Service Contract
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Disclosure Section ---------------- */

const DISCLOSURES: { title: string; bullets: string[] }[] = [
  {
    title: "1. Business Ownership & Experience Disclosure",
    bullets: [
      "Custom Core Labs is owned and operated by a dedicated 14-year-old desktop architecture technician based in Victor, NY.",
      "All technical engineering, cable routing, clean-room assembly, and software provisioning are executed directly by the specialist.",
      "Our build standards are validated by real-world system deployments, including our flagship 9-fan blackout baseline machine (Project 01: Midnight Aero).",
    ],
  },
  {
    title: "2. Zero-Upfront-Risk Payment Guarantee",
    bullets: [
      "We do not accept deposits, down payments, or hardware procurement funds.",
      "100% of the agreed-upon labor fee is due only after the system is fully assembled, provisioned, and verified running in your presence.",
      "Accepted payment rails are strictly digital (Zelle, Apple Pay via USAA) or cash on handoff. No credit card information is collected on this website.",
    ],
  },
  {
    title: "3. Secure Logistics & Custody Chain",
    bullets: [
      "All physical component drop-offs and finished tower pick-ups are handled via scheduled appointment at our secure commercial office location in Bushnell's Basin.",
      "Hardware is securely transported to and from the primary testing lab. Components are never left unattended or stored in unmonitored local environments.",
      "Customers choose a 10-minute drop-off or pickup window on selected appointment dates, with exact times available during booking.",
    ],
  },
  {
    title: "4. Component Liability & Hardware Failure (DOA) Protocol",
    bullets: [
      "Custom Core Labs assumes zero financial or legal liability for components that arrive broken from the retailer (Dead on Arrival / DOA).",
      "If a component fails to clear structural POST testing due to a factory defect, we will document the exact diagnostic code so you can easily return it to Amazon, Newegg, or Best Buy for a replacement.",
      "We do not manage retail warranties or return shipping labels on behalf of clients.",
    ],
  },
  {
    title: "5. Data Sovereignty & Software Privacy Policy",
    bullets: [
      "Custom Core Labs enforces a strict data privacy framework. During diagnostics or drive wipes, client storage arrays are never duplicated, backed up to network storage, or reviewed manually.",
      "Clean operating system installations (Windows/Linux/macOS) utilize vanilla, official Microsoft or open-source distributions. No third-party tracking tools or hidden software packages are ever introduced to your system.",
    ],
  },
];

function Disclosure() {
  return (
    <section id="disclosure" className="w-full bg-zinc-50 border-y hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 03</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              Operator transparency · public record
            </div>
          </div>
          <h2 className="text-[28px] md:text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
            Full Operational Disclosure & Transparency Statement
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {DISCLOSURES.map((d) => (
            <div
              key={d.title}
              className="w-full rounded-xl border border-primary/30 bg-background p-6 md:p-7"
            >
              <h3 className="text-[15.5px] font-semibold tracking-tight text-foreground">
                {d.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {d.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-slate-ink">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Terms Modal ---------------- */

const TERMS: { title: string; body: string }[] = [
  {
    title: "1. Labor-Only Service",
    body: "Custom Core Labs provides technical consulting and labor only; all hardware components must be supplied entirely by the client.",
  },
  {
    title: "2. Software Licensing Accountability",
    body: "Deployed operating systems are standard, unactivated distributions. Licensing and activation remain the sole legal responsibility of the client.",
  },
  {
    title: "3. Data Loss Indemnity Mitigation",
    body: "Clients are strictly required to perform complete data backups prior to servicing. Custom Core Labs assumes no liability for hard drive sector failures or structural data corruption during servicing.",
  },
  {
    title: "4. Fulfillment Logistics",
    body: "Drop-off and pickup transactions must conform strictly to scheduled windows at our secure Bushnell's Basin office location.",
  },
  {
    title: "5. Payment Terms",
    body: "100% of the labor fee is due only after the system is fully assembled, boots successfully, and you have verified operation and signed the approval form. No deposits or upfront payments are required.",
  },
];

function TermsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border hairline-strong bg-background p-6 sm:p-8 shadow-[var(--shadow-elegant)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border hairline-strong text-slate-ink hover:border-primary hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
          Service Contract · v1
        </div>
        <h3 id="terms-title" className="mt-2 text-[24px] font-semibold tracking-[-0.02em]">
          Terms & Conditions
        </h3>
        <p className="mt-2 text-[13px] text-slate-mute">
          Binding rules for all Custom Core Labs engagements.
        </p>

        <ol className="mt-6 space-y-5">
          {TERMS.map((t) => (
            <li key={t.title} className="rounded-lg border hairline bg-zinc-50 p-4">
              <h4 className="text-[14.5px] font-semibold tracking-tight text-foreground">
                {t.title}
              </h4>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-ink">{t.body}</p>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90"
        >
          Acknowledge & close
        </button>
      </div>
    </div>
  );
}
