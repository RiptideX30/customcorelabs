import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/gpu")({
  component: GpuComparison,
});

const GPU_DATA = [
  { name: "NVIDIA GeForce RTX 4060", score: 100 },
  { name: "NVIDIA GeForce RTX 4070", score: 120 },
  { name: "AMD Radeon RX 7800 XT", score: 125 },
  // Add more GPU data here
];

function GpuComparison() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            GPU Comparison Matrix
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-mute">
            This matrix offers a data-driven framework for analyzing graphics processing units across competing manufacturing ecosystems. It establishes an agnostic scoring system that measures the performance of any GPU relative to a universal baseline—the NVIDIA GeForce RTX 4060—to cut through brand-specific hype and deliver an impartial evaluation of graphical power.
          </p>
        </div>
        <div className="mt-16">
          <div className="overflow-hidden rounded-xl border hairline-strong shadow-[var(--shadow-elegant)]">
            <table className="w-full text-left pricing-table">
              <thead>
                <tr>
                  <th className="p-4">Graphics Card</th>
                  <th className="p-4">Performance Score</th>
                </tr>
              </thead>
              <tbody>
                {GPU_DATA.map((gpu, index) => (
                  <tr key={index}>
                    <td className="p-4 font-semibold">{gpu.name}</td>
                    <td className="p-4">{gpu.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
