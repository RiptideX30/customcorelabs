import { useState } from "react";
import { Check, Plus, Wrench, Cpu, HardDrive, Cable, Eraser, Download, Lock } from "lucide-react";

type MaintenanceId = "refresh" | "software" | "cables" | "wipe";

const MAINTENANCE: { id: MaintenanceId; title: string; price: number; icon: typeof Cpu; desc: string }[] = [
  { id: "refresh", title: "Desktop Refresh", price: 59, icon: Wrench, desc: "Full clean, dust-out, and bench diagnostic." },
  { id: "software", title: "Software Install", price: 39, icon: Download, desc: "OS, drivers, and toolchain provisioned." },
  { id: "cables", title: "Pro Cable Management", price: 18, icon: Cable, desc: "Routed, combed, and tied to spec." },
  { id: "wipe", title: "Secure Drive Wipe", price: 10, icon: Eraser, desc: "NIST 800-88 sanitisation with certificate." },
];

export default function Pricing() {
  const [ultimate, setUltimate] = useState(false);
  const [selected, setSelected] = useState<Set<MaintenanceId>>(new Set());
  const [thermal, setThermal] = useState(false);

  const maintenanceLocked = ultimate;
  const anyMaintenance = selected.size > 0;

  const toggleMaintenance = (id: MaintenanceId) => {
    if (maintenanceLocked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) setThermal(false);
      return next;
    });
  };

  const toggleUltimate = () => {
    setUltimate((u) => {
      const next = !u;
      if (next) {
        setSelected(new Set());
        setThermal(false);
      }
      return next;
    });
  };

  const total =
    (ultimate ? 159 : 0) +
    [...selected].reduce((sum, id) => sum + (MAINTENANCE.find((m) => m.id === id)?.price ?? 0), 0) +
    (thermal && anyMaintenance ? 10 : 0);

  return (
    <section id="pricing" className="border-b hairline">
      <div className="mx-auto max-w-[1280px] px-8 py-28">
        <div className="grid grid-cols-12 items-end gap-8">
          <div className="col-span-3">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 04</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              Transparent line items
            </div>
          </div>
          <h2 className="col-span-9 text-[56px] font-semibold leading-[1] tracking-[-0.03em]">
            Pricing
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-8">
          {/* ===== Category 1: New Builds ===== */}
          <div className="col-span-5">
            <CategoryHeader index="A" title="New Builds" count="01 line item" />

            <button
              type="button"
              onClick={toggleUltimate}
              aria-pressed={ultimate}
              className={`group relative mt-6 block w-full overflow-hidden rounded-xl border bg-background p-8 text-left transition-all ${
                ultimate
                  ? "hairline-strong border-primary shadow-[var(--shadow-glow)]"
                  : "hairline-strong hover:border-primary/60 hover:shadow-[var(--shadow-elegant)]"
              }`}
            >
              <div className="absolute inset-0 lab-grid opacity-30" />
              <div className="relative">
                <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    SKU · CCL-BUILD-ULT
                  </span>
                  <span className={ultimate ? "text-primary" : ""}>
                    {ultimate ? "SELECTED ✓" : "01 / 01"}
                  </span>
                </div>

                <h3 className="mt-8 text-[28px] font-semibold tracking-[-0.02em]">
                  The Ultimate Build
                </h3>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-slate-mute">
                  End-to-end assembly, BIOS tuning, and 24-hour bench validation
                  on your supplied components.
                </p>

                <div className="mt-8 flex items-baseline gap-2">
                  <span className="mono text-[14px] text-slate-mute">$</span>
                  <span className="text-[64px] font-semibold leading-none tracking-[-0.04em]">159</span>
                  <span className="mono ml-2 text-[11px] uppercase tracking-[0.16em] text-slate-mute">
                    flat / labor
                  </span>
                </div>

                <div className="mt-8 flex items-center justify-between border-t hairline pt-5">
                  <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
                    Tap to {ultimate ? "deselect" : "select"}
                  </span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                      ultimate
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hairline-strong text-slate-mute group-hover:border-primary group-hover:text-primary"
                    }`}
                  >
                    {ultimate ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </div>
            </button>

            <p className="mono mt-4 flex items-start gap-2 text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-slate-mute">
              <span className="text-primary">↳</span>
              For builds over $1,500, labor is 8% + $49 setup fee.
            </p>
          </div>

          {/* ===== Category 2: Maintenance ===== */}
          <div className="col-span-7">
            <CategoryHeader index="B" title="Repair &amp; Maintenance" count="04 line items" />

            <div
              className={`relative mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border hairline-strong bg-border transition-all ${
                maintenanceLocked ? "opacity-40" : ""
              }`}
              aria-disabled={maintenanceLocked}
            >
              {MAINTENANCE.map((m) => {
                const active = selected.has(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMaintenance(m.id)}
                    disabled={maintenanceLocked}
                    aria-pressed={active}
                    className={`group relative bg-background p-6 text-left transition-colors ${
                      maintenanceLocked
                        ? "cursor-not-allowed"
                        : active
                          ? "bg-accent/40"
                          : "hover:bg-secondary/40"
                    }`}
                  >
                    <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                      <span className="flex items-center gap-1.5">
                        <m.icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                        {m.id.toUpperCase()}
                      </span>
                      <span className={active ? "text-primary" : ""}>
                        {active ? "ADDED ✓" : ""}
                      </span>
                    </div>
                    <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{m.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-mute">{m.desc}</p>
                    <div className="mt-5 flex items-end justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="mono text-[11px] text-slate-mute">$</span>
                        <span className="text-[28px] font-semibold leading-none tracking-[-0.03em]">{m.price}</span>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hairline-strong text-slate-mute group-hover:border-primary group-hover:text-primary"
                        }`}
                      >
                        {active ? <Check className="h-3 w-3" strokeWidth={2.5} /> : <Plus className="h-3 w-3" />}
                      </div>
                    </div>
                  </button>
                );
              })}

              {maintenanceLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
                  <div className="mono flex items-center gap-2 rounded-full border hairline-strong bg-background px-4 py-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-ink shadow-[var(--shadow-elegant)]">
                    <Lock className="h-3 w-3 text-primary" strokeWidth={2} />
                    Included in The Ultimate Build
                  </div>
                </div>
              )}
            </div>

            {/* Conditional add-on */}
            <div
              className={`mt-4 overflow-hidden transition-all duration-300 ${
                anyMaintenance ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
              aria-hidden={!anyMaintenance}
            >
              <button
                type="button"
                onClick={() => setThermal((t) => !t)}
                aria-pressed={thermal}
                className={`flex w-full items-center justify-between rounded-lg border bg-background px-5 py-4 text-left transition-all ${
                  thermal ? "border-primary hairline-strong" : "hairline-strong hover:border-primary/60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                      thermal ? "border-primary bg-primary text-primary-foreground" : "hairline-strong"
                    }`}
                  >
                    {thermal && <Check className="h-3 w-3" strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">Add-on</div>
                    <div className="mt-0.5 text-[14px] font-medium">Fresh Thermal Paste</div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="mono text-[11px] text-slate-mute">+ $</span>
                  <span className="text-[20px] font-semibold tracking-[-0.02em]">10</span>
                </div>
              </button>
            </div>

            {/* Live total */}
            <div className="mt-6 flex items-center justify-between rounded-lg border hairline bg-secondary/40 px-5 py-4">
              <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
                Estimated total
              </div>
              <div className="flex items-baseline gap-1">
                <span className="mono text-[12px] text-slate-mute">$</span>
                <span className="text-[26px] font-semibold tracking-[-0.02em] tabular-nums">{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryHeader({ index, title, count }: { index: string; title: string; count: string }) {
  return (
    <div className="flex items-center justify-between border-b hairline pb-3">
      <div className="flex items-center gap-3">
        <span className="mono flex h-6 w-6 items-center justify-center rounded-md border hairline-strong bg-background text-[10px] font-semibold text-primary">
          {index}
        </span>
        <h3 className="text-[20px] font-semibold tracking-tight" dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">{count}</span>
    </div>
  );
}
