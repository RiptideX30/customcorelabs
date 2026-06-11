import { useMemo, useState, ReactNode } from "react";
import { z } from "zod";
import { Cpu, FileText, Link2, HelpCircle, X } from "lucide-react";

// Stubs for missing components
// Replace these with your actual components or create these files accordingly
function SubmittedState() {
  return (
    <div className="p-10 text-center text-green-600 font-bold">Form submitted successfully!</div>
  );
}

function StepHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="mono text-primary text-[14px] font-bold">{index}</div>
      <h3 className="text-[20px] font-semibold">{title}</h3>
    </div>
  );
}

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
}) {
  return (
    <label className="mb-1 flex items-center gap-2 font-semibold text-slate-700">
      <Icon className="h-4 w-4 text-primary" />
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}

type Track = "build" | "repair";

const BUILD_SERVICES = [
  { id: "assembly", title: "Full assembly & cable management", price: 159 },
  { id: "bios", title: "BIOS / firmware tuning", price: 49 },
  { id: "validation", title: "24-hour bench validation", price: 89 },
  { id: "os", title: "OS install & driver provisioning", price: 39 },
  { id: "overclock", title: "Memory + CPU overclock profile", price: 79 },
] as const;

const REPAIR_SERVICES = [
  { id: "refresh", title: "Desktop refresh & dust-out", price: 59 },
  { id: "diagnostic", title: "Bench diagnostic report", price: 49 },
  { id: "thermal", title: "Fresh thermal paste", price: 10 },
  { id: "cables", title: "Pro cable management", price: 18 },
  { id: "wipe", title: "Secure drive wipe (NIST 800-88)", price: 10 },
  { id: "software", title: "Software install", price: 39 },
] as const;

type ServiceId = (typeof BUILD_SERVICES)[number]["id"] | (typeof REPAIR_SERVICES)[number]["id"];

const validationSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().email({ message: "Enter a valid email address" }),
  phone: z.string().trim().min(10, { message: "Enter a valid phone number" }),
  pcpp: z
    .string()
    .trim()
    .max(300, { message: "Link must be under 300 characters" })
    .refine((v) => v === "" || /^https?:\/\/(www\.)?(pcpartpicker\.com|pcpp\.cc)\/.+/i.test(v), {
      message: "Enter a valid PCPartPicker URL",
    }),
  symptoms: z.string().trim().max(2000, { message: "Description must be under 2000 characters" }),
});

// PCPartPicker Instructions Modal Component
function PCPPInstructionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border hairline-strong bg-background p-6 md:p-8 shadow-[var(--shadow-elegant)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border hairline-strong text-slate-ink hover:border-primary hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mono text-[10px] uppercase tracking-[0.18em] text-primary">
          How-To Guide
        </div>
        <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em]">
          Creating a PCPartPicker List
        </h3>
        <p className="mt-2 text-[13px] text-slate-mute">
          Follow these simple steps to create your parts list:
        </p>

        <ol className="mt-6 space-y-4">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              1
            </span>
            <div>
              <div className="text-[14px] font-medium">Go to PCPartPicker</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Visit{" "}
                <a
                  href="https://pcpartpicker.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  pcpartpicker.com
                </a>{" "}
                and create a free account.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              2
            </span>
            <div>
              <div className="text-[14px] font-medium">Start a New Build</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Click "Start System Builder" or "Create New Build" from your dashboard.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              3
            </span>
            <div>
              <div className="text-[14px] font-medium">Add Your Components</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Select each component category (CPU, GPU, Motherboard, etc.) and add your desired
                parts. The site will automatically check compatibility.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              4
            </span>
            <div>
              <div className="text-[14px] font-medium">Copy the Share Link</div>
              <p className="mt-0.5 text-[13px] text-slate-mute">
                Click the "Share" button at the top, then copy the public link. Paste it in the form
                above.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-6 rounded-md border hairline bg-secondary/40 px-4 py-3 text-[13px] text-slate-mute">
          <span className="font-medium text-primary">Tip:</span> Make sure your list is set to
          "Public" so we can view it.
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}

