import { Check } from "lucide-react";

const packages = [
  {
    title: "Basic Build",
    description: "Pure hardware assembly and standard cable routing. No OS or driver installation.",
    price: "$109",
    features: ["Hardware Assembly", "Standard Cable Routing"],
  },
  {
    title: "Ultimate Build",
    description: "Full assembly, OS provisioning, pro routing, 60-min stress testing, and more.",
    price: "Starting at $149",
    features: [
      "Full Assembly",
      "OS Provisioning",
      "Pro Cable Routing",
      "60-Min Stress Testing",
      "BIOS Optimization",
    ],
  },
  {
    title: "Desktop Refresh",
    description: "Deep clean, airflow re-route, and thermal remediation for your existing PC.",
    price: "$49",
    features: ["Deep Dust Extraction", "Airflow Re-route", "Thermal Remediation"],
  },
];

export default function ServicePackages() {
  return (
    <section id="packages" className="py-16 md:py-24 bg-zinc-50">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Service Packages</h2>
          <p className="mt-4 text-lg text-slate-mute">
            Choose the right package for your needs, from basic assembly to a complete system overhaul.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.title} className="rounded-xl border hairline-strong bg-background p-6 shadow-[var(--shadow-elegant)]">
              <h3 className="text-xl font-semibold">{pkg.title}</h3>
              <p className="mt-2 text-slate-mute">{pkg.description}</p>
              <div className="mt-6">
                <p className="text-4xl font-bold">{pkg.price}</p>
              </div>
              <ul className="mt-6 space-y-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
