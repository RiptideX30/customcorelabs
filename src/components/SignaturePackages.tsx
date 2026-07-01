import { useNavigate } from "@tanstack/react-router";

const CheckIcon = () => (
  <svg
    className="h-4 w-4 shrink-0 text-primary"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const SignaturePackages = () => {
  const navigate = useNavigate({ from: "/packages" });

  const packages = [
    {
      name: "Esports Core Package",
      price: "$1,200.00 Flat",
      service:
        "Ultimate Build Assembly (Full assembly, pro cable routing, OS setup with no key, and 60-min hardware validation).",
      specs: [
        "AMD Ryzen 5 5500 CPU",
        "B550M mATX Motherboard",
        "16GB DDR4 Memory",
        "AMD Radeon RX 7600 GPU",
        "Montech Air 100 Black Case",
        "MSI MAG A650BN Power Supply",
        "1TB PCIe 4.0 NVMe SSD",
      ],
      tier: "esports",
    },
    {
      name: "Apex Performance Package",
      price: "$1,800.00 Flat",
      service:
        "Ultimate Build Assembly + BIOS & Firmware Tuning (XMP/EXPO, optimized thermal fan curves).",
      specs: [
        "AMD Ryzen 5 9600X CPU",
        "B850-S ATX Motherboard",
        "32GB DDR5 Memory",
        "AMD Radeon RX 9060XT GPU",
        "Phanteks NV5S Case",
        "Cooler Master Hyper 212 Pro Cooler",
        "850W 80+ Gold Power Supply",
        "1TB Gen 4 NVMe SSD",
      ],
      tier: "apex",
    },
    {
      name: "Horizon Showcase Package",
      price: "$2,400.00 Flat",
      service:
        "Ultimate Build Assembly + BIOS Tuning + 24-Hour Extended Bench Validation Loop Testing.",
      specs: [
        "AMD Ryzen 5 9600X CPU",
        "B850-S ATX Motherboard",
        "32GB DDR5 Memory",
        "AMD Radeon RX 9070XT GPU",
        "MSI MAG Pano 100R Case",
        "MSI MAG Coreliquid A13 360mm AIO Liquid Cooler",
        "MSI MPG 850W 80+ Gold Power Supply",
        "1TB Gen 4 NVMe SSD",
      ],
      tier: "horizon",
    },
  ];

  const handleOrder = (tier: string) => {
    navigate({
      to: "/start-a-project",
      search: {
        path: "package",
        tier: tier,
      },
    });
  };

  return (
    <div className="bg-background text-foreground antialiased">
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-24">
        <div className="bg-zinc-50 border hairline rounded-xl p-6 md:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Signature Series — Handcrafted to Order
          </h2>
          <p className="mt-3 max-w-4xl mx-auto text-[15px] leading-relaxed text-slate-mute">
            To guarantee brand-new components and preserve full manufacturer factory warranties, we
            operate on a zero-warehouse model. Component fulfillment is funded 100% upfront before
            orders are finalized. Your system undergoes our rigorous assembly and validation
            workflow and is ready for secure local workshop pickup in 5–7 business days.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="rounded-xl border hairline-strong bg-background p-6 flex flex-col transition-all hover:border-primary/60 hover:shadow-[var(--shadow-elegant)]"
            >
              <h3 className="text-xl font-semibold tracking-tight text-foreground">{pkg.name}</h3>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">{pkg.price}</p>

              <div className="mt-4 text-[13.5px] leading-relaxed text-slate-mute">
                <p className="font-medium text-slate-ink">Included Service:</p>
                <p>{pkg.service}</p>
              </div>

              <div className="mt-6 flex-grow">
                <p className="font-medium text-slate-ink">Component Specifications:</p>
                <ul className="mt-3 space-y-2.5">
                  {pkg.specs.map((spec) => (
                    <li
                      key={spec}
                      className="flex gap-3 text-[13.5px] leading-relaxed text-slate-ink"
                    >
                      <CheckIcon />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleOrder(pkg.tier)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 transition-all"
                >
                  Order Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignaturePackages;
