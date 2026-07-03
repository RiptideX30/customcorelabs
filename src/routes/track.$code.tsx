import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CircleEllipsis,
  Loader2,
  PackageSearch,
} from "lucide-react";
import cclLogo from "@/assets/ccl-logo.jpg";
import BuildStatusBadge from "@/components/BuildStatusBadge";
import { trackerFetch } from "@/lib/tracker-api";
import { type Build } from "@/lib/build-tracker.tsx";
import { getTrackForServices } from "@/lib/service-tracks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track/$code")({
  component: TrackPage,
});

function TrackPage() {
  const { code } = Route.useParams();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    trackerFetch(`/api/track/${code}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) {
          setBuild(res.data);
        } else {
          setError(res.error || "Could not find build.");
        }
      })
      .catch(() => setError("Unable to connect to build tracker."))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="mt-4 text-[15px] text-slate-mute">Loading build status...</p>
        </div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50 px-5">
        <div className="max-w-md rounded-xl border hairline-strong bg-background p-8 text-center shadow-[var(--shadow-elegant)]">
          <PackageSearch className="mx-auto h-16 w-16 text-slate-400" />
          <h1 className="mt-6 text-[22px] font-semibold tracking-tight">
            Build Not Found
          </h1>
          <p className="mt-1.5 text-slate-mute">
            The tracking code <span className="mono font-semibold text-primary">{code}</span> could
            not be found. Please check the code and try again.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const track = getTrackForServices(build.services) || [];
  const activeStepIndex = (build.timeline || []).length - 1;
  const isComplete = build.status === "completed";

  return (
    <main className="min-h-screen bg-slate-50/50 antialiased">
      <header className="border-b hairline bg-background/80 backdrop-blur-sm sticky top-0">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <img src={cclLogo} alt="CCL" className="h-7 w-7 rounded-md" />
            <span className="text-[13px] font-semibold">Build Tracker</span>
          </Link>
          <Link
            to="/"
            className="text-[12px] font-medium text-primary hover:underline"
          >
            Check another build
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12">
        {/* --- Top Summary --- */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-slate-mute">
            Tracking Code
          </p>
          <h1 className="mono mt-1 text-4xl font-bold text-primary">
            {build.trackingCode}
          </h1>
          <p className="mt-3 text-lg text-foreground">
            Hi {build.customerName}, here's the status of your build.
          </p>
          <div className="mt-2 inline-block">
          <BuildStatusBadge status={build.status} />
          </div>
        </div>

        {/* --- Visual Timeline --- */}
        <div className="mt-12">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            {track.map((step, index) => {
              const isCompleted = isComplete || index < activeStepIndex;
              const isActive = !isComplete && index === activeStepIndex;
              const isUpcoming = !isComplete && index > activeStepIndex;
              
              const timelineEvent = build.timeline?.find(e => e.status === step);

              return (
                <div key={step} className="contents">
                  <div className="flex flex-col items-center">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : isActive ? (
                      <CircleEllipsis className="h-6 w-6 text-blue-500 animate-pulse" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-300" />
                    )}
                    {index < track.length - 1 && (
                       <div className={cn("w-px h-full my-1",
                         isCompleted ? "bg-emerald-500" : "bg-slate-300"
                       )}></div>
                    )}
                  </div>
                  <div className={cn("pb-10", isUpcoming && "text-slate-400")}>
                    <p className={cn("font-semibold", isActive && "text-blue-600")}>{step}</p>
                    {isActive && (
                      <p className="text-sm text-blue-500">In progress...</p>
                    )}
                    {timelineEvent && (
                      <p className="text-xs text-slate-mute mt-0.5">
                        {new Date(timelineEvent.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Services Selected --- */}
        {build.services && build.services.length > 0 && (
          <div className="mt-4 rounded-xl border hairline-strong bg-background p-5 shadow-[var(--shadow-subtle)]">
            <h3 className="font-semibold">Services Selected</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {build.services.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* --- Footer --- */}
        <footer className="mt-12 border-t hairline-strong pt-6 text-center">
          <p className="text-sm text-slate-mute">
            Questions about your build? Contact us at{" "}
            <a
              href="mailto:technician@cclbuilds.com"
              className="font-medium text-primary hover:underline"
            >
              technician@cclbuilds.com
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
