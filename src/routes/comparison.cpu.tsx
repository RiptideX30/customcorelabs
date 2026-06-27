import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/comparison/cpu")({
  component: CpuComparison,
});

function CpuComparison() {
  const [brand, setBrand] = useState("AMD");
  const [view, setView] = useState("Value");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = "https://script.google.com/macros/s/AKfycbw8MZtUw-LVV50vHJ-AalREEqF1NeylyGH7ZY4C2jpPCDh38YTCOuIVj46dC5wOlNKsxQ/exec";
    const targetTab = `${view}_${brand}_CPU`;

    setLoading(true);
    fetch(`${API_URL}?tab=${targetTab}`)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [brand, view]);

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-20">
        <div className="text-center">
          <Link to="/comparison" className="text-primary hover:underline">
            &larr; Back to Comparison
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mt-4">
            CPU Comparison Matrix
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-mute">
            This matrix provides a standardized evaluation of processor performance, neutralizing confusing marketing names and brand architectures. It uses a universal rating scale that benchmarks every CPU against a single baseline—the AMD Ryzen 5 7600X—to deliver a clear, objective assessment of raw power and value.
          </p>
        </div>
        <div className="mt-16">
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Ecosystem:</span>
              <button
                className={`px-4 py-2 rounded-md ${brand === "AMD" ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-zinc-800"}`}
                onClick={() => setBrand("AMD")}
              >
                AMD
              </button>
              <button
                className={`px-4 py-2 rounded-md ${brand === "Intel" ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-zinc-800"}`}
                onClick={() => setBrand("Intel")}
              >
                Intel
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Sorting Metric:</span>
              <button
                className={`px-4 py-2 rounded-md ${view === "Performance" ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-zinc-800"}`}
                onClick={() => setView("Performance")}
              >
                Performance
              </button>
              <button
                className={`px-4 py-2 rounded-md ${view === "Value" ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-zinc-800"}`}
                onClick={() => setView("Value")}
              >
                Price / Performance
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="overflow-hidden rounded-xl border hairline-strong shadow-[var(--shadow-elegant)]">
              <table className="w-full text-left pricing-table">
                <thead>
                  <tr>
                    {view === "Value" ? (
                      <>
                        <th>Value Rank</th>
                        <th>Value Score</th>
                        <th>CPU Model</th>
                        <th>Perf Score</th>
                        <th>Street Price</th>
                        <th>Architecture</th>
                        <th>Socket</th>
                        <th>Cores / Threads</th>
                      </>
                    ) : (
                      <>
                        <th>Perf Rank</th>
                        <th>Perf Score</th>
                        <th>CPU Model</th>
                        <th>Architecture</th>
                        <th>Socket</th>
                        <th>Cores / Threads</th>
                        <th>Base Clock</th>
                        <th>Boost Clock</th>
                        <th>Total L3 Cache</th>
                        <th>TDP</th>
                        <th>Street Price</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      {view === "Value" ? (
                        <>
                          <td>#{item.valuerank}</td>
                          <td>{parseFloat(item.valuescore).toFixed(2)}</td>
                          <td><strong>{item.cpumodel}</strong></td>
                          <td>{item.perfscore}</td>
                          <td>${item.streetprice}</td>
                          <td>{item.architecture}</td>
                          <td>{item.socket}</td>
                          <td>{item.coresthreads}</td>
                        </>
                      ) : (
                        <>
                          <td>#{item.perfrank}</td>
                          <td>{item.perfscore}</td>
                          <td><strong>{item.cpumodel}</strong></td>
                          <td>{item.architecture}</td>
                          <td>{item.socket}</td>
                          <td>{item.coresthreads}</td>
                          <td>{item.baseclockghz} GHz</td>
                          <td>{item.boostclockghz} GHz</td>
                          <td>{item.totall3cache}</td>
                          <td>{item.tdpwatts || item.tdp}</td>
                          <td>${item.streetprice}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
