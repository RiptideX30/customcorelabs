import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/")({
  component: ComparisonIndex,
});

function ComparisonIndex() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <Link to="/" className="text-primary hover:underline">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mt-4">
            Comparison
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-mute">
            Choose a component to compare.
          </p>
        </div>
        <div className="mt-16 flex justify-center gap-4">
          <Link
            to="/comparison/cpu"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[15px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all"
          >
            CPU
          </Link>
          <Link
            to="/comparison/gpu"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[15px] font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all"
          >
            GPU
          </Link>
        </div>
      </div>
    </div>
  );
}
