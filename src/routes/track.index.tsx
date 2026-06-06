import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { Search, ShieldCheck, PackageSearch } from "lucide-react";
import { trackerUrl } from "@/lib/tracker-api";

export const Route = createFileRoute("/track/")({
  component: TrackLookupPage,
});

function TrackLookupPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setError("Please enter your tracking code.");
      return;
    }

    if (trimmed.length < 6) {
      setError("Tracking code must be at least 6 characters (e.g., CCL-A7F3).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(trackerUrl(`/api/track/${trimmed}`));
      const data = await res.json();

      if (data.ok && data.data) {
        navigate({ to: `/track/${trimmed}` });
      } else {
        setError(data.error || "Build not found. Check your tracking code and try again.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-36 pb-20 md:pt-44 md:pb-28">
      <div className="mx-auto max-w-[600px] px-5 md:px-8 text-center">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-primary">
            Build Tracking Portal
          </span>
        </div>
        <h1 className="animate-fade-up-delay-1 mt-8 text-[36px] sm:text-[48px] font-semibold leading-[1] tracking-[-0.03em]">
          Track Your <span className="text-gradient-blue">Build</span>
        </h1>
        <p className="animate-fade-up-delay-2 mt-4 text-[15px] leading-relaxed text-slate-mute">
          Enter your tracking code to see real-time progress on your Custom Core Labs build.
        </p>

        {/* Lookup Form */}
        <form onSubmit={handleSubmit} className="animate-fade-up-delay-3 mt-10">
          <div className="relative">
            <div className="flex items-center rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="pl-5 pr-0">
                <PackageSearch className="h-5 w-5 text-slate-mute" />
              </div>
              <input
                id="tracking-code"
                name="tracking-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="Enter tracking code (e.g., CCL-A7F3)"
                className="flex-1 bg-transparent px-3 py-4 text-[15px] text-foreground placeholder:text-slate-mute/70 focus:outline-none"
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary px-6 py-4 text-[14px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    Track
                    <Search className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-[13px] text-red-600 text-left">{error}</p>}
        </form>

        <div className="animate-fade-up-delay-3 mt-16 rounded-xl border hairline bg-secondary/30 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
              Appointment Only
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-mute">
            Your tracking code is provided at drop-off. If you've lost your code, contact us at{" "}
            <strong className="text-foreground">cdwojick@gmail.com</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
