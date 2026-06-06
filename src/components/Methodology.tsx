import { Fan, Boxes, MapPin, Tag, ArrowUpRight } from "lucide-react";

export default function Methodology() {
  const pillars = [
    {
      n: "P.01",
      icon: Fan,
      title: "Desktop towers, exclusively",
      body: "We don't service laptops, prebuilts, or mini-PCs. Towers give us the thermal headroom, airflow geometry, and serviceable layouts required for sustained, validated performance under load.",
    },
    {
      n: "P.02",
      icon: Boxes,
      title: "Modular by principle",
      body: "Every build is component-addressable. Sockets, slots, and rails are documented so a future GPU swap, NVMe upgrade, or AIO refresh takes minutes — not a rebuild.",
    },
    {
      n: "P.03",
      icon: Tag,
      title: "Labor-only, no markups",
      body: "You source the parts at street price. We charge for skilled labor and bench time. No reseller margin, no inflated component sheet — only the engineering you actually paid for.",
    },
  ];

  return (
    <section id="methodology" className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-8 py-28">
        <div className="grid grid-cols-12 items-end gap-8">
          <div className="col-span-3">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 06</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              Operating principles
            </div>
          </div>
          <h2 className="col-span-9 text-[56px] font-semibold leading-[1] tracking-[-0.03em]">
            The Lab Methodology
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-8">
          {/* Left: thesis */}
          <div className="col-span-5">
            <div className="relative overflow-hidden rounded-xl border hairline-strong bg-background p-8 shadow-[var(--shadow-elegant)]">
              <div className="absolute inset-0 lab-grid opacity-30" />
              <div className="relative">
                <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                  Thesis · 001
                </div>

                <p className="mt-7 text-[22px] font-medium leading-[1.35] tracking-[-0.015em] text-foreground">
                  Custom Core Labs specializes
                  <span className="text-gradient-blue"> exclusively in desktop towers</span> — the
                  only chassis class that lets us guarantee maximum thermal efficiency and truly
                  modular performance.
                </p>

                <p className="mt-6 text-[14px] leading-relaxed text-slate-mute">
                  Constraint, not limitation. By refusing form factors that compromise airflow or
                  solder critical components in place, we deliver systems that can be tuned,
                  repaired, and upgraded for a decade.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border hairline bg-border">
                  <Metric label="Avg. ΔT under load" value="−18%" />
                  <Metric label="Avg. retail savings" value="22–34%" />
                </div>

                <div className="mono mt-8 flex items-center justify-between border-t hairline pt-5 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-primary" strokeWidth={2} />
                    Greater Rochester &amp; Victor, NY
                  </span>
                  <span>Bench / on-site</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: pillars */}
          <div className="col-span-7">
            <ol className="overflow-hidden rounded-xl border hairline-strong">
              {pillars.map((p, i) => (
                <li
                  key={p.n}
                  className={`group grid grid-cols-12 gap-6 bg-background p-7 transition-colors hover:bg-secondary/40 ${
                    i < pillars.length - 1 ? "border-b hairline" : ""
                  }`}
                >
                  <div className="col-span-2">
                    <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">
                      {p.n}
                    </div>
                    <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-md border hairline-strong bg-background transition-colors group-hover:border-primary">
                      <p.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="col-span-10">
                    <h3 className="text-[19px] font-semibold tracking-[-0.015em]">{p.title}</h3>
                    <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-slate-mute">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Service area / labor-only banner */}
            <div className="mt-6 grid grid-cols-12 gap-px overflow-hidden rounded-xl border hairline-strong bg-border">
              <div className="col-span-7 bg-background p-6">
                <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary">
                  <Tag className="h-3 w-3" strokeWidth={2} />
                  Labor-only model
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-ink">
                  You buy parts at street price. We bill bench hours.
                  <span className="text-slate-mute">
                    {" "}
                    No reseller margin between you and your hardware.
                  </span>
                </p>
              </div>
              <div className="col-span-5 bg-background p-6">
                <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary">
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  Service area
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-ink">
                  Greater Rochester &amp; Victor, NY.
                  <span className="text-slate-mute">
                    {" "}
                    Bench drop-off and on-site visits available.
                  </span>
                </p>
              </div>
            </div>

            <a
              href="#intake"
              className="group mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-primary"
            >
              Start a brief with the lab
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-4">
      <div className="mono text-[9.5px] uppercase tracking-[0.18em] text-slate-mute">{label}</div>
      <div className="mt-1 text-[22px] font-semibold tracking-[-0.025em] text-foreground">
        {value}
      </div>
    </div>
  );
}
