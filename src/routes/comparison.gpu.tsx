
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/gpu")({
  component: GpuComparison,
});

function GpuComparison() {
  return (
    <div className="p-2">
      <div className="text-lg font-bold">GPU Comparison Matrix</div>
      <p className="py-2">
        The GPU Comparison Matrix offers a data-driven framework for analyzing graphics processing units across competing manufacturing ecosystems. Raw gaming and rendering metrics are evaluated uniformly against a standardized baseline reference card—the NVIDIA GeForce RTX 4060 Ti—which is assigned a fixed value of fifty points. This universal scale allows users to directly isolate generational performance leaps from arbitrary retail inflation. By calculating the ratio of normalized performance relative to active e-commerce street pricing, the matrix exposes market anomalies, flags premium pricing traps, and highlights true value leaders while automatically hiding legacy silicon.
      </p>
      <Link
        to="/comparison"
        className="text-blue-500 hover:text-blue-700"
      >
        Back
      </Link>
      <div className="py-4">
        <iframe src="/comparison/gpu/index.html" className="w-full h-[80vh]" />
      </div>
    </div>
  );
}
