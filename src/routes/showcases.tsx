import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Cpu, HardDrive, Monitor, Zap } from "lucide-react";
import midnightAeroImage from "../assets/builds/midnight-aero.jpg";
import cclLogo from "@/assets/ccl-logo.jpg";

export const Route = createFileRoute("/showcases")({
  component: Showcases,
});

function Showcases() {
  const showcases = [
    {
      id: 1,
      title: "Midnight Aero",
      description:
        "Custom high-performance build with precision engineering and premium components",
      image: midnightAeroImage,
      specs: [
        { label: "GPU", value: "ASRock Radeon RX 7600" },
        { label: "CPU", value: "Ryzen 5 5500" },
        { label: "RAM", value: "16GB DDR4 3200" },
        { label: "Storage", value: "512GB NVMe SSD" },
        { label: "PSU", value: "650W Bronze 80+" },
        { label: "Case", value: "Montech Air 903 Max" },
      ],
      link: "https://pcpartpicker.com/list/yGvrrG",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-foreground/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={cclLogo}
              alt="Custom Core Labs logo"
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="text-[13px] font-semibold tracking-tight text-white">
              Custom <span className="text-primary">Core</span> Labs
            </span>
          </Link>
          <nav className="flex items-center gap-3 md:gap-6 text-[13px] text-white/70">
            <Link className="inline hover:text-white transition-colors" to="/">
              Home
            </Link>
            <Link className="inline hover:text-white transition-colors" to="/#book">
              Book Appointment
            </Link>
            <Link className="inline hover:text-white transition-colors" to="/showcases">
              Showcases
            </Link>
            <a
              href="/#book"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground hover:opacity-90"
            >
              Book
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section — Immersive Dark Background */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={midnightAeroImage}
            alt="Custom water-cooled gaming PC built by Custom Core Labs"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 lab-grid lab-grid-fade opacity-20" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-[1280px] px-5 md:px-8 pt-28 pb-20 md:pt-36 md:pb-28 w-full">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-white/80">
              Showcase &nbsp;//&nbsp; Build Gallery
            </span>
          </div>
          <h1 className="animate-fade-up-delay-1 text-[48px] md:text-[72px] font-semibold leading-[1] tracking-[-0.03em] text-white mb-4">
            Build <span className="text-gradient-blue">Showcases</span>
          </h1>
          <p className="animate-fade-up-delay-2 max-w-2xl text-[16px] leading-relaxed text-white/70">
            Explore our completed builds, from high-end gaming rigs to compact workstations. Each
            showcase includes detailed specs, photos, and PCPartPicker links.
          </p>
        </div>
      </section>

      {/* Showcase Detail */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {showcases.map((showcase) => (
              <div key={showcase.id} className="space-y-8">
                {/* Image */}
                <div className="relative rounded-xl overflow-hidden border hairline-strong shadow-[var(--shadow-elegant)]">
                  <img
                    src={midnightAeroImage}
                    alt="Midnight Aero custom gaming PC with cable management and RGB lighting"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log("Image failed to load:", e.currentTarget.src);
                      e.currentTarget.style.display = "none";
                      const placeholder =
                        e.currentTarget.parentElement?.querySelector(".placeholder");
                      if (placeholder) placeholder.classList.remove("hidden");
                    }}
                  />
                  <span className="text-slate-mute placeholder hidden">
                    Build Image Placeholder
                  </span>
                </div>
              </div>
            ))}

            {/* Specs Section */}
            <div className="space-y-8">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Project 01
                </div>
                <h2 className="text-[32px] font-semibold tracking-[-0.02em] mt-2">
                  {showcases[0].title}
                </h2>
                <p className="text-[16px] text-slate-mute mt-3">{showcases[0].description}</p>
              </div>

              <div className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
                <h3 className="text-[18px] font-semibold mb-5 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  Specifications
                </h3>
                <div className="space-y-3">
                  {showcases[0].specs.map((spec, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b hairline last:border-0"
                    >
                      <span className="mono text-[11px] uppercase tracking-[0.12em] text-slate-mute">
                        {spec.label}
                      </span>
                      <span className="text-[15px] font-medium text-foreground text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={showcases[0].link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                View Full Build on PCPartPicker
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t hairline bg-secondary/30 py-12">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
            <div className="flex items-center gap-6 text-[13px] text-slate-mute">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/#services" className="hover:text-primary transition-colors">
                Services
              </Link>
              <Link to="/#book" className="hover:text-primary transition-colors">
                Book
              </Link>
              <Link to="/showcases" className="hover:text-primary transition-colors">
                Showcases
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t hairline text-center text-[12px] text-slate-mute">
            © 2026 Custom Core Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