export default function IntakeForm() {
  const [track, setTrack] = useState<Track | null>(null);
  const [services, setServices] = useState<Set<ServiceId>>(new Set());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pcpp, setPcpp] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [noPCPP, setNoPCPP] = useState(false);
  const [showPCPPModal, setShowPCPPModal] = useState(false);

  const catalog = track === "build" ? BUILD_SERVICES : REPAIR_SERVICES;

  const subtotal = useMemo(() => {
    const all = [...BUILD_SERVICES, ...REPAIR_SERVICES] as readonly {
      id: ServiceId;
      price: number;
    }[];
    return [...services].reduce((sum, id) => sum + (all.find((s) => s.id === id)?.price ?? 0), 0);
  }, [services]);

  const toggleService = (id: ServiceId) => {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pickTrack = (t: Track) => {
    if (t !== track) setServices(new Set());
    setTrack(t);
  };

  const submit = async () => {
    const check = validationSchema.safeParse({ name, email, phone, pcpp, symptoms });

    if (!check.success) {
      const e: Record<string, string> = {};
      for (const issue of check.error.issues) {
        e[issue.path[0] as string] = issue.message;
      }
      setErrors(e);
      return;
    }

    if (!consent) {
      setErrors((prev) => ({ ...prev, consent: "You must accept the terms to continue" }));
      return;
    }

    setErrors({});

    const activeServicesText = [...services]
      .map((id) => {
        const srv =
          BUILD_SERVICES.find((s) => s.id === id) || REPAIR_SERVICES.find((s) => s.id === id);
        return srv ? srv.title : id;
      })
      .join(", ");

    const payload = {
      "customer-name": name,
      "customer-phone": phone,
      "customer-email": email,
      "pcpartpicker-url": pcpp,
      "symptoms-details": symptoms,
      "selected-services": activeServicesText,
      "labor-total": `$${subtotal.toLocaleString()}`,
      "payment-terms": "100% payment due upon system boot verification and approval sign-off",
    };

    try {
      const response = await fetch("https://formspree.io/f/xlgvdlok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        alert("Submission error: " + (data.error || "Please try again."));
      }
    } catch (error) {
      alert("Error sending details to server. Please check your internet connection.");
    }
  };

  return (
    <section id="intake" className="border-b hairline bg-secondary/30">
      <PCPPInstructionsModal isOpen={showPCPPModal} onClose={() => setShowPCPPModal(false)} />
      <div className="mx-auto max-w-[1280px] px-8 py-28">
        <div className="grid grid-cols-12 items-end gap-8">
          <div className="col-span-3">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 05</div>
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute">
              Project intake · Form 003
            </div>
          </div>
          <h2 className="col-span-9 text-[56px] font-semibold leading-none tracking-[-0.03em]">
            Start a project
          </h2>
        </div>

        <div className="mt-16 overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]">
          <div className="px-8 py-10 min-h-[420px] space-y-12">
            {submitted ? (
              <SubmittedState />
            ) : (
              <>
                {/* 1. Track Picker */}
                <div>
                  <StepHeader index="01" title="What are we engineering?" />
                  <div className="mt-6 grid grid-cols-2 gap-5">
                    {[
                      {
                        id: "build" as Track,
                        title: "Is this a new custom build",
                        desc: "End-to-end assembly, validation, and tuning on components you supply.",
                      },
                      {
                        id: "repair" as Track,
                        title: "I need service for a preexisting build",
                        desc: "Bench triage and targeted servicing for an existing system.",
                      },
                    ].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => pickTrack(o.id)}
                        className={`group relative overflow-hidden rounded-xl border bg-background p-7 text-left transition-all ${
                          track === o.id
                            ? "border-primary hairline-strong shadow-[var(--shadow-glow)]"
                            : "hairline-strong hover:border-primary/60"
                        }`}
                      >
                        <div className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                          {o.id === "build" ? "TRACK / A" : "TRACK / B"}
                        </div>
                        <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">
                          {o.title}
                        </h3>
                        <p className="mt-2 text-[13.5px] text-slate-mute">{o.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Services Checkboxes */}
                {track && (
                  <div>
                    <StepHeader
                      index="02"
                      title={track === "build" ? "Select build services" : "Select repair services"}
                    />
                    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border hairline-strong bg-border">
                      {catalog.map((s) => (
                        <label
                          key={s.id}
                          className={`group flex cursor-pointer items-center justify-between gap-6 bg-background px-6 py-5 transition-colors ${
                            services.has(s.id) ? "bg-accent/40" : "hover:bg-secondary/40"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={services.has(s.id)}
                              onChange={() => toggleService(s.id)}
                              className="rounded border-slate-strong bg-background text-primary focus:ring-primary h-4 w-4"
                            />
                            <div>
                              <div className="text-[14px] font-medium">{s.title}</div>
                              <div className="mono mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-mute">
                                {s.id.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="text-[20px] font-semibold tabular-nums tracking-[-0.02em]">
                            ${s.price}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Contact & Technical Info */}
                <div>
                  <StepHeader index="03" title="Contact & Technical Details" />
                  <div className="mt-6 grid grid-cols-12 gap-6">
                    <div className="col-span-4">
                      <FieldLabel icon={Cpu}>Customer Name</FieldLabel>
                      <input
                        type="text"
                        className="url-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                      />
                      {errors.name && <FieldHint>{errors.name}</FieldHint>}
                    </div>
                    <div className="col-span-4">
                      <FieldLabel icon={Cpu}>Phone Number</FieldLabel>
                      <input
                        type="tel"
                        className="url-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(585) 555-0142"
                      />
                      {errors.phone && <FieldHint>{errors.phone}</FieldHint>}
                    </div>
                    <div className="col-span-4">
                      <FieldLabel icon={Cpu}>Email Address</FieldLabel>
                      <input
                        type="email"
                        className="url-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@email.com"
                      />
                      {errors.email && <FieldHint>{errors.email}</FieldHint>}
                    </div>
                    <div className="col-span-12 mt-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel icon={Link2}>PCPartPicker Link</FieldLabel>
                        <button
                          type="button"
                          onClick={() => setShowPCPPModal(true)}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary/80"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          How to create one
                        </button>
                      </div>
                      <input
                        type="url"
                        className="url-input"
                        value={pcpp}
                        onChange={(e) => setPcpp(e.target.value)}
                        placeholder="https://pcpartpicker.com/list/..."
                        disabled={noPCPP}
                      />
                      {errors.pcpp && <FieldHint>{errors.pcpp}</FieldHint>}
                      <label className="mt-3 inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={noPCPP}
                          onChange={(e) => {
                            setNoPCPP(e.target.checked);
                            if (e.target.checked) setPcpp("");
                          }}
                          className="rounded border-slate-strong bg-background text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-sm text-slate-mute">
                          I don't have a PCPartPicker link
                        </span>
                      </label>
                    </div>

                    <div className="col-span-12 mt-6">
                      <FieldLabel icon={FileText}>Describe hardware symptoms and issues</FieldLabel>
                      <textarea
                        className="url-input min-h-[120px]"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Example: System crashes on startup, frequent BSODs, etc."
                      />
                      {errors.symptoms && <FieldHint>{errors.symptoms}</FieldHint>}
                    </div>

                    <div className="col-span-12 mt-6">
                      <label className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        <span className="text-sm">I agree to the terms and conditions</span>
                      </label>
                      {errors.consent && <FieldHint>{errors.consent}</FieldHint>}
                    </div>

                    <div className="col-span-12 mt-10">
                      <button
                        type="button"
                        onClick={submit}
                        className="btn-primary px-8 py-3 text-lg"
                        disabled={!consent}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
