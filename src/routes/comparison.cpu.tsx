import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/cpu")({
  component: CpuComparison,
});

const CPU_DATA = [
  { name: "AMD Ryzen 5 7600X", score: 100 },
  { name: "AMD Ryzen 7 7700X", score: 115 },
  { name: "Intel Core i9-13900K", score: 130 },
  // Add more CPU data here
];

function CpuComparison() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            CPU Comparison Matrix
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-mute">
            This matrix provides a standardized evaluation of processor performance, neutralizing confusing marketing names and brand architectures. It uses a universal rating scale that benchmarks every CPU against a single baseline—the AMD Ryzen 5 7600X—to deliver a clear, objective assessment of raw power and value.
          </p>
        </div>
        <div className="mt-16">
          <div className="overflow-hidden rounded-xl border hairline-strong shadow-[var(--shadow-elegant)]">
            <table className="w-full text-left pricing-table">
              <thead>
                <tr>
                  <th className="p-4">Processor</th>
                  <th className="p-4">Performance Score</th>
                </tr>
              </thead>
              <tbody>
                {CPU_DATA.map((cpu, index) => (
                  <tr key={index}>
                    <td className="p-4 font-semibold">{cpu.name}</td>
                    <td className="p-4">{cpu.score}</td>
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
