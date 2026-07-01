import { Check, Star } from "lucide-react";

const packages = [
  {
    title: "The Raider",
    price: "$1200",
    description: "An excellent entry-point for 1080p gaming, balancing performance and value for popular esports and AAA titles.",
    features: [
      "Target: 1080p High-FPS Gaming",
      "Quality Component Selection",
      "Professional Assembly & Cable Management",
      "OS & Driver Installation",
      "Standard Validation Testing",
    ],
  },
  {
    title: "The Vanguard",
    price: "$1800",
    description: "The sweet spot for high-refresh-rate 1440p gaming, with powerful components for a smooth and immersive experience.",
    features: [
      "Target: 1440p High-Refresh-Rate Gaming",
      "Premium CPU & GPU Pairing",
      "Enhanced Cooling Solutions",
      "Pro Cable Management & Airflow Tuning",
      "Ultimate Build Validation (60-min stress test)",
    ],
    isPopular: true,
  },
  {
    title: "The Ascendant",
    price: "$2400",
    description: "A top-tier rig for 4K gaming and content creation, built with flagship components for uncompromising performance.",
    features: [
      "Target: 4K & High-End 1440p Gaming",
      "Flagship-Tier CPU & GPU",
      "Advanced Thermal Management",
      "Meticulous Cable Architecture",
      "Includes 24-Hour Bench Validation",
    ],
  },
];

export default function ServicePackages() {
  return (
    <section id="packages" className="py-16 md:py-24 bg-zinc-50 border-y hairline">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="text-center">
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-primary">§ 06</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">Pre-configured Build Packages</h2>
          <p className="mt-4 text-lg text-slate-mute max-w-3xl mx-auto">
            Get a guaranteed performance tier for a fixed price. We select the best components for your budget behind the scenes, leveraging market-value discounts to maximize performance.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.title} className={`relative rounded-xl border bg-background p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 ${pkg.isPopular ? "border-primary shadow-primary/10" : "hairline-strong"}`}>
              {pkg.isPopular && (
                <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Star className="h-3.5 w-3.5" />
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold">{pkg.title}</h3>
              <p className="mt-4 text-4xl font-bold">{pkg.price}</p>
              <p className="mono text-[11px] uppercase tracking-[0.18em] text-slate-mute">Total Parts & Labor</p>
              <p className="mt-6 text-[14px] leading-relaxed text-slate-mute">{pkg.description}</p>
              <ul className="mt-6 space-y-3 border-t hairline pt-6">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-[14px]">{feature}</span>
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
