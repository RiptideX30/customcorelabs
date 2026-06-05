import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  Info,
  Lock,
  Youtube,
  X,
  MapPin,
  ShieldCheck,
  Cpu,
  Clock,
  Handshake,
  Warehouse,
  Wrench,
  Star,
  MessageCircle,
} from "lucide-react";
import cclLogo from "@/assets/ccl-logo.jpg";
import buildPhoto from "@/assets/builds/midnight-aero.jpg";
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
  | "overclock";

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
    priceLabel: "Starting at $99",
    short: "Pure hardware assembly. No OS or drivers.",
    category: "build",
    details:
      "Pure hardware assembly and standard cable routing. No OS or driver installation.",
  },
  {
    id: "ultimate",
    title: "Ultimate Build",
    priceLabel: "Starting at $139",
    short: "Full assembly, OS provisioning, pro routing, 60-min stability stress test.",
    category: "build",
    details:
      "Full assembly, OS provisioning, pro routing, 60-min stress testing, structural component balancing, and BIOS optimization.",
  },
  {
    id: "refresh",
    title: "Desktop Refresh Bundle",
    priceLabel: "$49",
    short: "Deep clean, airflow re-route, thermal remediation.",
    category: "service",
    details:
      "Total electrostatic dust extraction, deep static pressure fin cleaning, structural cable management tightening, internal thermal boundary remediation.",
  },
  {
    id: "diagnostic",
    title: "Full System Diagnostic",
    priceLabel: "$25",
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
    priceLabel: "$35",
    short: "Flash optimization, custom fan curves, voltage tuning.",
    category: "service",
    details:
      "Latest BIOS update installation, custom fan curve profiling for optimal acoustics and thermals, voltage optimization for stability and efficiency.",
  },
  {
    id: "validation",
    title: "24-Hour Bench Validation",
    priceLabel: "$59",
    short: "Extended stress testing and stability verification.",
    category: "service",
    details:
      "Full 24-hour burn-in testing with industry-standard tools. CPU and GPU thermal validation, memory stability testing with MemTest86, storage health verification, and comprehensive system stability reports.",
  },
  {
    id: "overclock",
    title: "Memory + CPU Overclock Profile",
    priceLabel: "$49",
    short: "Custom performance tuning for maximum throughput.",
    category: "service",
    details:
      "Manual memory timing optimization, CPU frequency and voltage tuning, stability validation across multiple workloads, custom performance profiles saved to BIOS.",
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
    const basicAmount = partsValue < 1000 ? 99 : partsValue < 2000 ? 139 : partsValue < 2500 ? 179 : 229;
    items.push({ id: "basic", label: `Basic Build · $${basicAmount}`, amount: basicAmount });
  }
  if (active.has("ultimate")) {
    const ultimateAmount = partsValue < 1000 ? 139 : partsValue < 2000 ? 179 : +(partsValue * 0.08).toFixed(2) + 49;
    items.push({ id: "ultimate", label: `Ultimate Build · $${ultimateAmount}`, amount: ultimateAmount });
  }
  if (active.has("refresh")) items.push({ id: "refresh", label: "Desktop Refresh Bundle", amount: 49 });
  if (active.has("diagnostic")) items.push({ id: "diagnostic", label: "Full System Diagnostic", amount: 25 });
  if (active.has("software")) items.push({ id: "software", label: "Software Install", amount: 39 });
  if (active.has("cables")) items.push({ id: "cables", label: "Pro Cable Management", amount: 18 });
  if (active.has("wipe")) items.push({ id: "wipe", label: "Secure Drive Wipe", amount: 15 });
  if (active.has("upgrade")) items.push({ id: "upgrade", label: "Hardware Upgrade · TBD", amount: 0 });
  if (active.has("thermal")) items.push({ id: "thermal", label: "Fresh Thermal Paste (add-on)", amount: 10 });
  if (active.has("bios")) items.push({ id: "bios", label: "BIOS / Firmware Tuning", amount: 35 });
  if (active.has("validation")) items.push({ id: "validation", label: "24-Hour Bench Validation", amount: 59 });
  if (active.has("overclock")) items.push({ id: "overclock", label: "Memory + CPU Overclock Profile", amount: 49 });

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

  const buildSelected = active.has("basic") || active.has("ultimate");
  const thermalEligible = active.has("diagnostic") || active.has("refresh") || active.has("upgrade");

  useEffect(() => {
    setActive((prev) => {
      const next = new Set(prev);
      let changed = false;
      if (next.has("ultimate")) {
        for (const id of Array.from(next)) {
          if (id !== "ultimate") { next.delete(id); changed = true; }
        }
      } else if (next.has("basic")) {
        if (next.has("refresh")) { next.delete("refresh"); changed = true; }
        if (next.has("software")) { next.delete("software"); changed = true; }
      }
      const eligible = next.has("diagnostic") || next.has("refresh") || next.has("upgrade");
      if (next.has("thermal") && !eligible) { next.delete("thermal"); changed = true; }
      return changed ? next : prev;
    });
  }, [active]);

  function isDisabled(id: ServiceId): boolean {
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

  const { items, total } = useMemo(() => computeLineItems(active, partsValue), [active, partsValue]);

  return (
    <main id="top" className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      <Header />
      <Hero />
      <ZeroDepositBanner />
      <ProofSection />
      <ProcessSection />
      <PricingTable />
      <TestimonialSection />
      <GeographySection />
      <FAQSection />
      <ServicesGrid active={active} toggle={toggle} isDisabled={isDisabled} openModal={(id) => setModal(id)} />
      <QuickContact />
      <IntakeForm />
      <ServiceAgreement />
      <Footer onOpenTerms={() => setTermsOpen(true)} />
      {modal && <DetailsModal service={SERVICE_MAP[modal]} onClose={() => setModal(null)} />}
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
    </main>
  );
}

