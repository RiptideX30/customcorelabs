import { Cpu, Gpu, Fan, MonitorPlay, Wind, ArrowUpRight } from "lucide-react";

const SPECS = [
  { icon: Cpu, label: "CPU", value: "AMD Ryzen 5 5500", meta: "6C / 12T · 65 W" },
  { icon: Gpu, label: "GPU", value: "AMD Radeon RX 7600", meta: "8 GB GDDR6 · RDNA 3" },
  {
    icon: Fan,
    label: "Cooling",
    value: "9-fan high-airflow",
    meta: "Positive pressure · push-pull",
  },
  {
    icon: MonitorPlay,
    label: "Target",
    value: "1080p / high-refresh",
    meta: "Ultra preset · 144 Hz+",
  },
];

const TELEMETRY = [
  { k: "Avg. CPU ΔT", v: "58 °C", note: "load" },
  { k: "Avg. GPU ΔT", v: "62 °C", note: "load" },
  { k: "Idle dBA", v: "23", note: "@ 1 m" },
  { k: "Power draw", v: "245 W", note: "peak" },
];

export default function CaseStudy() {
  return (
    <section id="case-study" className="border-b hairline bg-secondary/30">
      <div className="mx-auto max-w-[1280px] px-8 py-28">
        <div className="grid grid-cols-12 items-end gap-8">
          <div className="col-span-3">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 07</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              From the bench
            </div>
          </div>
          <h2 className="col-span-9 text-[56px] font-semibold leading-[1] tracking-[-0.03em]">
            Case Study
          </h2>
        </div>

        <div className="mt-16 overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]">
          {/* Header strip */}
          <div className="flex items-center justify-between border-b hairline px-7 py-4">
            <div className="mono flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-mute">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                Project / 01
              </span>
              <span className="h-3 w-px bg-border-strong" />
              <span>Status · Reference build</span>
              <span className="h-3 w-px bg-border-strong" />
              <span>Builder's personal rig</span>
            </div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
              CCL-REF-BOS-01
            </div>
          </div>

          <div className="grid grid-cols-12">
            {/* Left: title + viewport */}
            <div className="relative col-span-7 border-r hairline">
              <div className="px-10 pt-12 pb-8">
                <div className="mono text-[11px] uppercase tracking-[0.22em] text-primary">
                  Project 01
                </div>
                <h3 className="mt-3 text-[64px] font-semibold leading-[0.95] tracking-[-0.035em]">
                  Black-Out
                  <br />
                  <span className="text-gradient-blue">Stealth.</span>
                </h3>
                <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-slate-mute">
                  The builder's personal reference machine. Tuned for sustained 1080p high-refresh
                  performance in a black-on-black chassis, with a nine-fan airflow stack chosen to
                  keep junction temperatures well below thermal limits — even after hours under
                  load.
                </p>
              </div>

              {/* Black-on-black tower viewport */}
              <div className="relative mx-10 mb-10 h-[300px] overflow-hidden rounded-xl border hairline-strong bg-foreground/95">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, oklch(1 0 0 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* Tower silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 220 260" className="h-[85%]">
                    <defs>
                      <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="oklch(1 0 0 / 0.06)" />
                        <stop offset="100%" stopColor="oklch(0.62 0.24 255 / 0.12)" />
                      </linearGradient>
                    </defs>
                    {/* Chassis */}
                    <rect
                      x="20"
                      y="10"
                      width="180"
                      height="240"
                      rx="6"
                      fill="oklch(0.18 0.02 250)"
                      stroke="oklch(1 0 0 / 0.08)"
                    />
                    {/* Glass panel */}
                    <rect
                      x="30"
                      y="20"
                      width="160"
                      height="220"
                      rx="3"
                      fill="url(#glass)"
                      stroke="oklch(1 0 0 / 0.08)"
                    />
                    {/* Internal components */}
                    <rect
                      x="40"
                      y="30"
                      width="140"
                      height="42"
                      rx="2"
                      fill="oklch(0.22 0.02 250)"
                      stroke="oklch(1 0 0 / 0.06)"
                    />
                    <rect
                      x="40"
                      y="80"
                      width="100"
                      height="70"
                      rx="2"
                      fill="oklch(0.22 0.02 250)"
                      stroke="oklch(1 0 0 / 0.06)"
                    />
                    <rect
                      x="40"
                      y="160"
                      width="140"
                      height="32"
                      rx="2"
                      fill="oklch(0.22 0.02 250)"
                      stroke="oklch(1 0 0 / 0.06)"
                    />
                    {/* GPU LED */}
                    <rect
                      x="42"
                      y="84"
                      width="2"
                      height="62"
                      fill="oklch(0.62 0.24 255)"
                      opacity="0.85"
                    />
                    {/* Side fan grid (3 visible behind glass) */}
                    {[0, 1, 2].map((i) => (
                      <g key={i} transform={`translate(155, ${30 + i * 70})`}>
                        <circle r="20" cx="20" cy="20" fill="none" stroke="oklch(1 0 0 / 0.12)" />
                        <circle r="3" cx="20" cy="20" fill="oklch(0.62 0.24 255)" opacity="0.7" />
                        <path
                          d="M20 4 A16 16 0 0 1 33 28"
                          stroke="oklch(1 0 0 / 0.18)"
                          strokeWidth="1.2"
                          fill="none"
                        />
                        <path
                          d="M33 28 A16 16 0 0 1 7 28"
                          stroke="oklch(1 0 0 / 0.18)"
                          strokeWidth="1.2"
                          fill="none"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div className="mono text-[9.5px] uppercase tracking-[0.18em] text-background/60">
                    Render · isometric reference
                  </div>
                  <div className="mono flex items-center gap-1.5 rounded-full border border-primary/40 bg-foreground/40 px-2.5 py-1 text-[9.5px] uppercase tracking-[0.18em] text-primary backdrop-blur">
                    <Wind className="h-2.5 w-2.5" strokeWidth={2.5} />9 × 120 mm
                  </div>
                </div>
              </div>
            </div>

            {/* Right: spec sheet */}
            <div className="col-span-5 flex flex-col">
              <div className="border-b hairline px-8 py-5">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                  Configuration sheet
                </div>
                <div className="mt-1 text-[16px] font-semibold tracking-tight">
                  Specifications · v1.0
                </div>
              </div>

              <ul className="flex-1">
                {SPECS.map((s, i) => (
                  <li
                    key={s.label}
                    className={`flex items-start gap-4 px-8 py-5 ${
                      i < SPECS.length - 1 ? "border-b hairline" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border hairline-strong bg-background">
                      <s.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1">
                      <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                        {s.label}
                      </div>
                      <div className="mt-1 text-[15px] font-medium tracking-tight text-foreground">
                        {s.value}
                      </div>
                      <div className="mono mt-0.5 text-[10.5px] uppercase tracking-[0.16em] text-slate-mute">
                        {s.meta}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t hairline bg-secondary/30 px-8 py-5">
                <div className="mono mb-3 text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                  Bench telemetry · sustained
                </div>
                <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border hairline bg-border">
                  {TELEMETRY.map((t) => (
                    <div key={t.k} className="bg-background p-3">
                      <div className="mono text-[9px] uppercase tracking-[0.18em] text-slate-mute">
                        {t.k}
                      </div>
                      <div className="mt-1 text-[15px] font-semibold tabular-nums tracking-tight">
                        {t.v}
                      </div>
                      <div className="mono text-[9px] uppercase tracking-[0.16em] text-slate-mute">
                        {t.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t hairline px-8 py-5">
                <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
                  Filed · Lab Archive
                </div>
                <a
                  href="#intake"
                  className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-primary"
                >
                  Brief a similar build
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
