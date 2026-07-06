import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { type Build } from "@/lib/build-tracker";
import { trackerFetch } from "@/lib/tracker-api";
import { CheckCircle } from "lucide-react";

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
  received: "PROJECT INITIATED",
  diagnosis: "HARDWARE MULTI-POINT DIAGNOSTIC SCAN",
  parts_ordered: "COMPONENT SOURCING & ORDERING",
  parts_received: "HARDWARE RECEIVED",
  repairing: "COMPONENT REPAIR",
  profiling: "BASELINE COMPONENT BENCHMARK PROFILING",
  assembly: "CABLING INTEGRATION & CHASSIS ASSEMBLY",
  modification: "THERMAL MODIFICATIONS & BIOS TUNING",
  benchmarking: "HARDWARE SCORING & CLOCK AGITATION",
  thermal_testing: "THERMAL INTEGRITY TEST",
  validation: "FINAL BENCH VALIDATION & SYSTEM VERIFICATION",
  ready_for_pickup: "READY FOR PICKUP",
  completed: "ORDER PICKED UP & ARCHIVED",
};

function TrackPage() {
  const build = Route.useLoaderData();

  const SYSTEM_BUILD_TRACK = [
    "received",
    "parts_ordered",
    "parts_received",
    "assembly",
    "validation",
    "ready_for_pickup",
    "completed",
  ];
  const DIAGNOSTIC_TRACK = [
    "received",
    "diagnosis",
    "parts_ordered",
    "repair",
    "validation",
    "ready_for_pickup",
    "completed",
  ];
  const SERVICE_REPAIR_TRACK = [
    "received",
    "parts_ordered",
    "repairing",
    "validation",
    "ready_for_pickup",
    "completed",
  ];
  const PERFORMANCE_TUNING_TRACK = [
    "received",
    "profiling",
    "modification",
    "benchmarking",
    "thermal_testing",
    "ready_for_pickup",
    "completed",
  ];

  let track = SYSTEM_BUILD_TRACK; // Default
  const servicesJoined = (build.services || []).join(", ").toLowerCase();

  if (servicesJoined.includes("diagnostic")) {
    track = DIAGNOSTIC_TRACK;
  } else if (
    servicesJoined.includes("repair") ||
    servicesJoined.includes("refresh") ||
    servicesJoined.includes("wipe")
  ) {
    track = SERVICE_REPAIR_TRACK;
  } else if (
    servicesJoined.includes("software") ||
    servicesJoined.includes("thermal") ||
    servicesJoined.includes("bench") ||
    servicesJoined.includes("overclock") ||
    servicesJoined.includes("tuning")
  ) {
    track = PERFORMANCE_TUNING_TRACK;
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

        {/* Bottom Section: Data Grid Matrix */}
        <div className="md:col-span-3 mt-6 border-t border-slate-200/80 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-mono text-[11px] uppercase tracking-wider">
            {track.map((step, index) => {
              const isStepActive = !isCompleted && activeStepIndex === index;
              const isStepCompleted = isCompleted || activeStepIndex > index;
              const timelineEvent = build.timeline.find(
                (e) => e.status.toLowerCase() === step.toLowerCase()
              );

              let boxClass = "border-slate-200 bg-slate-50/40";
              if (isStepActive) {
                boxClass = "bg-blue-50/50 border-blue-200";
              } else if (isStepCompleted) {
                boxClass = "border-slate-200 bg-white";
              }

              return (
                <div
                  key={step}
                  className={`rounded-xl p-3 flex flex-col justify-between min-h-[68px] border transition-all ${boxClass} ${
                    !isStepCompleted && !isStepActive
                      ? "opacity-40 grayscale"
                      : ""
                  }`}
                >
                  <p className="font-bold text-slate-800 text-[12px] leading-tight">
                    {TRACKING_LABELS[step] || step.toUpperCase()}
                  </p>
                  <div className="mt-2">
                    {isStepCompleted ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600 flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          STATUS: SECURED
                        </span>
                        <span className="text-slate-400 font-semibold">
                          {timelineEvent
                            ? new Date(
                                timelineEvent.timestamp
                              ).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    ) : isStepActive ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                          <div className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></div>
                        </div>
                        <span className="font-bold text-blue-600">
                          STATUS: ACTIVE WORKFLOW
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-400">
                        STATUS: LINE STANDBY
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
