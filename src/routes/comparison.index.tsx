import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/")({
  component: Comparison,
});

function Comparison() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Hardware Comparison
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-mute">
            An objective, data-driven framework for evaluating computer hardware. Our matrices neutralize confusing marketing names and brand architectures, providing a standardized evaluation of processor and graphics card performance. 
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/comparison/cpu"
            className="block rounded-xl border hairline-strong bg-background p-8 text-center hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all"
          >
            <h2 className="text-2xl font-semibold text-primary">CPU Comparison</h2>
            <p className="mt-4 text-slate-mute">
              View our standardized evaluation of processor performance, neutralizing confusing marketing names and brand architectures.
            </p>
          </Link>
          <Link
            to="/comparison/gpu"
            className="block rounded-xl border hairline-strong bg-background p-8 text-center hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all"
          >
            <h2 className="text-2xl font-semibold text-primary">GPU Comparison</h2>
            <p className="mt-4 text-slate-mute">
              Explore our data-driven framework for analyzing graphics processing units across competing manufacturing ecosystems.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
