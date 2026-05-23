import { useMemo, useState } from "react"; 
import { z } from "zod"; 
import { ArrowLeft, ArrowRight, Check, Cpu, Wrench, Link2, FileText, ShieldCheck, AlertCircle, } from "lucide-react"; 

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

type ServiceId = | (typeof BUILD_SERVICES)[number]["id"] | (typeof REPAIR_SERVICES)[number]["id"]; 

/* Validation — runs before submission */ 
const detailsSchema = z.object({ 
  pcpp: z .string() .trim() .max(300, { message: "Link must be under 300 characters" }) .refine( (v) => v === "" || /^https?:\/\/(www\.)?(pcpartpicker\.com|pcpp\.cc)\/.+/i.test(v), { message: "Enter a valid PCPartPicker URL" }, ), 
  symptoms: z .string() .trim() .max(2000, { message: "Description must be under 2000 characters" }), 
}); 

const finalSchema = z.object({ 
  consent: z.literal(true, { message: "You must accept the terms to continue" }), 
}); 

const STEPS = [ 
  { n: "01", label: "Project type" }, 
  { n: "02", label: "Services" }, 
  { n: "03", label: "Details" }, 
  { n: "04", label: "Summary" }, 
] as const; 

export default function IntakeForm() { 
  const [step, setStep] = useState(0); 
  const [track, setTrack] = useState<Track | null>(null); 
  const [services, setServices] = useState<Set<ServiceId>>(new Set()); 
  const [pcpp, setPcpp] = useState(""); 
  const [symptoms, setSymptoms] = useState(""); 
  const [consent, setConsent] = useState(false); 
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false); 
  const [errors, setErrors] = useState<Record<string, string>>({}); 

  const catalog = track === "build" ? BUILD_SERVICES : REPAIR_SERVICES; 

  const subtotal = useMemo(() => { 
    const all = [...BUILD_SERVICES, ...REPAIR_SERVICES] as readonly { id: ServiceId; price: number; }[]; 
    return [...services].reduce( (sum, id) => sum + (all.find((s) => s.id === id)?.price ?? 0), 0, ); 
  }, [services]); 

  const deposit = Math.round(subtotal * 0.2); 

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

  // Fixed: canAdvance now ONLY checks values, it never sets state!
  const canAdvance = () => { 
    if (step === 0) return track !== null; 
    if (step === 1) return services.size > 0; 
    if (step === 2) { 
      const r = detailsSchema.safeParse({ pcpp, symptoms }); 
      return r.success; 
    } 
    return true; 
  }; 

  // Fixed: validation state handling moved safely into the execution handler click trigger
  const next = () => { 
    if (step === 2) {
      const r = detailsSchema.safeParse({ pcpp, symptoms }); 
      if (!r.success) { 
        const e: Record<string, string> = {}; 
        for (const i of r.error.issues) e[i.path[0] as string] = i.message; 
        setErrors(e); 
        return; // Stop here if invalid
      } 
      setErrors({}); 
    }
    
    if (canAdvance()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1)); 
    }
  }; 

  const back = () => setStep((s) => Math.max(s - 1, 0)); 

  // Formspree Submission Integration Block
  const submit = async (e: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setErrors({});

    // Compiles selected service list into text
    const activeServicesText = [...services].join(", ");

    try {
      // 1. Package all values into a flat object Formspree natively accepts
                const payload = {
      "customer-name": name,
      "customer-phone": phone,
      "customer-email": email,
      "pcpartpicker-url": pcpp,
      "symptoms-details": symptoms,
      "selected-services": activeServicesText,
      "labor-total": subtotal
    };

      // 2. Submit using Formspree's accepted AJAX layout
      const response = await fetch("https://formspree.io/f/xlgvdlok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        console.error("Formspree rejected the request:", data);
        alert("Submission error: " + (data.error || "Please try again."));
      }
    } catch (error) {
      console.error("Formspree upload network failed:", error);
      alert("Error sending details to server. Please check your internet connection.");
    }
  };

  return ( 
    <section id="intake" className="border-b hairline bg-secondary/30"> 
      <div className="mx-auto max-w-[1280px] px-8 py-28"> 
        <div className="grid grid-cols-12 items-end gap-8"> 
          <div className="col-span-3"> 
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 05</div> 
            <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute"> Project intake · Form 003 </div> 
          </div> 
          <h2 className="col-span-9 text-[56px] font-semibold leading-[1] tracking-[-0.03em]"> Start a project </h2> 
        </div> 
        <div className="mt-16 overflow-hidden rounded-xl border hairline-strong bg-background shadow-[var(--shadow-elegant)]"> 
          {/* Stepper */} 
          <div className="border-b hairline px-8 py-5"> 
            <ol className="grid grid-cols-4 gap-px overflow-hidden rounded-md border hairline bg-border"> 
              {STEPS.map((s, i) => { 
                const state = i < step ? "done" : i === step ? "active" : "todo"; 
                return ( 
                  <li key={s.n} className={`flex items-center gap-3 bg-background px-4 py-2.5 ${ state === "active" ? "bg-accent/30" : "" }`} > 
                    <span className={`mono flex h-5 w-5 items-center justify-center rounded-full border text-[9.5px] font-semibold ${ state === "done" ? "border-primary bg-primary text-primary-foreground" : state === "active" ? "border-primary text-primary" : "hairline-strong text-slate-mute" }`} > 
                      {state === "done" ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : s.n} 
                    </span> 
                    <span className={`text-[12.5px] font-medium ${ state === "todo" ? "text-slate-mute" : "text-foreground" }`} > 
                      {s.label} </span> 
                  </li> 
                ); 
              })} 
            </ol> 
          </div> 
          {/* Body */} 
          <div className="px-8 py-10 min-h-[420px]"> 
            {submitted ? ( 
              <SubmittedState track={track!} subtotal={subtotal} deposit={deposit} />
            ) : step === 0 ? ( 
              <StepTrack track={track} onPick={pickTrack} />
) : step === 1 ? ( 
  <StepServices track={track!} services={services} catalog={catalog} onToggle={toggleService} /> 
) : step === 2 ? ( 
  <StepDetails track={track!} pcpp={pcpp} setPcpp={setPcpp} symptoms={symptoms} setSymptoms={setSymptoms} name={name} setName={setName} phone={phone} setPhone={setPhone} email={email} setEmail={setEmail} errors={errors} />
) : ( 
 <StepSummary track={track!} services={services} catalog={[...BUILD_SERVICES, ...REPAIR_SERVICES]} subtotal={subtotal} deposit={deposit} pcpp={pcpp} symptoms={symptoms} name={name} phone={phone} email={email} consent={consent} setConsent={setConsent} error={errors.consent} />
)} 
</div> 

{/* Footer / nav */} 
{!submitted && ( 
  <div className="flex items-center justify-between border-t hairline bg-secondary/30 px-8 py-5"> 
    <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-slate-mute"> 
      Step {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} 
      {subtotal > 0 && ( 
        <span className="ml-3 text-primary"> Est. ${subtotal.toLocaleString()} </span> 
      )} 
    </div> 
    <div className="flex items-center gap-2"> 
      <button type="button" onClick={back} disabled={step === 0} className="inline-flex items-center gap-1.5 rounded-md border hairline-strong bg-background px-4 py-2 text-[13px] font-medium text-slate-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-slate-ink" > 
        <ArrowLeft className="h-3.5 w-3.5" /> Back 
      </button> 
      
      {step < STEPS.length - 1 ? ( 
        <button type="button" onClick={next} className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground transition-all hover:opacity-95" > 
          Continue <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /> 
        </button> 
      ) : ( 
        <button type="button" onClick={submit} className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-95" > 
          Submit brief <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> 
        </button> 
      )} 
    </div> 
  </div> 
)} 
</div> 
</div> 
</section> ); } 

