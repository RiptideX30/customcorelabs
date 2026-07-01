import { Check, Star, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

type Package = {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  details: {
    parts: { label: string; value: string }[];
    services: string[];
  };
};

const packages: Package[] = [
  {
    title: "Nebula Core",
    price: "$1200",
    description: "An excellent entry-point for 1080p gaming, balancing performance and value for popular esports and AAA titles.",
    features: [
      "Target: 1080p High-FPS Gaming",
      "Quality Component Selection",
      "Professional Assembly & Cable Management",
      "OS & Driver Installation",
      "Standard Validation Testing",
    ],
    details: {
      parts: [
        { label: "CPU", value: "AMD Ryzen 5 5500" },
        { label: "Cooler", value: "Stock CPU Cooler" },
        { label: "Motherboard", value: "B550M mATX Motherboard" },
        { label: "Memory", value: "16GB (2x8GB) DDR4" },
        { label: "Storage", value: "1TB NVMe M.2 SSD" },
        { label: "GPU", value: "Radeon RX 7600" },
        { label: "Case", value: "Montech Air 100 Black" },
        { label: "PSU", value: "650W 80+ Bronze" },
      ],
      services: ["Ultimate Build Service Package"],
    },
  },
  {
    title: "Zenith Performance",
    price: "$1800",
    description: "The sweet spot for high-refresh-rate 1440p gaming, with powerful components for a smooth and immersive experience.",
    features: [
      "Target: 1440p High-Refresh-Rate Gaming",
      "Premium CPU & GPU Pairing",
      "Enhanced Cooling Solutions",
      "Pro Cable Management & Airflow Tuning",
      "Ultimate Build Validation (60-min stress test)",
    ],
    isPopular: true,
    details: {
      parts: [
        { label: "CPU", value: "AMD Ryzen 5 9600X" },
        { label: "Cooler", value: "Cooler Master Hyper 212 Pro" },
        { label: "Motherboard", value: "B850-S ATX Motherboard" },
        { label: "Memory", value: "32GB (2x16GB) DDR5" },
        { label: "Storage", value: "1TB NVMe M.2 SSD" },
        { label: "GPU", value: "Radeon RX 9060XT 16GB" },
        { label: "Case", value: "Phanteks NV5S" },
        { label: "PSU", value: "850W 80+ Gold" },
      ],
      services: ["Ultimate Build Service Package", "BIOS / Firmware Tuning"],
    },
  },
  {
    title: "Horizon Showcase",
    price: "$2400",
    description: "A top-tier rig for 4K gaming and content creation, built with flagship components for uncompromising performance.",
    features: [
      "Target: 4K & High-End 1440p Gaming",
      "Flagship-Tier CPU & GPU",
      "Advanced Thermal Management",
      "Meticulous Cable Architecture",
      "Includes 24-Hour Bench Validation",
    ],
    details: {
      parts: [
        { label: "CPU", value: "AMD Ryzen 7 9700X" },
        { label: "Cooler", value: "MSI MAG Coreliquid A13 360mm Liquid AIO Cooler" },
        { label: "Motherboard", value: " B850-S ATX Motherboard" },
        { label: "Memory", value: "32GB (2x16GB) DDR5" },
        { label: "Storage", value: "1TB High-Speed Gen4 NVMe M.2 SSD" },
        { label: "GPU", value: "Radeon RX 9070XT" },
        { label: "Case", value: "MSI MAG Pano 100R" },
        { label: "PSU", value: "850W 80+ Gold" },
      ],
      services: ["Ultimate Build Service Package", "BIOS / Firmware Tuning", "24-Hour Bench Validation"],
    },
  },
];

function PackageDetailsModal({ pkg, onClose }: { pkg: Package; onClose: () => void }) {
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
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border hairline-strong bg-background p-6 sm:p-8 shadow-[var(--shadow-elegant)] max-h-[90vh] overflow-y-auto"
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
          Package Details · {pkg.price}
        </div>
        <h3 id="modal-title" className="mt-2 text-[24px] font-semibold tracking-[-0.02em]">
          {pkg.title}
        </h3>
        <p className="mt-2 text-sm text-slate-mute">
          Note: Specific component models are selected based on market availability and performance benchmarks to ensure the best value at the time of your build.
        </p>
        
        <div className="mt-6">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute mb-3">
            Core Components
          </div>
          <div className="divide-y hairline-strong rounded-lg border hairline-strong">
            {pkg.details.parts.map((part) => (
              <div key={part.label} className="flex items-center justify-between p-3">
                <span className="text-sm font-medium text-slate-mute">{part.label}</span>
                <span className="text-sm text-right">{part.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute mb-3">
            Included Services
          </div>
          <ul className="space-y-2">
            {pkg.details.services.map((service) => (
              <li key={service} className="flex items-center gap-3 rounded-lg border hairline bg-secondary/20 px-4 py-3 text-[14px] font-medium">
                <Check className="h-5 w-5 text-primary" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
        
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


export default function ServicePackages() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  return (
    <>
      <section id="packages" className="py-16 md:py-24 bg-zinc-50 border-y hairline">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="text-center">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 06</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">Pre-configured Build Packages</h2>
            <p className="mt-4 text-lg text-slate-mute max-w-3xl mx-auto">
              Get a guaranteed performance tier for a fixed price. We select the best components for your budget behind the scenes, leveraging market-value discounts to maximize performance.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.title} className={`flex flex-col relative rounded-xl border bg-background p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 ${pkg.isPopular ? "border-primary shadow-primary/10" : "hairline-strong"}`}>
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Star className="h-3.5 w-3.5" />
                    Most Popular
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold">{pkg.title}</h3>
                  <p className="mt-4 text-4xl font-bold">{pkg.price}</p>
                  <p className="mono text-[11px] uppercase tracking-[0.18em] text-slate-mute">Total Parts & Labor</p>
                  <p className="mt-6 text-[14px] leading-relaxed text-slate-mute">{pkg.description}</p>
                  <ul className="mt-6 space-y-3 border-t hairline pt-6">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-[14px]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border hairline-strong bg-background px-3 py-2.5 text-[13px] font-medium text-slate-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    <Info className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {selectedPackage && <PackageDetailsModal pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />}
    </>
  );
}
