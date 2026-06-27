import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/")({
  component: ComparisonIndex,
});

function ComparisonIndex() {
  return (
    <div className="bg-zinc-50 text-foreground">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <Link to="/" className="text-primary hover:underline">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mt-4">
            Hardware Comparison
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-mute">Choose a component to compare.</p>
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
      <div className="bg-background border-t hairline-strong py-16 md:py-20">
        <div className="mx-auto max-w-[1024px] px-5 md:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center">
            What is our comparison system?
          </h2>
          <div className="mt-8 space-y-8 text-slate-mute">
            <p>
              The Hardware Value Index establishes an objective, mathematical method for evaluating
              consumer computer components. It eliminates the analytical distortion caused by
              volatile retail markups, brand bias, and static launch MSRPs. This multi-tab
              calculation engine serves as a centralized decision matrix, converting complex
              technical specifications and real-world execution metrics into a cross-compatible
              universal scoring system. By integrating active market pricing data with standardized
              performance baselines, this tool provides system builders and content creators with
              transparent, verifiable hardware analytics.
            </p>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                The Scoring Methodology and Three Mathematical Pillars
              </h3>
              <p className="mt-4">
                The integrity of our ranking database relies on three distinct foundational layers
                designed to preserve calculation accuracy across competing brands and socket
                platforms:
              </p>
              <ul className="mt-4 space-y-4 list-disc list-inside">
                <li>
                  <strong>The Universal Performance Score:</strong> To allow direct cross-comparison
                  across different component classes, all hardware is measured using an identical
                  scale. Processor capabilities balance gaming throughput with heavy multi-threaded
                  productivity tasks, while graphics cards prioritize frame rendering stability. The
                  baseline reference models are locked at precisely fifty points. A hardware entry
                  achieving a score of one hundred delivers exactly double the operational
                  capability of the reference baseline, whereas an entry scoring twenty-five
                  possesses exactly half the capability. This establishes a shared statistical
                  language across the entire database.
                </li>
                <li>
                  <strong>The Price-to-Performance Equation:</strong> Traditional hardware reviews
                  suffer from chronological obsolescence because component prices change daily while
                  video or print reviews remain static. This engine actively counters market
                  volatility by continuously cross-referencing performance scores against real-time
                  retail street pricing rather than artificial launch parameters. The system
                  executes the core value equation by dividing the performance score by the current
                  market street price and multiplying the product by one hundred. The resulting
                  value rating reflects true performance-per-dollar efficiency. Higher numerical
                  ratings indicate superior capital efficiency, while depressed ratings expose
                  overvalued components.
                </li>
                <li>
                  <strong>The Obsolete Performance Floor:</strong> To maintain the commercial
                  utility of the leaderboards, the database enforces a strict performance boundary
                  at forty-three points. Silicon technology depreciates rapidly; consequently,
                  legacy components frequently drop to low price points on secondary marketplaces,
                  which can artificially inflate their value metrics on unmanaged spreadsheets. If a
                  component's standardized performance capacity falls below our forty-three-point
                  floor, the background code flags the entry as non-viable for modern production
                  environments and automatically excludes it from the value rankings. This safeguard
                  ensures that the active leaderboards only recommend modern, viable hardware
                  assets.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                Cross-Category Analysis and System Optimization
              </h3>
              <p className="mt-4">
                Because the scoring matrix is uniform across all directories, the performance
                metrics are entirely cross-compatible. This integration allows users to execute
                advanced cross-tabulation to optimize overall system configuration:
              </p>
              <ul className="mt-4 space-y-4 list-disc list-inside">
                <li>
                  <strong>Ecosystem Parity Mapping:</strong> Users can directly contrast competing
                  architectures without relying on arbitrary branding tiers. The database isolates
                  instances where legacy flagship hardware outperforms newly released mid-range
                  alternatives, or where clearance pricing on mature platforms yields superior
                  capital efficiency compared to newly introduced sockets.
                </li>
                <li>
                  <strong>Platform Bottleneck Identification:</strong> Achieving peak system
                  efficiency requires computational equilibrium between the primary processor and
                  the graphics subsystem. By comparing the universal performance integers across the
                  CPU and GPU directories, users can mathematically identify configuration
                  imbalances. A significant deficit between the processor score and the graphics
                  card score flags an operational bottleneck, preventing underutilized hardware
                  investments.
                </li>
                <li>
                  <strong>Value Disparity Isolation:</strong> Toggling between the raw performance
                  hierarchy and the active value ranks reveals severe market compression. Flagship
                  components frequently dominate raw processing indices but settle at the absolute
                  bottom of the value leaderboards due to speculative retail markups. Conversely,
                  highly commoditized mid-range components routinely demonstrate optimal
                  performance-per-dollar equilibrium, making them the mathematically superior
                  selection for capital-constrained deployments.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