/* ---------- Step 1 ---------- */ 
function StepTrack({ track, onPick }: { track: Track | null; onPick: (t: Track) => void }) { 
  const opts: { id: Track; icon: typeof Cpu; title: string; desc: string; meta: string }[] = [ 
    { id: "build", icon: Cpu, title: "Is this a new custom build", desc: "End-to-end assembly, validation, and tuning on components you supply.", meta: "Turnaround · 2–4 days", }, 
    { id: "repair", icon: Wrench, title: "I need service for a preexisting build", desc: "Bench triage and targeted servicing for an existing system.", meta: "Turnaround · 2–4 days", }, 
  ]; 
  
  return ( 
    <div> 
      <StepHeader index="01" title="What are we engineering?" /> 
      <div className="mt-10 grid grid-cols-2 gap-5"> 
        {opts.map((o) => { 
          const active = track === o.id; 
          return ( 
            <button key={o.id} type="button" onClick={() => onPick(o.id)} aria-pressed={active} className={`group relative overflow-hidden rounded-xl border bg-background p-7 text-left transition-all ${ active ? "border-primary hairline-strong shadow-[var(--shadow-glow)]" : "hairline-strong hover:border-primary/60 hover:shadow-[var(--shadow-elegant)]" }`} > 
              <div className="absolute inset-0 lab-grid opacity-30" /> 
              <div className="relative"> 
                <div className="mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-mute"> 
                  <span>{o.id === "build" ? "TRACK / A" : "TRACK / B"}</span> 
                  <span className={active ? "text-primary" : ""}> {active ? "SELECTED ✓" : ""} </span> 
                </div> 
                <o.icon className="mt-7 h-7 w-7 text-primary" strokeWidth={1.5} /> 
                <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">{o.title}</h3> 
                <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-slate-mute">{o.desc}</p> 
                <div className="mono mt-7 flex items-center justify-between border-t hairline pt-4 text-[10.5px] uppercase tracking-[0.18em] text-slate-mute"> 
                  <span>{o.meta}</span> 
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${ active ? "border-primary bg-primary text-primary-foreground" : "hairline-strong group-hover:border-primary group-hover:text-primary" }`} > 
                    {active ? <Check className="h-3 w-3" strokeWidth={3} /> : <ArrowRight className="h-3 w-3" />} 
                  </span> 
                </div> 
              </div> 
            </button> 
          ); 
        })} 
      </div> 
    </div> 
  ); 
} 

/* ---------- Step 2 ---------- */ 
function StepServices({ track, services, catalog, onToggle, }: { track: Track; services: Set<ServiceId>; catalog: readonly { id: ServiceId; title: string; price: number }[]; onToggle: (id: ServiceId) => void; }) { 
  return ( 
    <div> 
      <StepHeader index="02" title={track === "build" ? "Select build services" : "Select repair services"} sub={`Pick one or more line items. ${services.size} selected.`} /> 
      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border hairline-strong bg-border"> 
        {catalog.map((s) => { 
          const active = services.has(s.id); 
          return ( 
            <label key={s.id} className={`group flex cursor-pointer items-center justify-between gap-6 bg-background px-6 py-5 transition-colors ${ active ? "bg-accent/40" : "hover:bg-secondary/40" }`} > 
              <div className="flex items-center gap-4"> 
                <span className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${ active ? "border-primary bg-primary text-primary-foreground" : "hairline-strong" }`} > 
                  {active && <Check className="h-3 w-3" strokeWidth={3} />} 
                </span> 
                <div> 
                  <div className="text-[14px] font-medium">{s.title}</div> 
                  <div className="mono mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-mute"> {s.id.toUpperCase()} </div> 
                </div> 
                <input type="checkbox" className="sr-only" checked={active} onChange={() => onToggle(s.id)} /> 
              </div> 
              <div className="flex items-baseline gap-1">
<span className="mono text-[11px] text-slate-mute">$</span> <span className="text-[20px] font-semibold tabular-nums tracking-[-0.02em]">{s.price}</span> </div> </label> ); })} </div> </div> ); } 

