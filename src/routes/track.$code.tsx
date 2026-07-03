import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  type Build,
  type BuildStatus,
} from "@/lib/build-tracker";
import { trackerFetch } from "@/lib/tracker-api";
import { getTrackForServices } from "@/lib/service-tracks";
import {
  CheckCircle,
  Circle,
  Clock,
  HardDrive,
  User,
  Wrench,
  ShieldCheck,
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

const STEP_DETAILS: Record<string, { title: string; subtitle: string }> = {
    received: { title: "ORDER RECEIVED", subtitle: "BUILD PROFILE INITIALIZED IN SYSTEM" },
    diagnosis: { title: "SYSTEM DIAGNOSIS", subtitle: "RUNNING HARDWARE DIAGNOSTIC SEQUENCES" },
    parts_ordered: { title: "PARTS ORDERED", subtitle: "SOURCING HARDWARE COMPONENTS FROM LAB" },
    parts_received: { title: "PARTS RECEIVED", subtitle: "HARDWARE ARRIVED & VERIFIED AT LAB" },
    repairing: { title: "HARDWARE REPAIR", subtitle: "PERFORMING COMPONENT LEVEL REPAIRS" },
    profiling: { title: "BASELINE PROFILING", subtitle: "TESTING STOCK SYSTEM VOLTAGE CURVES" },
    assembly: { title: "SYSTEM ASSEMBLY", subtitle: "BUILD ASSEMBLED WITH PREMIUM CABLING" },
    modification: { title: "HARDWARE MODIFICATION", subtitle: "APPLYING CUSTOM LOOPS & HARDWARE TUNING" },
    benchmarking: { title: "STRESS BENCHMARKING", subtitle: "VERIFYING PULL RATES & SYSTEM SCORE CARDS" },
    thermal_testing: { title: "THERMAL INTEGRITY TEST", subtitle: "RUNNING 24HR TEMPERATURE HEAT CYCLING" },
    validation: { title: "QUALITY VALIDATION", subtitle: "RUNNING FINAL 50-POINT SAFETY CHECKLIST" },
    ready_for_pickup: { title: "READY FOR PICKUP!", subtitle: "BUILD PACKAGED & CLEANED FOR COLLECTION" },
    completed: { title: "ORDER FINALIZED", subtitle: "MACHINE HANDED OFF TO CUSTOMER PROFILE" }
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto px-4 py-4">
      {/* Left Column: System Data Node */}
      <div className="md:col-span-1 space-y-4">
        <div className="p-4 rounded-xl border hairline-strong bg-background shadow-lg">
          <p className="mono text-3xl font-extrabold tracking-tight text-primary uppercase">
            {build.trackingCode}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-mute uppercase">
            {build.customerName}
          </p>

          <div className="mt-4 space-y-2">
            <h3 className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
              Selected Services
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {build.services.map((service) => (
                <span
                  key={service}
                  className="inline-block bg-slate-800 text-slate-300 rounded-full px-2.5 py-0.5 text-xs font-mono uppercase"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
              Overall Progress
            </h3>
            <div className="mt-2 w-full bg-slate-700/50 rounded-full h-2.5">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
             <p className="mono text-primary text-xs font-bold mt-1">{Math.round(progressPercentage)}% COMPLETE</p>
          </div>
        </div>
      </div>

      {/* Right Column: High-Tech Timeline Core */}
      <div className="md:col-span-2">
        {isCompleted ? (
            <div className="h-full flex flex-col items-center justify-center rounded-xl border hairline-strong bg-background p-8 shadow-lg text-center">
                <div className="relative">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                    <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping -z-1" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight uppercase mt-4">
                    Build Mission Completed
                </h2>
                <p className="text-slate-mute text-sm mt-1">THIS ORDER HAS BEEN FINALIZED AND CLOSED.</p>
                <div className="mt-6 border-t hairline-strong w-full max-w-sm pt-4 space-y-2 text-left text-sm">
                    <div className="flex justify-between"><span className="font-mono uppercase text-slate-mute">Tracking ID:</span> <span className="font-mono text-foreground font-semibold">{build.trackingCode}</span></div>
                    <div className="flex justify-between"><span className="font-mono uppercase text-slate-mute">Final Status:</span> <span className="font-mono text-green-400 font-semibold">COMPLETED</span></div>
                    <div className="flex justify-between"><span className="font-mono uppercase text-slate-mute">Completed On:</span> <span className="font-mono text-foreground font-semibold">{new Date(build.timeline[build.timeline.length-1].timestamp).toLocaleDateString()}</span></div>
                </div>
            </div>
        ) : (
        <div className="p-4 rounded-xl border hairline-strong bg-background shadow-lg relative">
          <div className="relative space-y-3">
            {track.map((step, index) => {
              const timelineEvent = build.timeline.find(
                (t) => t.status === step,
              );
              const isStepActive = index === activeStepIndex;
              const isStepCompleted = index < activeStepIndex;

              const stepDetails = STEP_DETAILS[step] || { title: step.toUpperCase(), subtitle: "STATUS UPDATE" };

              return (
                <div key={step} className="relative flex items-start gap-4">
                  {/* Vertical Connector Line */}
                  {index < track.length - 1 && (
                    <div
                      className={`absolute left-[9px] top-5 h-full w-0.5 ${
                        isStepCompleted ? "bg-green-500" : "bg-slate-700"
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                    {isStepCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isStepActive ? (
                      <div className="relative h-4 w-4">
                        <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping" />
                        <div className="relative h-4 w-4 rounded-full bg-cyan-400" />
                      </div>
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </div>

                  {/* Text Content */}
                  <div className={`flex-grow pb-3 transition-opacity ${!isStepCompleted && !isStepActive ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`font-bold uppercase text-sm ${isStepActive ? 'text-primary' : 'text-foreground'}`}>
                                {stepDetails.title}
                            </p>
                            <p className="text-[11px] font-mono uppercase text-slate-mute">{stepDetails.subtitle}</p>
                        </div>
                        <div className="text-right">
                        {isStepCompleted && timelineEvent && (
                            <p className="font-mono text-xs text-green-400">
                                {new Date(timelineEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                            </p>
                        )}
                        {isStepActive && (
                            <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary animate-pulse mono">
                                [ LIVE ]
                            </span>
                        )}
                        {!isStepCompleted && !isStepActive && (
                            <p className="font-mono text-xs text-slate-500">[ STANDBY... ]</p>
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
    </div>
  );
}
