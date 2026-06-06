import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, DollarSign } from "lucide-react";
import BuildTimeline from "@/components/BuildTimeline";
import BuildStatusBadge from "@/components/BuildStatusBadge";
import {
  type BuildRecord,
  type ApiResponse,
  STATUS_LABELS,
} from "@/lib/build-tracker";
import { trackerUrl } from "@/lib/tracker-api";

export const Route = createFileRoute("/track/$code")({
  component: TrackBuildPage,
  loader: async ({ params }) => {
    return { code: params.code };
  },
});

function TrackBuildPage() {
  const { code } = Route.useLoaderData();
  const [build, setBuild] = useState<Partial<BuildRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBuild() {
      try {
        const res = await fetch(trackerUrl(`/api/track/${code}`));
        const data: ApiResponse<Partial<BuildRecord>> = await res.json();

        if (data.ok && data.data) {
          setBuild(data.data);
        } else {
          setError(data.error || "Build not found.");
        }
      } catch {
        setError("Unable to load build data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchBuild();
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="mt-4 text-[14px] text-slate-mute">Loading build data...</p>
        </div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-5">
          <div className="text-[48px] mb-4">🔍</div>
          <h1 className="text-[24px] font-semibold tracking-tight mb-2">
            Build Not Found
          </h1>
          <p className="text-[14px] text-slate-mute mb-8">{error || "No build data available."}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/track"
              className="inline-flex items-center gap-2 rounded-md border hairline-strong bg-background px-5 py-2.5 text-[14px] font-medium hover:border-primary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Try Again
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground hover:opacity-90"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const createdDate = build.createdAt
    ? new Date(build.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <>
      {/* Build Dashboard */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="mx-auto max-w-[1000px] px-5 md:px-8">
          {/* Back link */}
          <Link
            to="/track"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-mute hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to tracking
          </Link>

          {/* Build Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary mb-1">
                Build Status
              </div>
              <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em]">
                {code}
              </h1>
            </div>
            {build.status && (
              <BuildStatusBadge status={build.status} className="self-start sm:self-center text-[12px] px-4 py-1.5" />
            )}
          </div>

          {/* Customer Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border hairline-strong bg-background p-5">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-slate-mute">
                  Drop-off Date
                </span>
              </div>
              <p className="text-[15px] font-semibold">{createdDate}</p>
            </div>
            {build.partsValue && (
              <div className="rounded-xl border hairline-strong bg-background p-5">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-slate-mute">
                    Parts Value
                  </span>
                </div>
                <p className="text-[15px] font-semibold">{build.partsValue}</p>
              </div>
            )}
            <div className="rounded-xl border hairline-strong bg-background p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-slate-mute">
                  Customer
                </span>
              </div>
              <p className="text-[15px] font-semibold">{build.customerName}</p>
            </div>
          </div>

          {/* Main Layout: Timeline + Services */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary mb-6">
                  Progress Timeline
                </div>
                {build.status && <BuildTimeline currentStatus={build.status} />}
              </div>
            </div>

            {/* Services Sidebar */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary mb-4">
                  Selected Services
                </div>
                {build.services && build.services.length > 0 ? (
                  <ul className="space-y-2">
                    {build.services.map((service, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-lg border hairline bg-secondary/20 px-4 py-3 text-[14px] font-medium"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">
                          {i + 1}
                        </span>
                        {service}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-slate-mute">No services listed.</p>
                )}

                {/* Timeline Summary */}
                {build.timeline && build.timeline.length > 0 && (
                  <div className="mt-6 border-t hairline pt-6">
                    <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute mb-3">
                      Recent Updates
                    </div>
                    <div className="space-y-2">
                      {[...build.timeline]
                        .reverse()
                        .slice(0, 4)
                        .map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-[12.5px] leading-relaxed"
                          >
                            <span className="text-primary shrink-0 mt-0.5">↳</span>
                            <div>
                              <span className="font-medium text-foreground">
                                {STATUS_LABELS[entry.status]}
                              </span>
                              <span className="text-slate-mute">
                                {" — "}
                                {new Date(entry.timestamp).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                              {entry.note && (
                                <p className="text-slate-mute mt-0.5">{entry.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup Info */}
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
                <div className="mono text-[9.5px] uppercase tracking-[0.18em] text-primary">
                  Zero-Deposit Guarantee
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-ink">
                  Payment is due only after you verify your system boots successfully at pickup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}