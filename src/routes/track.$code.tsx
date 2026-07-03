import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  type Build,
} from "@/lib/build-tracker";
import { trackerFetch } from "@/lib/tracker-api";
import { getTrackForServices } from "@/lib/service-tracks";
import {
  CheckCircle,
  Circle,
} from "lucide-react";

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
    completed: "ORDER PICKED UP & ARCHIVED"
};

function TrackPage() {
  const build = Route.useLoaderData();
  const track = getTrackForServices(build.services);

  if (!track) {
    return <div>Error: Build track could not be determined.</div>;
  }

  const activeStepIndex = track.indexOf(build.status);
  const progressPercentage = (activeStepIndex / (track.length - 1)) * 100;
  const isCompleted = build.status.toLowerCase() === 'completed';

  return (
    <div className="pt-8 md:pt-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-slate-800 uppercase font-mono text-[13px]">
      
          {/* Left Column: System Data Node */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
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
                      className="bg-blue-50/80 text-blue-700 border border-blue-100 font-bold px-2 py-1 rounded text-[11px] font-mono"
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
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <p className="text-blue-600 text-xs font-bold mt-1">{Math.round(progressPercentage)}% COMPLETE</p>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Core */}
          <div className="md:col-span-2">
            {isCompleted ? (
                <div className="h-full flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-center">
                    <div className="relative">
                        <CheckCircle className="h-20 w-20 text-green-500" />
                        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping -z-1" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mt-4">
                        BUILD TESTING CODES COMPLETE
                    </h2>
                    <p className="text-slate-400 text-xs font-medium tracking-wide uppercase mt-1">ALL LAB VALIDATION SEQUENCE LOGS SECURED.</p>
                    <div className="mt-6 border-t border-slate-200 w-full max-w-sm pt-4 space-y-2 text-left text-sm">
                        <div className="flex justify-between"><span className="font-bold text-slate-400">TRACKING PROFILE ID:</span> <span className="font-semibold text-slate-900">{build.trackingCode}</span></div>
                        <div className="flex justify-between"><span className="font-bold text-slate-400">CURRENT CORE STATUS:</span> <span className="font-semibold text-green-600">COMPLETED</span></div>
                        <div className="flex justify-between"><span className="font-bold text-slate-400">FINALIZATION DATE:</span> <span className="font-semibold text-slate-900">{new Date(build.timeline[build.timeline.length-1].timestamp).toLocaleDateString()}</span></div>
                    </div>
                </div>
            ) : (
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] relative">
              <div className="relative space-y-3">
                {track.map((step, index) => {
                  const timelineEvent = build.timeline.find(
                    (t) => t.status === step,
                  );
                  const isStepActive = index === activeStepIndex;
                  const isStepCompleted = index < activeStepIndex;
                  const stepLabel = TRACKING_LABELS[step] || step.toUpperCase();

                  return (
                    <div key={step} className="relative flex items-start gap-4">
                      {/* Vertical Connector Line */}
                      {index < track.length - 1 && (
                        <div
                          className={`absolute left-[9px] top-5 h-full w-0.5 ${
                            isStepCompleted ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                        {isStepCompleted ? (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        ) : isStepActive ? (
                          <div className="relative h-4 w-4">
                            <div className="absolute inset-0 rounded-full bg-blue-400/50 animate-ping" />
                            <div className="relative h-4 w-4 rounded-full bg-blue-600" />
                          </div>
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-slate-300" />
                        )}
                      </div>

                      {/* Text Content */}
                      <div className={`flex-grow pb-3 transition-opacity ${!isStepCompleted && !isStepActive ? 'opacity-30' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`font-bold text-sm ${isStepActive ? 'text-blue-700' : 'text-slate-800'}`}>
                                    {stepLabel}
                                </p>
                            </div>
                            <div className="text-right">
                            {isStepCompleted && timelineEvent && (
                                <p className="font-sans text-xs text-slate-400 font-semibold">
                                    {new Date(timelineEvent.timestamp).toLocaleTimeString([], { hour: 'numeric', minute:'2-digit' })}
                                </p>
                            )}
                            {isStepActive && (
                                <span className="inline-block rounded-md bg-blue-100/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 animate-pulse">
                                    [ ACTIVE ]
                                </span>
                            )}
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>

           {/* Live Lab Workflow Feed */}
          <div className="md:col-span-3 mt-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-4 flex items-center gap-2">🟢 LIVE LAB WORKFLOW LOGS</h3>
                    <div className="space-y-2 h-44 overflow-y-auto pr-2 font-mono text-[11px]">
                        {build.timeline.map((event, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-slate-200/50 pb-2 text-slate-600">
                            <span className="font-semibold text-slate-800">{TRACKING_LABELS[event.status.toLowerCase()] || event.status.toUpperCase()}</span>
                            <span className="text-slate-400">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        ))}
                    </div>
                </div>
          </div>
      </div>
    </div>
  );
}
