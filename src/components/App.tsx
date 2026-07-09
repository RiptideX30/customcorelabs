import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
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
  Menu,
} from "lucide-react";
import cclLogo from "@/assets/ccl-logo.jpg";
import buildPhoto from "@/assets/builds/midnight-aero.jpg";
import ServicePackages from "./ServicePackages";
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
  /** Recommended for high-end builds (parts value > $2,500) */
  highTierRecommended?: boolean;
};

const SERVICES: Service[] = [
  {
    id: "basic",
    title: "Basic Build",
    priceLabel: "$109",
    short: "Pure hardware assembly. No OS or drivers.",
    category: "build",
    details: "Pure hardware assembly and standard cable routing. No OS or driver installation.",
  },
  {
    id: "ultimate",
    title: "Ultimate Build",
    priceLabel: "Starting at $149",
    short:
      "Full assembly, OS provisioning, pro routing, 60-min stress testing, structural component balancing, and BIOS optimization.",
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
    priceLabel: "$45",
    short: "Bench time, stress-testing, and expert labor to isolate system issues. Settled at pickup.",
    category: "service",
    details:
      "The diagnostic service covers the bench time, specialized stress-testing, and expert labor required to accurately isolate a system issue. All payments are settled at pickup once the work is complete. Integrated Solution Pricing: If a standard repair service is selected to fix the system, the diagnostic fee is completely absorbed into a single, combined solution price at checkout. The customer is never obligated to proceed with a repair and can choose to take the system back after receiving the diagnostic report. Instant Resolutions: If the issue is permanently resolved entirely within the initial testing process (such as utilizing a physical BIOS flashback button, clearing CMOS, or resolving a loose cable connection), no additional repair fees are added. The customer is only billed the base $45 diagnostic rate. Specialized Lab Procedures: For unique hardware scenarios that do not fall under standard website services (such as straightening bent motherboard socket pins), a single flat-rate labor quote will be provided for customer approval before any specialized work begins.",
  },
  {
    id: "software",
    title: "Software Install",
    priceLabel: "$69",
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
      "Basic Upgrades (Fans, RAM, NVMe SSDs): $29 flat rate per part category. Mid-Level Upgrades (CPU cooler, CPU, PSU, GPU, hard drives): $59 flat rate per part category. High Maintenance (Full Case Migrations, Motherboard swaps): $129 flat rate. Thermal Rule: If the upgrade requires CPU or CPU cooler removal, a $10 fresh thermal paste service is automatically bundled. Multi-Part Projects: When upgrading multiple interdependent parts at once (e.g., a CPU + Motherboard combo, or a full Case Migration with new components), we group the labor and provide a single, discounted custom quote upfront so you never pay for overlapping steps.",
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
    highTierRecommended: true,
  },
  {
    id: "validation",
    title: "24-Hour Bench Validation",
    priceLabel: "$69",
    short: "Extended stress testing and stability verification.",
    category: "service",
    details:
      "Full 24-hour burn-in testing with industry-standard tools. CPU and GPU thermal validation, memory stability testing with MemTest86, storage health verification, and comprehensive system stability reports.",
    highTierRecommended: true,
  },
  {
    id: "overclock",
    title: "Memory + CPU Overclock Profile",
    priceLabel: "$49",
    short: "Custom performance tuning for maximum throughput.",
    category: "service",
    details:
      "Manual memory timing optimization, CPU frequency and voltage tuning, stability validation across multiple workloads, custom performance profiles saved to BIOS.",
    highTierRecommended: true,
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
    const basicAmount = partsValue < 1000 ? 99 : partsValue < 2000 ? 119 : 159;
    items.push({ id: "basic", label: `Basic Build · $${basicAmount}`, amount: basicAmount });
  }
  if (active.has("ultimate")) {
    const ultimateAmount = partsValue < 1000 ? 149 : partsValue < 2000 ? 179 : 229;
    items.push({
      id: "ultimate",
      label: `Ultimate Build · $${ultimateAmount}`,
      amount: ultimateAmount,
    });
  }
  if (active.has("refresh"))
    items.push({ id: "refresh", label: "Desktop Refresh Bundle", amount: 49 });
  if (active.has("diagnostic"))
    items.push({ id: "diagnostic", label: "Full System Diagnostic", amount: 45 });
  if (active.has("software")) items.push({ id: "software", label: "Software Install", amount: 69 });
  if (active.has("cables")) items.push({ id: "cables", label: "Pro Cable Management", amount: 18 });
  if (active.has("wipe")) items.push({ id: "wipe", label: "Secure Drive Wipe", amount: 15 });
  if (active.has("upgrade"))
    items.push({ id: "upgrade", label: "Hardware Upgrade · TBD", amount: 0 });
  if (active.has("thermal"))
    items.push({ id: "thermal", label: "Fresh Thermal Paste (add-on)", amount: 10 });
  if (active.has("bios")) items.push({ id: "bios", label: "BIOS / Firmware Tuning", amount: 35 });
  if (active.has("validation"))
    items.push({ id: "validation", label: "24-Hour Bench Validation", amount: 69 });
  if (active.has("overclock"))
    items.push({ id: "overclock", label: "Memory + CPU Overclock Profile", amount: 49 });

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
  const thermalEligible =
    active.has("refresh") ||
    active.has("software") ||
    active.has("cables") ||
    active.has("upgrade");

  useEffect(() => {
    setActive((prev) => {
      const next = new Set(prev);
      let changed = false;
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
    <main
      id="top"
      className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden"
    >
      <Header />
      <Hero />
      <ZeroDepositBanner />
      <ProofSection />
      <ProcessSection />
      <PricingTable />
      <TestimonialSection />
      <GeographySection />
      <FAQSection />
      <ServicesGrid
        active={active}
        toggle={toggle}
        isDisabled={isDisabled}
        openModal={(id) => setModal(id)}
        partsValue={partsValue}
      />
      <ServicePackages />
      <IntakeForm />
      <QuickContact />
      <Footer onOpenTerms={() => setTermsOpen(true)} />
      {modal && <DetailsModal service={SERVICE_MAP[modal]} onClose={() => setModal(null)} />}
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
    </main>
  );
}

/* ---------------- Header ---------------- */

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-foreground/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 md:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <img
              src={cclLogo}
              alt="Custom Core Labs logo"
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="text-[13px] font-semibold tracking-tight text-white">
              Custom <span className="text-primary">Core</span> Labs
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-3 md:gap-6 text-[13px] text-white/70">
            <a className="hover:text-white transition-colors" href="#services">
              Services
            </a>
            <Link className="hover:text-white transition-colors" to="/track">
              Track Build
            </Link>
            <Link className="hover:text-white transition-colors" to="/showcases">
              Showcases
            </Link>
            <Link className="hover:text-white transition-colors" to="/comparison">
              Comparison
            </Link>
            <a
              href="https://www.youtube.com/@CustomCoreLabs"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="YouTube channel"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Youtube className="h-4 w-4" />
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
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-foreground/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto max-w-[1280px] px-5 py-6 flex flex-col gap-4 text-[15px] text-white/70">
            <a
              href="#services"
              className="hover:text-white transition-colors py-2"
              onClick={handleNavClick}
            >
              Services
            </a>
            <Link
              to="/track"
              className="hover:text-white transition-colors py-2"
              onClick={handleNavClick}
            >
              Track Build
            </Link>
            <Link
              to="/showcases"
              className="hover:text-white transition-colors py-2"
              onClick={handleNavClick}
            >
              Showcases
            </Link>
            <Link
              to="/comparison"
              className="hover:text-white transition-colors py-2"
              onClick={handleNavClick}
            >
              Comparison
            </Link>
            <a
              href="https://www.youtube.com/@CustomCoreLabs"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-white transition-colors py-2"
              onClick={handleNavClick}
            >
              YouTube
            </a>
            <div className="border-t border-white/10 pt-4 mt-2">
              <a
                href="#book"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-3 text-[14px] font-medium text-primary-foreground hover:opacity-90 transition-all"
                onClick={handleNavClick}
              >
                Book Now
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={buildPhoto}
          alt="Custom water-cooled gaming PC built by Custom Core Labs"
          className="h-full w-full object-cover"
        />
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
          Desktop towers, <span className="text-gradient-blue">Built to spec.</span>
          <br />
          <span className="text-[28px] sm:text-[36px] md:text-[44px] font-normal text-white/60">
            Rochester New York.
          </span>
        </h1>
        <h2 className="animate-fade-up-delay-2 mt-6 text-[22px] md:text-[26px] font-semibold tracking-tight text-white/90 max-w-xl">
          Rochester's Premium Computer Assembly & Testing
        </h2>
        <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-[15px] md:text-[17px] leading-relaxed text-white/70">
          We source premium components, perform precision assembly, and complete every build with
          rigorous hardware validation. Your finished custom PC is ready for secure pickup at our
          Bushnell's Basin workshop.
        </p>
        <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[15px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all"
          >
            View Services
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#book"
            className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3.5 text-[15px] font-medium text-white hover:bg-white/20 transition-all"
          >
            Get an Estimate
          </a>
          <Link
            to="/showcases"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
          >
            See the build specs
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-16 max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">
            Select Your Profile
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Gamer Avatar */}
            <div
              onClick={() => {
                document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
                // Fire a lightweight temporary trigger event 100ms later to give the scroll a head start
                setTimeout(() => {
                  window.dispatchEvent(
                    new CustomEvent("select-profile-path", { detail: "build-known" }),
                  );
                }, 100);
              }}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-purple-950/20 via-slate-900/40 to-black/20 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/20">
                  Elite Gaming & RGB
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  Dream Gaming Systems
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  High-FPS rigs built for competition. Meticulous cable routing, optimized thermal
                  curves, and clean-room assembly standards for premium hardware.
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-semibold text-purple-400 gap-1 group-hover:underline">
                <span>Build Your Setup</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>

            {/* Card 2: Business Avatar */}
            <div
              onClick={() => {
                document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                  window.dispatchEvent(
                    new CustomEvent("select-profile-path", { detail: "build-help" }),
                  );
                }, 100);
              }}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-950/20 via-slate-900/40 to-black/20 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                  Workstation Stability
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Professional Office PCs
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Engineered for heavy productivity, editing suites, and whisper-quiet remote
                  setups. 100% rigorous validation testing without any technical hassle.
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-semibold text-blue-400 gap-1 group-hover:underline">
                <span>Get Expert Guidance</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </div>
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
              Premium Build Procurement
            </div>
            <h3 className="text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-[-0.03em]">
              <span className="text-primary">Parts Ordered First</span> — Labor Due at Pickup.
            </h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-mute">
              Custom Core Labs sources the exact premium components your build requires. Parts cost
              is collected before any order is placed, then final labor and service fees settle at
              pickup once your system passes our validation workflow.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <a
              href="#book"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground hover:opacity-90 transition-all shadow-[var(--shadow-glow)]"
            >
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
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Who builds it
              </div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-tight">
                Operated by a Specialist
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">
                A seasoned desktop architecture technician based in Bushnell's Basin, Pittsford, NY.
                Every cable route, BIOS profile, and stress test is performed by the same pair of
                hands — no assembly line, no apprentices.
              </p>
            </div>
          </div>
          <div className="group rounded-xl border hairline-strong bg-background p-7 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Star className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
                The standard
              </div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-tight">
                Flagship-Grade Craft
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">
                Our Midnight Aero baseline (RX 7600, Ryzen 5 5500, Montech Air 903 Max) demonstrates
                the same precision applied to every build — structural cable routing,
                micro-vibration standoff fastening, and clean-room assembly standards.
              </p>
            </div>
          </div>
          <div className="group rounded-xl border hairline-strong bg-background p-7 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Final settlement
              </div>
              <h3 className="mt-3 text-[20px] font-semibold tracking-tight">
                Pickup-Ready Settlement
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">
                Parts are procured once your quote is approved. The remaining labor and service fees
                are due at pickup after full validation and verification of your finished system.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-6 border-t hairline pt-10">
          <div className="text-center">
            <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.03em] text-foreground">
              100%
            </div>
            <div className="mt-1 text-[13px] text-slate-mute">Parts Prepaid, Labor at Pickup</div>
          </div>
          <div className="text-center">
            <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.03em] text-foreground">
              60m
            </div>
            <div className="mt-1 text-[13px] text-slate-mute">Ultimate Build Validation</div>
          </div>
          <div className="col-span-2 md:col-span-1 text-center">
            <div className="text-[36px] md:text-[44px] font-semibold tracking-[-0.03em] text-foreground">
              90
            </div>
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
    {
      icon: Warehouse,
      title: "Approve Parts Procurement",
      description:
        "Review your premium component list and authorize orders. Parts cost is collected before any order is placed, so we can secure stock immediately.",
    },
    {
      icon: Wrench,
      title: "We Build & Validate",
      description:
        "Premium assembly, precision thermal routing, BIOS optimization, and a 60-minute hardware stability validation for ultimate builds.",
    },
    {
      icon: Handshake,
      title: "Pickup & Final Settlement",
      description:
        "Collect your finished system at our Bushnell's Basin shop. Final labor and service fees are due at pickup after your build passes validation.",
    },
  ];

  return (
    <section className="border-b hairline bg-zinc-50">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 02</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              How it works
            </div>
          </div>
          <h2 className="text-[32px] md:text-[48px] font-semibold leading-[1] tracking-[-0.03em]">
            Three Steps to a Finished Build
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60px] w-[calc(100%-40px)] h-px border-t border-dashed border-slate-300" />
                )}
                <div className="relative flex flex-col items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mono mt-6 text-[12px] uppercase tracking-[0.18em] text-primary">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-2 text-[20px] font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-mute">
                    {step.description}
                  </p>
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
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              Transparent labor estimates
            </div>
          </div>
          <h2 className="text-[28px] md:text-[42px] font-semibold leading-[1] tracking-[-0.03em]">
            What Your Build Costs
          </h2>
        </div>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-mute">
          See exactly how much assembly costs based on your parts budget. Final parts pricing is
          confirmed before orders are placed, and labor estimates are finalized during pickup.
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
                <td className="font-semibold">Under $1,000</td>
                <td>$99</td>
                <td>$149</td>
              </tr>
              <tr>
                <td className="font-semibold">$1,000-$1,999</td>
                <td>$119</td>
                <td>$179</td>
              </tr>
              <tr>
                <td className="font-semibold">$2,000+</td>
                <td>$159</td>
                <td>$229</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-center text-[12.5px] leading-relaxed text-slate-mute">
            <span className="font-semibold text-foreground">*Note:</span> Our standard Ultimate
            Build includes a 60-minute hardware stress test to ensure structural stability. Extended
            24-Hour Bench Validation is available under our{" "}
            <a href="#services" className="text-primary underline-offset-4 hover:underline">
              Performance & Tuning
            </a>{" "}
            services.
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
        <div className="mono text-center text-[10.5px] uppercase tracking-[0.18em] text-primary">
          What our clients say
        </div>
        <div className="mt-8 testimonial-card">
          <p className="quote">
            "The structural cable management was absolutely flawless. Driving down to Bushnell's
            Basin to pick it up was well worth the trip. The build quality easily beats major retail
            assembly lines."
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
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-slate-ink">
                Bushnell's Basin · Pittsford, NY
              </span>
            </div>
            <h2 className="mt-5 text-[28px] md:text-[36px] font-semibold leading-[1.1] tracking-[-0.03em]">
              Serving Rochester, Henrietta, Greece, Pittsford, and more
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-mute">
              Located in Bushnell's Basin, our bench provides professional PC assembly and
              troubleshooting without the risk of shipping damage to fragile glass cases. Local
              clients save on shipping costs and avoid the possibility of couriers damaging tempered
              glass panels during transit.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-mute">
              Whether you're a student building a high-performance engineering workstation at{" "}
              <strong>RIT</strong> or the <strong>University of Rochester</strong>, a gamer
              upgrading for esports, or a professional needing a reliable editing suite — we handle
              builds of any scope.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border hairline-strong shadow-[var(--shadow-elegant)]">
            <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5 p-10 text-center">
              <MapPin className="mx-auto h-12 w-12 text-primary" />
              <div className="mt-4 mono text-[12px] uppercase tracking-[0.18em] text-slate-mute">
                Drop-off location
              </div>
              <div className="mt-2 text-[16px] font-semibold">Bushnell's Basin, Pittsford, NY</div>
              <div className="mt-1 text-[14px] text-slate-mute">
                Monroe County · Greater Rochester Area
              </div>
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
      q: "What if I don't know anything about computers?",
      a: "You don't have to! Our team of specialists will guide you through the entire process, from selecting compatible parts to understanding the final build. We handle all the technical details so you can focus on enjoying your new custom PC.",
    },
    {
      q: "Can I drop off parts after school or work?",
      a: "Of course! We run by appointment only and offer flexible 15-minute drop-off and pickup windows to easily fit your evening or weekend schedule.",
    },
    {
      q: "How does Custom Core Labs compare to big-box retailers?",
      a: "Unlike major retail assembly lines, we provide personalized service with a focus on precision and quality. Every build is hand-assembled by a specialist, ensuring meticulous cable management, optimal thermal routing, and rigorous hardware validation that mass-produced systems can't match.",
    },
    {
      q: "How does the orders and payment process work?",
      a: "Once you approve your parts list, we collect the cost of components upfront to secure orders immediately. After your build is completed and passes our validation process, the remaining labor and service fees are due at pickup. This transparent approach ensures you know exactly what you're paying for at every step.",
    },
    {
      q: "How can I track my build progress?",
      a: "We provide a unique tracking number for every build, allowing you to monitor the status of your order through our online portal. From parts procurement to assembly and final validation, you'll have real-time updates on your build's progress.",
    },
  ];

  return (
    <section className="border-b hairline bg-zinc-50">
      <div className="mx-auto max-w-[800px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 04</div>
          <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
            Common questions
          </div>
          <h2 className="mt-3 text-[32px] md:text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
            Frequently Asked Questions
          </h2>
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
  partsValue,
}: {
  active: Set<ServiceId>;
  toggle: (id: ServiceId) => void;
  isDisabled: (id: ServiceId) => boolean;
  openModal: (id: ServiceId) => void;
  partsValue: number;
}) {
  const groups: { title: string; tag: string; ids: ServiceId[] }[] = [
    {
      title: "Custom Gaming PC Builds & Assembly",
      tag: "A · choose one",
      ids: ["basic", "ultimate"],
    },
    {
      title: "PC Repair, Upgrades & Diagnostics",
      tag: "B · pick any",
      ids: ["refresh", "diagnostic", "software", "cables", "wipe", "upgrade"],
    },
    {
      title: "Performance & Tuning",
      tag: "C · pick any",
      ids: ["bios", "validation", "overclock"],
    },
    { title: "Add-on", tag: "D · conditional", ids: ["thermal"] },
  ];

  return (
    <section id="services" className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 05</div>
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
                <span className="mono flex items-center justify-center rounded-md border hairline-strong bg-background px-3 py-1 text-[10px] font-semibold text-primary">
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
              {g.ids.map((id) => {
                const service = SERVICE_MAP[id];
                if (!service) return null;
                return (
                  <ServiceCard
                    key={id}
                    service={service}
                    active={active.has(id)}
                    disabled={isDisabled(id)}
                    onDetails={() => openModal(id)}
                    isHighTier={partsValue >= 2500}
                  />
                );
              })}
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
  onDetails,
  isHighTier,
}: {
  service: Service;
  active: boolean;
  disabled: boolean;
  onDetails: () => void;
  isHighTier?: boolean;
}) {
  const showRecommended = isHighTier && service.highTierRecommended && !active && !disabled;

  return (
    <div
      className={`relative w-full rounded-xl border bg-background p-6 transition-all ${disabled && service.id !== "thermal" ? "hairline pointer-events-none opacity-40 bg-zinc-100" : active ? "border-primary shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60 hover:shadow-[var(--shadow-elegant)]"}`}
    >
      {showRecommended && (
        <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700 shadow-sm">
          ⭐ Recommended
        </div>
      )}
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
      <div className="mt-6 inline-flex items-end gap-2">
        <span className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
          {service.priceLabel}
        </span>
        {service.category === "build" && (
          <span className="text-[11px] uppercase tracking-[0.22em] text-slate-mute">
            Build price
          </span>
        )}
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={onDetails}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border hairline-strong bg-background px-3 py-2.5 text-[13px] font-medium text-slate-ink transition-colors hover:border-primary hover:text-primary"
        >
          <Info className="h-4 w-4" />
          View Details
        </button>
      </div>
      {service.id === "ultimate" && (
        <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute">
          <span className="text-primary">↳</span> Under $1,000 → $149, $1,000–$1,999 → $179, $2,000+
          → $229.
        </p>
      )}
      {service.id === "diagnostic" && (
        <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute">
          <span className="text-primary">↳</span> Fee is absorbed if you proceed with a repair.
        </p>
      )}
      {service.id === "thermal" && disabled && (
        <p className="mono mt-4 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute">
          <span className="text-primary">↳</span> Requires Refresh, Software, Cables, or Upgrade.
        </p>
      )}
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
            Not sure what you need? Send us a message directly at{" "}
            <strong>technician@cclbuilds.com</strong> and we'll get back to you same day.
          </p>
        </div>
      </div>
    </section>
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

  const bullets = service.details
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=:)\s+(?=[A-Z])/)
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
        {service.category === "build" && (
          <div className="mt-4">
            <table className="w-full text-sm">
              <tbody>
                {service.id === "basic" ? (
                  <>
                    <tr>
                      <td className="text-slate-mute">Under $1,000</td>
                      <td className="text-right font-semibold">$99</td>
                    </tr>
                    <tr>
                      <td className="text-slate-mute">$1,000–$1,999</td>
                      <td className="text-right font-semibold">$119</td>
                    </tr>
                    <tr>
                      <td className="text-slate-mute">$2,000+</td>
                      <td className="text-right font-semibold">$159</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="text-slate-mute">Under $1,000</td>
                      <td className="text-right font-semibold">$149</td>
                    </tr>
                    <tr>
                      <td className="text-slate-mute">$1,000–$1,999</td>
                      <td className="text-right font-semibold">$179</td>
                    </tr>
                    <tr>
                      <td className="text-slate-mute">$2,000+</td>
                      <td className="text-right font-semibold">$229</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
        <ul className="mt-6 space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-slate-ink">
               <span className="font-semibold text-primary mt-1">•</span>
              <span className={b.includes(":") ? 'font-semibold text-foreground' : ''}>{b}</span>
            </li>
          ))}
        </ul>
        {service.id === "ultimate" && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-[13.5px] leading-relaxed text-slate-ink">
            <span className="font-semibold text-primary">↳ Saves $40-$60</span> over ordering
            software, BIOS, cables, and stress testing separately!
          </div>
        )}
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
            <ShieldCheck className="h-3 w-3 text-primary" />
            Parts ordered first · Labor due at pickup
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-relaxed text-slate-mute">
            © {new Date().getFullYear()} Custom Core Labs. All components are sourced and procured
            by Custom Core Labs on your behalf.
            <span className="hidden sm:inline mx-2 text-slate-mute">·</span>
            <br className="sm:hidden" />
            <a href="/privacy.html" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </a>
            <span className="mx-2 text-slate-mute">·</span>
            <a
              href="/custom-core-labs-service-agreement.html"
              className="text-primary underline-offset-4 hover:underline"
            >
              Service Agreement & Warranty
            </a>
          </p>
          <a
            href="/terms.html"
            className="self-start text-[12px] font-medium text-primary underline-offset-4 hover:underline"
          >
            Terms & Conditions / Service Contract
          </a>
        </div>
      </div>
    </footer>
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
          Service Contract · v2
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
