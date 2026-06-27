
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/comparison/")({
  component: ComparisonIndex,
});

function ComparisonIndex() {
  return (
    <div className="p-2">
      <div className="text-lg font-bold">Hardware Value Index</div>
      <p className="py-2">
        The Hardware Value Index establishes an objective, mathematical method for evaluating consumer computer components. It eliminates the analytical distortion caused by volatile retail markups, brand bias, and static launch MSRPs. This multi-tab calculation engine serves as a centralized decision matrix, converting complex technical specifications and real-world execution metrics into a cross-compatible universal scoring system. By integrating active market pricing data with standardized performance baselines, this tool provides system builders and content creators with transparent, verifiable hardware analytics.
      </p>
      <div className="text-lg font-bold mt-4">The Scoring Methodology and Three Mathematical Pillars</div>
      <p className="py-2">
        The integrity of our ranking database relies on three distinct foundational layers designed to preserve calculation accuracy across competing brands and socket platforms:
      </p>
      <ul className="list-disc pl-4">
        <li className="py-1">
          <span className="font-bold">The Universal Performance Score:</span> To allow direct cross-comparison across different component classes, all hardware is measured using an identical scale. Processor capabilities balance gaming throughput with heavy multi-threaded productivity tasks, while graphics cards prioritize frame rendering stability. The baseline reference models are locked at precisely fifty points. A hardware entry achieving a score of one hundred delivers exactly double the operational capability of the reference baseline, whereas an entry scoring twenty-five possesses exactly half the capability. This establishes a shared statistical language across the entire database.
        </li>
        <li className="py-1">
          <span className="font-bold">The Price-to-Performance Equation:</span> Traditional hardware reviews suffer from chronological obsolescence because component prices change daily while video or print reviews remain static. This engine actively counters market volatility by continuously cross-referencing performance scores against real-time retail street pricing rather than artificial launch parameters. The system executes the core value equation by dividing the performance score by the current market street price and multiplying the product by one hundred. The resulting value rating reflects true performance-per-dollar efficiency. Higher numerical ratings indicate superior capital efficiency, while depressed ratings expose overvalued components.
        </li>
        <li className="py-1">
          <span className="font-bold">The Obsolete Performance Floor:</span> To maintain the commercial utility of the leaderboards, the database enforces a strict performance boundary at forty-three points. Silicon technology depreciates rapidly; consequently, legacy components frequently drop to low price points on secondary marketplaces, which can artificially inflate their value metrics on unmanaged spreadsheets. If a component\'s standardized performance capacity falls below our forty-three-point floor, the background code flags the entry as non-viable for modern production environments and automatically excludes it from the value rankings. This safeguard ensures that the active leaderboards only recommend modern, viable hardware assets.
        </li>
      </ul>
      <div className="text-lg font-bold mt-4">Cross-Category Analysis and System Optimization</div>
      <p className="py-2">
        Because the scoring matrix is uniform across all directories, the performance metrics are entirely cross-compatible. This integration allows users to execute advanced cross-tabulation to optimize overall system configuration:
      </p>
      <ul className="list-disc pl-4">
        <li className="py-1">
          <span className="font-bold">Ecosystem Parity Mapping:</span> Users can directly contrast competing architectures without relying on arbitrary branding tiers. The database isolates instances where legacy flagship hardware outperforms newly released mid-range alternatives, or where clearance pricing on mature platforms yields superior capital efficiency compared to newly introduced sockets.
        </li>
        <li className="py-1">
          <span className="font-bold">Platform Bottleneck Identification:</span> Achieving peak system efficiency requires computational equilibrium between the primary processor and the graphics subsystem. By comparing the universal performance integers across the CPU and GPU directories, users can mathematically identify configuration imbalances. A significant deficit between the processor score and the graphics card score flags an operational bottleneck, preventing underutilized hardware investments.
        </li>
        <li className="py-1">
          <span className="font-bold">Value Disparity Isolation:</span> Toggling between the raw performance hierarchy and the active value ranks reveals severe market compression. Flagship components frequently dominate raw processing indices but settle at the absolute bottom of the value leaderboards due to speculative retail markups. Conversely, highly commoditized mid-range components routinely demonstrate optimal performance-per-dollar equilibrium, making them the mathematically superior selection for capital-constrained deployments.
        </li>
      </ul>
      <div className="flex gap-2 mt-4">
        <Link
          to="/comparison/cpu"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          CPU
        </Link>
        <Link
          to="/comparison/gpu"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          GPU
        </Link>
      </div>
    </div>
  );
}
