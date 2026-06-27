
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/cpu")({
  component: CpuComparison,
});

function CpuComparison() {
  return (
    <div className="p-2">
      <div className="text-lg font-bold">CPU Comparison Matrix</div>
      <p className="py-2">
        The CPU Comparison Matrix provides a standardized evaluation of processor performance by neutralizing confusing marketing names and brand architectures. Every component is measured using a normalized index that weights 1440p gaming frame rates at sixty percent and multi-threaded rendering workloads at forty percent. Performance metrics are scaled against a fixed baseline reference processor—the AMD Ryzen 5 5600X—which is anchored at exactly fifty points. By dividing this performance score by real-time retail street pricing, the matrix generates an objective value score. It also utilizes a performance floor to filter out obsolete legacy hardware that fails to meet modern workflow demands.
      </p>
      <Link
        to="/comparison"
        className="text-blue-500 hover:text-blue-700"
      >
        Back
      </Link>
      <div className="py-4">
        <iframe src="/comparison/cpu/index.html" className="w-full h-[80vh]" />
      </div>
    </div>
  );
}
