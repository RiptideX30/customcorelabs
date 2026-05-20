import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
      description: "Custom high-performance build with precision engineering and premium components",
      image: midnightAeroImage,
      specs: [
        "ASRock Radeon RX 7600",
        "Ryzen 5 5500", 
        "16GB DDR4 3200",
        "512GB NVMe SSD",
        "650W Bronze 80+ PSU",
        "Montech Air 903 Max"
      ],
      link: "https://pcpartpicker.com/list/yGvrrG",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b hairline bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={cclLogo} alt="Custom Core Labs logo" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-[13px] font-semibold tracking-tight">
              Custom <span className="text-primary">Core</span> Labs
            </span>
          </Link>
          <nav className="flex items-center gap-3 md:gap-6 text-[13px] text-slate-ink">
            <Link className="inline hover:text-primary transition-colors" to="/">Services</Link>
            <Link className="inline hover:text-primary transition-colors" to="/">Book Appointment</Link>
            <Link className="inline hover:text-primary transition-colors" to="/showcases">Showcases</Link>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="YouTube channel"
              className="inline-flex items-center gap-1.5 rounded-md border hairline-strong bg-background px-2.5 py-1.5 text-[12px] font-medium text-slate-ink transition-colors hover:border-primary hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0 lab-grid lab-grid-fade opacity-50" />
        <div className="relative mx-auto max-w-[1280px] px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
          <div className="inline-flex items-center gap-2 rounded-full border hairline bg-background px-3 py-1 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-slate-ink">
              Showcase &nbsp;//&nbsp; Build Gallery
            </span>
          </div>
          <h1 className="text-[48px] md:text-[64px] font-semibold leading-[1] tracking-[-0.03em] mb-6">
            Build <span className="text-primary">Showcases</span>
          </h1>
          <p className="max-w-2xl text-[16px] leading-relaxed text-slate-mute">
            Explore our completed builds, from high-end gaming rigs to compact workstations.
            Each showcase includes detailed specs, photos, and PCPartPicker links.
          </p>
        </div>
      </section>

      {/* Showcases Grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {showcases.map((showcase) => (
              <div key={showcase.id} className="space-y-8">
                {/* Image */}
                <div className="relative">
                  <img 
                    src={midnightAeroImage} 
                    alt={showcase.title}
                    className="w-full max-w-[500px] h-auto object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      console.log('Image failed to load:', e.currentTarget.src);
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder');
                      if (placeholder) placeholder.classList.remove('hidden');
                    }}
                  />
                  <span className="text-slate-mute placeholder hidden">Build Image Placeholder</span>
                </div>
              </div>
            ))}

            {/* Specs Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-[32px] font-semibold tracking-[-0.02em] mb-4">
                  {showcases[0].title}
                </h2>
                <p className="text-[16px] text-slate-mute mb-6">
                  {showcases[0].description}
                </p>
              </div>

              <div>
                <h3 className="text-[20px] font-semibold mb-4">Specifications</h3>
                <div className="space-y-3">
                  {showcases[0].specs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-[15px] text-foreground">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t hairline bg-secondary/30 py-12">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src={cclLogo} alt="Custom Core Labs logo" className="h-8 w-8 rounded-md object-cover" />
              <span className="text-[13px] font-semibold tracking-tight">
                Custom <span className="text-primary">Core</span> Labs
              </span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-slate-mute">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/#services" className="hover:text-primary transition-colors">Services</Link>
              <Link to="/#book" className="hover:text-primary transition-colors">Book</Link>
              <Link to="/showcases" className="hover:text-primary transition-colors">Showcases</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t hairline text-center text-[12px] text-slate-mute">
            © 2024 Custom Core Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}