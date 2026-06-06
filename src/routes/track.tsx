import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import cclLogo from "@/assets/ccl-logo.jpg";

export const Route = createFileRoute("/track")({
  component: TrackLayout,
});

function TrackLayout() {
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
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>

      <Outlet />
    </main>
  );
}
