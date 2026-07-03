import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { type Build } from "@/lib/build-tracker";
import { trackerFetch } from "@/lib/tracker-api";
import { CheckCircle, Circle } from "lucide-react";

// Loader function to fetch build data before rendering the component
export const Route = createFileRoute("/track/$code")({
  loader: async ({ params }) => {
    try {
      const res = await trackerFetch(`/api/track/${params.code}`);
      if (!res.ok) {
        throw notFound();
      }
      const data = await res.json();
      if (!data.ok) {
        throw notFound();
      }
      return data.data as Build;
    } catch {
      throw notFound();
    }
  },
  component: TrackPage,
  notFoundComponent: () => (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center text-center">
      <div>
        <p className="mono text-5xl font-extrabold tracking-tight text-primary">
          404
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
          Tracking Code Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-mute">
          The code you entered is invalid or has expired.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  ),
});

const TRACKING_LABELS: Record<string, string> = {
  received: "BUILD INITIATED / DATA PROFILE MATCHED",
  diagnosis: "HARDWARE MULTI-POINT DIAGNOSTIC SCAN",
  parts_ordered: "COMPONENTS SOURCED FROM DISPATCH",
  parts_received: "HARDWARE RECEIVED & VOLTAGE CHECKED",
  repairing: "MICRO-SOLDERING & COMPONENT REPAIR",
  profiling: "BASELINE COMPONENT BENCHMARK PROFILING",
  assembly: "CABLING INTEGRATION & CHASSIS ASSEMBLY",
  modification: "THERMAL MODIFICATIONS & BIOS TUNING",
  benchmarking: "HARDWARE SCORING & CLOCK AGITATION",
  thermal_testing: "24-HOUR INTEGRITY HEAT CYCLING",
  validation: "FINAL 50-POINT SENIOR LAB INSPECTION",
  ready_for_pickup: "READY FOR PICKUP IN LAB ENCLOSURE",
  completed: "ORDER PICKED UP & ARCHIVED",
};

function TrackPage() {
  const build = Route.useLoaderData();

  // Determine the active track based on build services
  let track = [
    "received",
    "parts_ordered",
    "parts_received",
    "assembly",
    "validation",
    "ready_for_pickup",
    "completed",
  ]; // Default to System Build Track
  const servicesJoined = (build.services || []).join(", ").toLowerCase();

  if (
    servicesJoined.includes("diagnostic") ||
    servicesJoined.includes("repair") ||
    servicesJoined.includes("refresh") ||
    servicesJoined.includes("wipe")
  ) {
    track = [
      "received",
      "diagnosis",
      "parts_ordered",
      "repairing",
      "validation",
      "ready_for_pickup",
      "completed",
    ];
  } else if (
    servicesJoined.includes("software") ||
    servicesJoined.includes("thermal") ||
    servicesJoined.includes("bench") ||
    servicesJoined.includes("overclock") ||
    servicesJoined.includes("tuning")
  ) {
    track = [
      "received",
      "profiling",
      "modification",
      "benchmarking",
      "thermal_testing",
      "ready_for_pickup",
      "completed",
    ];
  }

  const activeStepIndex = track.indexOf(build.status?.toLowerCase());
  const progressPercentage =
    activeStepIndex >= 0 ? (activeStepIndex / (track.length - 1)) * 100 : 0;
  const isCompleted = build.status.toLowerCase() === "completed";

  return (
    <div className="pt-8 md:pt-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-4 font-mono uppercase text-slate-800 md:grid-cols-3 text-[13px]">
        {/* Left Column: System Data Node */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
              {build.trackingCode}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-400">
              {build.customerName}
            </p>

            <div className="mt-4 space-y-2">
              <h3 className="text-[10px] font-bold tracking-widest text-slate-400">
                Selected Services
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {build.services.map((service) => (
                  <span
                    key={service}
                    className="rounded border border-blue-100 bg-blue-50/80 px-2 py-1 font-mono text-[11px] font-bold text-blue-700"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[10px] font-bold tracking-widest text-slate-400">
                Overall Progress
              </h3>
              <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200">
                <div
                  className="h-2.5 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs font-bold text-blue-600">
                {Math.round(progressPercentage)}% COMPLETE
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Main Info Panel */}
        <div className="md:col-span-2">
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            {isCompleted ? (
              <>
                <div className="relative">
                  <CheckCircle className="h-20 w-20 text-green-500" />
                  <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-green-500/10" />
                </div>
                <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-slate-900">
                  BUILD TESTING CODES COMPLETE
                </h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  ALL LAB VALIDATION SEQUENCE LOGS SECURED.
                </p>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/10" />
                    <div className="absolute inset-2 animate-pulse rounded-full bg-blue-500/10 delay-200" />
                    <p className="flex h-full w-full items-center justify-center text-4xl font-black text-blue-600">
                      {Math.round(progressPercentage)}%
                    </p>
                  </div>
                </div>
                <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-slate-900">
                  {TRACKING_LABELS[build.status.toLowerCase()] || build.status}
                </h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  LIVE LAB WORKFLOW IN PROGRESS...
                </p>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section: Horizontal Timeline Tracker */}
        <div className="md:col-span-3 mt-4 border-t border-slate-200/80 pt-6">
          <div className="flex w-full flex-row items-start justify-between gap-2 font-mono text-[11px] uppercase">
            {track.map((step, index) => {
              const isStepCompleted = activeStepIndex >= index;
              const timelineEvent = build.timeline.find(
                (e) => e.status.toLowerCase() === step.toLowerCase(),
              );

              return (
                <div
                  key={step}
                  className={`flex-1 text-center ${
                    !isStepCompleted ? "opacity-35" : ""
                  }`}
                >
                  <p className="font-bold text-slate-700">
                    {TRACKING_LABELS[step] || step.toUpperCase()}
                  </p>
                  {isStepCompleted ? (
                    <div className="mt-1">
                      <div className="mx-auto h-0.5 w-full rounded-full bg-blue-600" />
                      <p className="mt-1 text-[10px] font-semibold text-blue-600">
                        {timelineEvent
                          ? new Date(
                              timelineEvent.timestamp,
                            ).toLocaleDateString()
                          : "COMPLETED"}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="mx-auto h-0.5 w-full rounded-full bg-slate-300" />
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        [ STANDBY ]
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
