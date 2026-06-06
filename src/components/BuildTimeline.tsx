import { BUILD_STATUSES, STATUS_LABELS, STATUS_ICONS, type BuildStatus } from "@/lib/build-tracker";

export default function BuildTimeline({ currentStatus }: { currentStatus: BuildStatus }) {
  const currentIdx = BUILD_STATUSES.indexOf(currentStatus);

  return (
    <div className="relative">
      {/* Vertical line connecting all steps */}
      <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-zinc-200" />

      <div className="space-y-0">
        {BUILD_STATUSES.map((status, i) => {
          const reached = i <= currentIdx;
          const isCurrent = status === currentStatus && currentIdx < BUILD_STATUSES.length - 1;
          const isTerminal = status === "picked-up" && reached;

          return (
            <div key={status} className="relative flex items-start gap-5 pb-8 last:pb-0">
              {/* Status dot */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all ${
                  reached
                    ? isTerminal
                      ? "border-emerald-500 bg-emerald-100 text-emerald-600"
                      : "border-primary bg-primary/10 text-primary"
                    : "border-zinc-200 bg-white text-zinc-300"
                }`}
              >
                {STATUS_ICONS[status]}
              </div>

              {/* Content */}
              <div className="min-w-0 pt-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[15px] font-semibold ${
                      reached ? "text-foreground" : "text-zinc-300"
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                      In Progress
                    </span>
                  )}
                  {isTerminal && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                      ✓ Complete
                    </span>
                  )}
                </div>
                {!reached && <p className="mt-0.5 text-[13px] text-zinc-300">Pending</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