/* ---------------- Header ---------------- */

function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-foreground/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <img src={cclLogo} alt="Custom Core Labs logo" className="h-8 w-8 rounded-md object-cover" />
          <span className="text-[13px] font-semibold tracking-tight text-white">
            Custom <span className="text-primary">Core</span> Labs
          </span>
        </a>
        <nav className="flex items-center gap-3 md:gap-6 text-[13px] text-white/70">
          <a className="hidden sm:inline hover:text-white transition-colors" href="#services">Services</a>
          <a className="hidden sm:inline hover:text-white transition-colors" href="#book">Book Appointment</a>
          <Link className="hidden sm:inline hover:text-white transition-colors" to="/showcases">Showcases</Link>
          <a href="#book" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground hover:opacity-90">
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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={buildPhoto} alt="Custom water-cooled gaming PC built by Custom Core Labs" className="h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 lab-grid lab-grid-fade opacity-20" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-8 pt-28 pb-20 md:pt-36 md:pb-28 w-full">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-white/80">
            Featured Build &nbsp;//&nbsp; Midnight Aero
          </span>
        </div>
        <h1 className="animate-fade-up-delay-1 mt-8 text-[44px] sm:text-[64px] md:text-[84px] font-semibold leading-[0.95] tracking-[-0.04em] text-white max-w-3xl">
          Desktop towers,{" "}
          <span className="text-gradient-blue">Built to spec.</span>
          <br />
          <span className="text-[28px] sm:text-[36px] md:text-[44px] font-normal text-white/60">
            Rochester New York.
          </span>
        </h1>
        <h2 className="animate-fade-up-delay-2 mt-6 text-[22px] md:text-[26px] font-semibold tracking-tight text-white/90 max-w-xl">
          WNY's Premium Computer Assembly & Testing
        </h2>
        <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-[15px] md:text-[17px] leading-relaxed text-white/70">
          Bring your own components at true market price. We handle the structural integration, precision thermal application, and exhaustive hardware validation—delivering a flawless, turn-key system ready for deployment.
        </p>
        <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap items-center gap-4">
          <a href="#services" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[15px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all">
            View Services
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a href="#book" className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3.5 text-[15px] font-medium text-white hover:bg-white/20 transition-all">
            Get an Estimate
          </a>
          <Link to="/showcases" className="inline-flex items-center gap-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors">
            See the build specs
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Zero-Deposit Banner ---------------- */

function ZeroDepositBanner() {
  return (
    <section className="border-b hairline bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary mb-3">
              ⚡ Your Edge Over Big-Box Retail
            </div>
            <h3 className="text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-[-0.03em]">
              <span className="text-primary">Pay When It Boots</span> — Zero Upfront.
            </h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-mute">
              <strong className="text-foreground">Best Buy's Geek Squad</strong> charges massive upfront flat rates just to look at your system. We don't. 
              You pay <strong className="text-foreground">exactly $0</strong> until you're standing at our Bushnell's Basin bench watching your PC successfully POST and boot in person. 
              That's the local boutique advantage — no deposits, no surprises.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <a href="#book" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground hover:opacity-90 transition-all shadow-[var(--shadow-glow)]">
              Start Your Build
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Proof Section ---------------- */

function ProofSection() {
  return (
    <section className="border-b hairline bg-background">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group rounded-xl border hairline-strong bg-background p-7 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cpu className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">Who builds it</div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-tight">Operated by a Specialist</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">
                A dedicated 14-year-old desktop architecture technician based in Victor, NY. Every cable route, BIOS setting, and stress test is performed by the same pair of hands — no assembly line, no apprentices.
              </p>
            </div>
          </div>
          <div className="group rounded-xl border hairline-strong bg-background p-7 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Star className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">The standard</div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-tight">Flagship-Grade Craft</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">
                Our Midnight Aero baseline (RX 7600, Ryzen 5 5500, Montech Air 903 Max) demonstrates the same precision applied to every build — structural cable routing, micro-vibration standoff fastening, and clean-room assembly standards.
              </p>
            </div>
          </div>
          <div className="group rounded-xl border hairline-strong bg-background p-7 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">Zero risk</div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-tight">Pay When It Boots</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">
                No deposits. No upfront payments. 100% of the labor fee is due only after the system is fully assembled, provisioned, and verified running in your presence. If it doesn't POST, you don't pay.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-6 border-t hairline pt-10">
          <div className="text-center">
            <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.03em] text-foreground">100%</div>
            <div className="mt-1 text-[13px] text-slate-mute">Zero Deposit Policy</div>
          </div>
          <div className="text-center">
            <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.03em] text-foreground">24h</div>
            <div className="mt-1 text-[13px] text-slate-mute">Bench Validation</div>
          </div>
          <div className="col-span-2 md:col-span-1 text-center">
            <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.03em] text-foreground">90</div>
            <div className="mt-1 text-[13px] text-slate-mute">Day Labor Warranty</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Process Section ---------------- */

function ProcessSection() {
  const steps = [
    { icon: Warehouse, title: "Drop Off Parts", description: "Deliver your components to our secure Bushnell's Basin office during your scheduled 15-minute appointment window." },
    { icon: Wrench, title: "We Build & Validate", description: "Full structural assembly, pro cable routing, BIOS optimization, and a standard 60-minute hardware stability stress test." },
    { icon: Handshake, title: "Verify & Deploy", description: "Retrieve your completed system at our Bushnell's Basin bench. Watch your machine successfully initialize (POST), boot, and pass core diagnostic validation live in your presence. Our Zero-Deposit Promise: Complete payment is requested only after you have personally verified flawless operation." },
  ];

  return (
    <section className="border-b hairline bg-zinc-50">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 02</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">How it works</div>
          </div>
          <h2 className="text-[32px] md:text-[48px] font-semibold leading-[1] tracking-[-0.03em]">Three Steps to a Finished Build</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                {i < steps.length - 1 && <div className="hidden md:block absolute top-8 left-[60px] w-[calc(100%-40px)] h-px border-t border-dashed border-slate-300" />}
                <div className="relative flex flex-col items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mono mt-6 text-[12px] uppercase tracking-[0.18em] text-primary">Step {i + 1}</div>
                  <h3 className="mt-2 text-[20px] font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing Table ---------------- */

function PricingTable() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 03</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">Transparent labor estimates</div>
          </div>
          <h2 className="text-[28px] md:text-[42px] font-semibold leading-[1] tracking-[-0.03em]">What Your Build Costs</h2>
        </div>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-mute">
          See exactly how much assembly costs based on your parts budget. No surprises — final pricing is confirmed at drop-off.
        </p>
        <div className="mt-10 overflow-hidden rounded-xl border hairline-strong shadow-[var(--shadow-elegant)]">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Parts Budget</th>
                <th>Basic Build</th>
                <th>Ultimate Build</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">$1,000</td>
                <td>$99</td>
                <td>$139</td>
              </tr>
              <tr>
                <td className="font-semibold">$1,500</td>
                <td>$139</td>
                <td>$179</td>
              </tr>
              <tr>
                <td className="font-semibold">$2,000</td>
                <td>$179</td>
                <td><strong>8% of parts + $49 setup</strong></td>
              </tr>
              <tr>
                <td className="font-semibold">$2,500+ <span className="text-[12px] text-slate-mute">(Enthusiast Tier)</span></td>
                <td>$229</td>
                <td><strong>8% of parts + $49 setup</strong></td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-center text-[12.5px] leading-relaxed text-slate-mute">
            <span className="font-semibold text-foreground">*Note:</span> Our standard Ultimate Build includes a 60-minute hardware stress test to ensure structural stability. Extended 24-Hour Bench Validation is available under our <a href="#services" className="text-primary underline-offset-4 hover:underline">Performance & Tuning</a> services.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonial ---------------- */

function TestimonialSection() {
  return (
    <section className="border-b hairline bg-zinc-50">
      <div className="mx-auto max-w-[800px] px-5 md:px-8 py-16 md:py-20">
        <div className="mono text-center text-[10.5px] uppercase tracking-[0.18em] text-primary">What our clients say</div>
        <div className="mt-8 testimonial-card">
          <p className="quote">
            "The structural cable management was absolutely flawless. Driving down to Bushnell's Basin to pick it up was well worth the trip. The build quality easily beats major retail assembly lines."
          </p>
          <p className="author">— Alex M., Rochester NY</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Geography Section ---------------- */

function GeographySection() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border hairline bg-background px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-slate-ink">Bushnell's Basin · Victor, NY</span>
            </div>
            <h2 className="mt-5 text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-[-0.03em]">Serving Rochester, Henrietta, Greece, Pittsford, and more</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-mute">
              Located in Bushnell's Basin, our bench provides professional PC assembly and troubleshooting without the risk of shipping damage to fragile glass cases. Local clients save on shipping costs and avoid the possibility of couriers damaging tempered glass panels during transit.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-mute">
              Whether you're a student building a high-performance engineering workstation at <strong>RIT</strong> or the <strong>University of Rochester</strong>, a gamer upgrading for esports, or a professional needing a reliable editing suite — we handle builds of any scope.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border hairline-strong shadow-[var(--shadow-elegant)]">
            <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5 p-10 text-center">
              <MapPin className="mx-auto h-12 w-12 text-primary" />
              <div className="mt-4 mono text-[12px] uppercase tracking-[0.18em] text-slate-mute">Drop-off location</div>
              <div className="mt-2 text-[16px] font-semibold">Bushnell's Basin, Victor, NY</div>
              <div className="mt-1 text-[14px] text-slate-mute">Monroe County · Greater Rochester Area</div>
              <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-slate-mute">
                <Clock className="h-4 w-4 text-primary" />
                <span>Appointment only · 15-minute drop-off windows</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ Section ---------------- */

function FAQSection() {
  const faqs = [
    {
      q: "What happens if a part arrives broken (DOA)?",
      a: "If a component is dead on arrival, we will pinpoint the exact broken part and hand you the diagnostic code so you can easily return it to Amazon, Newegg, or Best Buy for a fresh replacement.",
    },
    {
      q: "Can I drop off parts after school or work?",
      a: "Yes. We run by appointment only and offer flexible 15-minute drop-off and pickup windows to easily fit your evening or weekend schedule.",
    },
    {
      q: "Do I need to bring my own thermal paste?",
      a: "No. Standard thermal compound comes pre-applied on most coolers, but we also keep fresh, premium thermal paste on the bench if your build requires a manual application.",
    },
  ];

  return (
    <section className="border-b hairline bg-zinc-50">
      <div className="mx-auto max-w-[800px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 04</div>
          <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">Common questions</div>
          <h2 className="mt-3 text-[32px] md:text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">Frequently Asked Questions</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="faq-item">
              <summary>{faq.q}</summary>
              <div className="faq-body">{faq.a}</div>
            </details>
          ))}
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
    { title: "Custom Gaming PC Builds & Assembly", tag: "A · choose one", ids: ["basic", "ultimate"] },
    { title: "PC Repair, Upgrades & Diagnostics", tag: "B · pick any", ids: ["refresh", "diagnostic", "software", "cables", "wipe", "upgrade"] },
    { title: "Performance & Tuning", tag: "C · pick any", ids: ["bios", "validation", "overclock"] },
    { title: "Add-on", tag: "D · conditional", ids: ["thermal"] },
  ];

  return (
    <section id="services" className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 05</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">Transparent line items</div>
          </div>
          <h2 className="text-[36px] md:text-[56px] font-semibold leading-[1] tracking-[-0.03em]">Services</h2>
        </div>
        {groups.map((g) => (
          <div key={g.title} className="mt-12">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <div className="flex items-center gap-3">
                <span className="mono flex h-6 items-center rounded-md border hairline-strong bg-background px-2 text-[10px] font-semibold text-primary">{g.tag}</span>
                <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight">{g.title}</h3>
              </div>
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                {g.ids.length.toString().padStart(2, "0")} {g.ids.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.ids.map((id) => (
                <ServiceCard key={id} service={SERVICE_MAP[id]} active={active.has(id)} disabled={isDisabled(id)} onDetails={() => openModal(id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ service, active, disabled, onDetails }: { service: Service; active: boolean; disabled: boolean; onDetails: () => void }) {
  return (
    <div className={`relative w-full rounded-xl border bg-background p-6 transition-all ${disabled ? "hairline pointer-events-none opacity-40 bg-zinc-100" : active ? "border-primary shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60 hover:shadow-[var(--shadow-elegant)]"}`}>
      <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute">
        <span>{service.id.toUpperCase()}</span>
        {disabled ? <span className="inline-flex items-center gap-1 text-slate-mute"><Lock className="h-3 w-3" /> Unavailable</span> : active ? <span className="text-primary">SELECTED ✓</span> : null}
      </div>
      <h4 className="mt-5 text-[18px] font-semibold tracking-tight">{service.title}</h4>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-mute">{service.short}</p>
      <div className="mt-6 inline-flex items-end gap-2">
        <span className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">{service.priceLabel}</span>
        {service.category === "build" && <span className="text-[11px] uppercase tracking-[0.22em] text-slate-mute">Build price</span>}
      </div>
      <div className="mt-6">
        <button type="button" onClick={onDetails} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border hairline-strong bg-background px-3 py-2.5 text-[13px] font-medium text-slate-ink transition-colors hover:border-primary hover:text-primary">
          <Info className="h-4 w-4" />
          View Details
        </button>
      </div>
      {service.id === "ultimate" && <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute"><span className="text-primary">↳</span> Over $2,000 → 8% of parts + $49 setup.</p>}
      {service.id === "diagnostic" && <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute"><span className="text-primary">↳</span> 100% credited to repair labor if hired.</p>}
      {service.id === "thermal" && disabled && <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute"><span className="text-primary">↳</span> Requires Diagnostic, Refresh, or Upgrade.</p>}
    </div>
  );
}

/* ---------------- Quick Contact ---------------- */

function QuickContact() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-8">
        <div className="quick-contact">
          <p>
            <MessageCircle className="inline h-4 w-4 text-primary mr-1.5 -mt-0.5" />
            Not sure what you need? Send us a message directly at <strong>cdwojick@gmail.com</strong> and we'll get back to you same day.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Details Modal ---------------- */

function DetailsModal({ service, onClose }: { service: Service; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const bullets = service.details.split(/(?<=[.!?])\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border hairline-strong bg-background p-6 sm:p-8 shadow-[var(--shadow-elegant)]">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border hairline-strong text-slate-ink hover:border-primary hover:text-primary">
          <X className="h-4 w-4" />
        </button>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">{service.category === "build" ? "Build" : service.category === "addon" ? "Add-on" : "Service"} · {service.priceLabel}</div>
        <h3 id="modal-title" className="mt-2 text-[24px] font-semibold tracking-[-0.02em]">{service.title}</h3>
        {service.category === "build" && (
          <div className="mt-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="text-slate-mute">Under $1,000</td>
                  <td className="text-right font-semibold">{service.id === "basic" ? "$99" : "$139"}</td>
                </tr>
                <tr>
                  <td className="text-slate-mute">$1,000–$1,999</td>
                  <td className="text-right font-semibold">{service.id === "basic" ? "$139" : "$179"}</td>
                </tr>
                <tr>
                  <td className="text-slate-mute">$2,000+</td>
                  <td className="text-right font-semibold">{service.id === "basic" ? "$179" : "8% of parts + $49"}</td>
                </tr>
                {service.id === "basic" && (
                  <tr>
                    <td className="text-slate-mute">$2,500+</td>
                    <td className="text-right font-semibold">$229</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <ul className="mt-6 space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-slate-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        {service.id === "ultimate" && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-[13.5px] leading-relaxed text-slate-ink">
            <span className="font-semibold text-primary">↳ Saves $40</span> over ordering software install and stress testing separately!
          </div>
        )}
        <button type="button" onClick={onClose} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90">Close</button>
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
            <img src={cclLogo} alt="Custom Core Labs logo" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-[13px] font-semibold tracking-tight">Custom <span className="text-primary">Core</span> Labs</span>
          </div>
          <div className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
            <ShieldCheck className="h-3 w-3 text-primary" />
            Zero upfront · Pay when it boots
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-relaxed text-slate-mute">
            © {new Date().getFullYear()} Custom Core Labs. All hardware and activation keys supplied by client.
            <span className="hidden sm:inline mx-2 text-slate-mute">·</span>
            <br className="sm:hidden" />
            <a href="/privacy.html" className="text-primary underline-offset-4 hover:underline">Privacy Policy</a>
            <span className="mx-2 text-slate-mute">·</span>
            <a href="/custom-core-labs-service-agreement.html" className="text-primary underline-offset-4 hover:underline">Service Agreement & Warranty</a>
          </p>
          <button type="button" onClick={onOpenTerms} className="self-start text-[12px] font-medium text-primary underline-offset-4 hover:underline">Terms & Conditions / Service Contract</button>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Service Agreement (replaces old Disclosure) ---------------- */

function ServiceAgreement() {
  const sections = [
    {
      title: "1. Zero-Deposit Financial Policy",
      bullets: [
        "Custom Core Labs strictly operates on a zero-upfront-fee guarantee. We do not accept component procurement deposits or booking retainers.",
        "One hundred percent (100%) of the structured assembly labor fee is due exclusively upon the successful completion of the hardware validation loop, verified in the client's presence at our Bushnell's Basin facility.",
        "Authorized settlement methods are limited to secure digital transfers (Zelle, Apple Pay) or cash currency at the immediate time of handoff.",
      ],
    },
    {
      title: "2. Component Liability & Dead-On-Arrival (DOA) Provisions",
      bullets: [
        "Custom Core Labs maintains a strict labor-only scope and assumes zero financial, physical, or legal liability for components arriving defective from the retailer (Dead on Arrival / DOA).",
        "In the event that a client-supplied component fails physical initialization due to a factory defect, our technician will isolate the specific component error codes to enable a frictionless retail exchange with vendors like Amazon, Best Buy, or Newegg.",
        "This policy applies equally to retail-new and pre-owned components. Custom Core Labs does not verify the functional history of secondhand or open-box hardware supplied by the client. If a system fails to POST due to underlying degradation of pre-owned components, the initial diagnostic fee or baseline labor rate is still applicable for bench time spent.",
      ],
    },
    {
      title: "3. 90-Day Artisanal Craftsmanship Warranty",
      bullets: [
        "Every system built on our bench carries an inclusive, ninety (90) day Limited Labor Warranty covering the physical configuration and manual execution of the build.",
        "Covered Items: Loose or unseated interconnects, physical mounting hardware realignment, structural cable bundle adjustments, or incorrect BIOS configuration profile values applied by our technician.",
        "Exclusions: Subsequent hardware component degradation, natural manufacturer product defects, user accidents (impact drops, liquid exposure), unauthorized hardware modifications, malware, or OS corruption introduced post-handoff.",
      ],
    },
    {
      title: "4. Parent Sign-Off Policy",
      bullets: [
        "Custom Core Labs is operated by a student builder. A business sponsor (parent or guardian) is present in the office to co-sign the build contract during every 15-minute appointment.",
        "Clients under the age of 18 must bring a parent or legal guardian to the office to sign the service agreement. No exceptions can be made to this policy.",
      ],
    },
    {
      title: "5. Data Sovereignty & Privacy Policy",
      bullets: [
        "Client storage arrays are never duplicated, backed up, or manually reviewed.",
        "All operating system installations utilize official, unaltered distributions from Microsoft or open-source maintainers.",
      ],
    },
    {
      title: "6. Storage Fees & Property Abandonment",
      bullets: [
        "Completed systems or diagnostic hardware not picked up within 14 calendar days of the completed service notification will incur a $10 per day storage fee.",
        "Systems left unclaimed for more than 45 calendar days will be considered legally abandoned. Custom Core Labs reserves the right to liquidate the hardware to recover unpaid labor balances and accumulated storage costs.",
      ],
    },
    {
      title: "7. Used & Secondhand Component Disclaimer",
      bullets: [
        "Custom Core Labs is not responsible for system failures, POST errors, or hardware instability caused by components sourced from the used or secondhand market, including but not limited to eBay, Facebook Marketplace, Craigslist, pawn shops, or estate sales.",
        "If a system fails to POST or exhibits instability due to pre-existing wear, damage, or degradation of client-supplied pre-owned hardware, the full applicable labor rate and diagnostic fees remain due for all bench time and assembly services rendered.",
      ],
    },
  ];

  return (
    <section id="disclosure" className="w-full bg-zinc-50 border-y hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 06</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">Service agreement · public record</div>
          </div>
          <h2 className="text-[28px] md:text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
            Custom Core Labs // Service Agreement & Limited Labor Warranty
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((s) => (
            <div key={s.title} className="w-full rounded-xl border border-primary/30 bg-background p-6 md:p-7">
              <h3 className="text-[15.5px] font-semibold tracking-tight text-foreground">{s.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {s.bullets.map((b, i) => (
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
  { title: "1. Labor-Only Service", body: "Custom Core Labs provides technical consulting and labor only; all hardware components must be supplied entirely by the client." },
  { title: "2. Software Licensing Accountability", body: "Deployed operating systems are standard, unactivated distributions. Licensing and activation remain the sole legal responsibility of the client." },
  { title: "3. Data Loss Indemnity Mitigation", body: "Clients are strictly required to perform complete data backups prior to servicing. Custom Core Labs assumes no liability for hard drive sector failures or structural data corruption during servicing." },
  { title: "4. Fulfillment Logistics", body: "Drop-off and pickup transactions must conform strictly to scheduled windows at our secure Bushnell's Basin office location." },
  { title: "5. Payment Terms", body: "100% of the labor fee is due only after the system is fully assembled, boots successfully, and you have verified operation and signed the approval form. No deposits or upfront payments are required." },
];

function TermsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="terms-title" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border hairline-strong bg-background p-6 sm:p-8 shadow-[var(--shadow-elegant)]">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border hairline-strong text-slate-ink hover:border-primary hover:text-primary"><X className="h-4 w-4" /></button>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">Service Contract · v2</div>
        <h3 id="terms-title" className="mt-2 text-[24px] font-semibold tracking-[-0.02em]">Terms & Conditions</h3>
        <p className="mt-2 text-[13px] text-slate-mute">Binding rules for all Custom Core Labs engagements.</p>
        <ol className="mt-6 space-y-5">
          {TERMS.map((t) => (
            <li key={t.title} className="rounded-lg border hairline bg-zinc-50 p-4">
              <h4 className="text-[14.5px] font-semibold tracking-tight text-foreground">{t.title}</h4>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-ink">{t.body}</p>
            </li>
          ))}
        </ol>
        <button type="button" onClick={onClose} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90">Acknowledge & close</button>
      </div>
    </div>
  );
}