/* ---------- Step 3 ---------- */ 
function StepDetails({ track, pcpp, setPcpp, symptoms, setSymptoms, name, setName, phone, setPhone, email, setEmail, errors }: any) {
  return (
    <div>
      <StepHeader index="03" title="Technical details" sub={track === "build" ? "A PCPartPicker list helps us check compatibility." : "The more detail, the tighter the estimate."} />
      <div className="mt-10 grid grid-cols-12 gap-6">
        
        {/* Contact Fields */}
        <div className="col-span-4">
          <FieldLabel icon={Cpu}>Customer Name</FieldLabel>
          <input type="text" className="url-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div className="col-span-4">
          <FieldLabel icon={Cpu}>Phone Number</FieldLabel>
          <input type="tel" className="url-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(585) 555-0142" />
        </div>
        <div className="col-span-4">
          <FieldLabel icon={Cpu}>Email Address</FieldLabel>
          <input type="email" className="url-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
        </div>

        {/* PCPP Link Field */}
        <div className="col-span-12 mt-4">
          <FieldLabel icon={Link2}>PCPartPicker Link</FieldLabel>
          <input 
            type="url" 
            className="url-input" 
            value={pcpp} 
            onChange={(e) => setPcpp(e.target.value.slice(0, 300))} 
            placeholder={track === "build" ? "https://pcpartpicker.com/list/..." : "Optional — paste a list if you'd like a specific part swap"} 
          />
          {errors?.pcpp && <FieldHint>{errors.pcpp}</FieldHint>}
        </div>

        {/* Symptoms Field */}
        <div className="col-span-12">
          <FieldLabel icon={FileText}>System description / Field label</FieldLabel>
          <textarea 
            rows={6} 
            className="symptoms" 
            value={symptoms} 
            onChange={(e) => setSymptoms(e.target.value.slice(0, 2000))} 
            placeholder="Symptoms..." 
          />
          <div className="mt-2 flex items-center justify-between">
            {errors?.symptoms ? <FieldHint>{errors.symptoms}</FieldHint> : <div />}
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-slate-mute">{symptoms.length} / 2000</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------- Step 4 ---------- */ 
function StepSummary({ track, services, catalog, subtotal, deposit, pcpp, symptoms, name, phone, email, consent, setConsent, error }: any) {
  return (
    <div className="space-y-6">
      {/* Hidden inputs keep Step 3 data alive in HTML memory when Step 4 renders */}
      <input type="hidden" name="Customer Name" value={name || ""} />
      <input type="hidden" name="Phone Number" value={phone || ""} />
      <input type="hidden" name="Email Address" value={email || ""} />
      <input type="hidden" name="PCPartPicker URL" value={pcpp || ""} />
      <input type="hidden" name="Symptom Details" value={symptoms || ""} />

      <StepHeader index="04" title="Review summary" sub="Confirm your project details and estimate before submission." />
      
      <div className="rounded-lg border hairline bg-secondary/10 p-6 space-y-4">
        <div className="flex justify-between border-b hairline pb-3">
          <span className="text-slate-mute">Project Track</span>
          <span className="font-semibold uppercase tracking-wider text-primary">{track}</span>
        </div>
        <div className="flex justify-between border-b hairline pb-3">
          <span className="text-slate-mute">Labor Estimate</span>
          <span className="font-semibold font-mono">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-mute">Required Deposit (20%)</span>
          <span className="font-semibold font-mono text-emerald-500">${deposit.toLocaleString()}</span>
        </div>
      </div>

      <div className="pt-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input 
            type="checkbox" 
            className="mt-1 rounded border-slate-strong bg-background text-primary focus:ring-primary" 
            checked={consent} 
            onChange={(e) => setConsent(e.target.checked)} 
          />
          <span className="text-[13px] text-slate-mute leading-relaxed">
            I authorize Custom Core Labs to process this service request and confirm the accuracy of the technical specifications provided above.
          </span>
        </label>
        {error && <div className="mt-2 text-xs font-medium text-destructive">{error}</div>}
      </div>
    </div>
  );
}


/* ---------- Primitives ---------- */ 
function StepHeader({ index, title, sub }: { index: string; title: string; sub?: string }) { 
  return ( 
    <div className="flex items-end justify-between border-b hairline pb-5"> 
      <div> 
        <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary"> Step / {index} </div> 
        <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]" dangerouslySetInnerHTML={{ __html: title }} /> 
        {sub && <p className="mt-2 text-[13.5px] text-slate-mute">{sub}</p>} 
      </div> 
    </div> 
  ); 
} 

function FieldLabel({ icon: Icon, children }: { icon: typeof Cpu; children: React.ReactNode }) { 
  return ( 
    <label className="mono mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-mute"> 
      <Icon className="h-3 w-3 text-primary" strokeWidth={2} /> {children} 
    </label> 
  ); 
} 

function FieldHint({ children, error }: { children: React.ReactNode; error?: string }) { 
  if (error) { 
    return ( 
      <p className="mt-2 flex items-center gap-1.5 text-[12px] text-destructive"> 
        <AlertCircle className="h-3 w-3" /> {error} 
      </p> 
    ); 
  } 
  return <p className="mt-2 text-[11.5px] text-slate-mute">{children}</p>; 
}
function SubmittedState({ track, subtotal, deposit }: { track: string; subtotal: number; deposit: number }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.02em]">Project Submitted Successfully</h3>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-slate-mute">
        Your engineering request has been logged. Our diagnostic intake queue will process your specifications shortly.
      </p>
    </div>
  );
}
