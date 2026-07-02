import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  Package,
  Warehouse,
  Wrench,
} from "lucide-react";
import cclLogo from "@/assets/ccl-logo.jpg";
import BuildStatusBadge from "@/components/BuildStatusBadge";
import { trackerUrl } from "@/lib/tracker-api";
import { type Build, type BuildTimelineEvent } from "@/lib/build-tracker.tsx";
import { getTrackForServices } from "@/lib/service-tracks";

export const Route = createFileRoute("/track/$code")({
  loader: async ({ params }) => {
    try {
      const res = await fetch(trackerUrl(`/api/track/${params.code}`), {
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      if (!data.ok) {
        return { build: null, error: data.error || "Build not found." };
      }
      return { build: data.data as Build, error: null };
    } catch (e: unknown) {
      return { build: null, error: "Could not connect to the build tracker." };
    }
  },
  component: TrackPage,
});

function TrackPage() {
  const { build, error } = Route.useLoaderData();
  const { code } = Route.useParams();

  if (!build) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center">
        <div className="max-w-sm w-full text-center px-5">
          <div className="rounded-xl border hairline-strong bg-background p-8 shadow-[var(--shadow-elegant)]">
            <h1 className="text-[22px] font-semibold tracking-tight">Tracking Code Not Found</h1>
            <p className="text-[14px] text-slate-mute mt-2">
              The code <span className="mono font-semibold text-primary">{code}</span> is invalid or
              expired. Please check your link or contact us.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-foreground antialiased">
      <TrackHeader build={build} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            <TrackTimeline build={build} />
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-slate-800">Services Included</h2>
              <ServiceDetails services={build.services} />
            </div>
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500">
                Questions about your build? Contact us at technician@cclbuilds.com
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function TrackHeader({ build }: { build: Build }) {
  const { code } = Route.useParams();

  return (
    <header className="bg-background shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <img src={cclLogo} alt="CCL Logo" className="h-9 w-9 rounded-md" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Your Custom Core Labs Build</h1>
                <p className="text-sm text-slate-500">
                  Tracking your build for {build.customerName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-500">Tracking Code</p>
              <p className="text-sm font-semibold text-primary mono">{code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <BuildStatusBadge status={build.status} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function TrackTimeline({ build }: { build: Build }) {
  const serviceTrack = getTrackForServices(build.services);

  const timelineEvents = serviceTrack.map((status, index) => {
    const event = build.timeline.find((e: BuildTimelineEvent) => e.status === status);
    return {
      name: status,
      isCompleted: !!event,
      date: event ? new Date(event.timestamp).toLocaleDateString() : null,
      isCurrent: build.timeline.length - 1 === index && build.status !== "completed",
      isFuture: build.timeline.length - 1 < index,
    };
  });

  const getIcon = (statusName: string, isCompleted: boolean, isCurrent: boolean) => {
    const iconClass = `h-5 w-5 ${isCompleted || isCurrent ? "text-white" : "text-slate-500"}`;
    const icons: { [key: string]: React.ReactNode } = {
      "Build Initiated": <FileText className={iconClass} />,
      "Parts Procured": <Package className={iconClass} />,
      Assembly: <Wrench className={iconClass} />,
      "OS & Drivers": <Loader2 className={iconClass} />,
      Validation: <CheckCircle className={iconClass} />,
      "Ready for Pickup": <Warehouse className={iconClass} />,
      "Service Complete": <CheckCircle className={iconClass} />,
    };
    return icons[statusName] || <div className="h-5 w-5" />;
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Build Progress</h2>
      <nav aria-label="Progress">
        <ol role="list" className="overflow-hidden">
          {timelineEvents.map((event, eventIdx) => (
            <li key={event.name} className="relative pb-10">
              {eventIdx !== timelineEvents.length - 1 ? (
                <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-slate-300" />
              ) : null}
              <div className="relative flex items-start group">
                <span className="h-9 flex items-center">
                  <span
                    className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full ${
                      event.isCompleted
                        ? "bg-primary"
                        : event.isCurrent
                          ? "bg-primary ring-4 ring-primary/20"
                          : "bg-slate-300"
                    }`}
                  >
                    {getIcon(event.name, event.isCompleted, event.isCurrent)}
                  </span>
                </span>
                <span className="ml-4 min-w-0 flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      event.isFuture ? "text-slate-500" : "text-slate-800"
                    }`}
                  >
                    {event.name}
                  </span>
                  {event.date && (
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {event.date}
                    </span>
                  )}
                  {event.isCurrent && (
                    <span className="text-xs text-primary font-semibold animate-pulse mt-0.5">
                      In progress...
                    </span>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function ServiceDetails({ services }: { services: string[] }) {
  if (!services || services.length === 0) {
    return (
      <p className="text-sm text-slate-500 mt-2">
        No specific services were listed for this build.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white">
      <ul role="list" className="divide-y divide-slate-200">
        {services.map((service, i) => (
          <li key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="ml-3 text-sm font-medium text-slate-700">{service}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
