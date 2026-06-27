import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/comparison/gpu")({
  component: GpuComparison,
});

function GpuComparison() {
  const [brand, setBrand] = useState("Nvidia");
  const [view, setView] = useState("Value");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = "https://script.google.com/macros/s/AKfycbw8MZtUw-LVV50vHJ-AalREEqF1NeylyGH7ZY4C2jpPCDh38YTCOuIVj46dC5wOlNKsxQ/exec";
    const targetTab = `${view}_${brand}_GPU`;

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
            GPU Comparison Matrix
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-mute">
            This matrix offers a data-driven framework for analyzing graphics processing units across competing manufacturing ecosystems. It establishes an agnostic scoring system that measures the performance of any GPU relative to a universal baseline—the NVIDIA GeForce RTX 4060—to cut through brand-specific hype and deliver an impartial evaluation of graphical power.
          </p>
        </div>
        <div className="mt-16">
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Ecosystem:</span>
              <button
                className={`px-4 py-2 rounded-md ${brand === "Nvidia" ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-zinc-800"}`}
                onClick={() => setBrand("Nvidia")}
              >
                NVIDIA
              </button>
              <button
                className={`px-4 py-2 rounded-md ${brand === "AMD" ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-zinc-800"}`}
                onClick={() => setBrand("AMD")}
              >
                AMD
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
                        <th>GPU Model</th>
                        <th>Perf Score</th>
                        <th>Street Price</th>
                        <th>Architecture</th>
                        <th>VRAM Size</th>
                        <th>Memory Type</th>
                        <th>Bus Width</th>
                        <th>TDP</th>
                      </>
                    ) : (
                      <>
                        <th>Perf Rank</th>
                        <th>Perf Score</th>
                        <th>GPU Model</th>
                        <th>Architecture</th>
                        <th>VRAM Size</th>
                        <th>Memory Type</th>
                        <th>Bus Width</th>
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
                          <td><strong>{item.gpumodel}</strong></td>
                          <td>{item.perfscore}</td>
                          <td>${item.streetprice}</td>
                          <td>{item.architecture}</td>
                          <td>{item.vramsize}</td>
                          <td>{item.memorytype}</td>
                          <td>{item.buswidth}</td>
                          <td>{item.tdpwatts || item.tdp}</td>
                        </>
                      ) : (
                        <>
                          <td>#{item.perfrank}</td>
                          <td>{item.perfscore}</td>
                          <td><strong>{item.gpumodel}</strong></td>
                          <td>{item.architecture}</td>
                          <td>{item.vramsize}</td>
                          <td>{item.memorytype}</td>
                          <td>{item.buswidth}</td>
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
