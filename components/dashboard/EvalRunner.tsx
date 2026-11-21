"use client";

import { useState } from "react";
import type { EvalRun } from "@/lib/product/types";

export default function EvalRunner({
  businesses,
  initialRuns,
}: {
  businesses: { id: string; name: string }[];
  initialRuns: EvalRun[];
}) {
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [mode, setMode] = useState<"inbound" | "outbound">("inbound");
  const [runs, setRuns] = useState(initialRuns);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/product/evals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, mode }),
      });
      const body = (await response.json()) as { run?: EvalRun; error?: string };
      if (!response.ok || !body.run) throw new Error(body.error ?? "Could not run evals");
      setRuns((current) => [body.run!, ...current]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not run evals");
    } finally {
      setRunning(false);
    }
  }

  const latest = runs[0];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Quality evals</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        One brain, two modes: inbound callers who need help, and outbound prospects who need a reason
        to listen. Pick a mode, then run its scripted callers to check the disclosure, flow and rules.
      </p>

      <div className="card mt-8 flex flex-wrap items-end gap-4 p-6">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="evalBusiness" className="mb-1.5 block text-sm font-semibold text-ink">
            Business brief
          </label>
          <select
            id="evalBusiness"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex rounded-full border border-line bg-white p-1">
          {(["inbound", "outbound"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                mode === item ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running || !businessId}
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {running ? "Running…" : "Run eval suite"}
        </button>
        {error && <p className="text-sm font-semibold text-loss">{error}</p>}
      </div>

      {latest && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-ink">Latest run</h2>
            <p className="text-sm font-bold text-accent">
              {latest.summary.passed}/{latest.summary.total} passing
            </p>
          </div>
          <p className="mt-1 text-xs text-muted">
            {new Date(latest.ranAt).toLocaleString("en-GB")}
          </p>

          <div className="mt-5 space-y-3">
            {latest.results.map((result) => (
              <div key={result.scenario} className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-ink">{result.scenario}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      result.passed ? "bg-accent-soft text-accent-dark" : "bg-[#f9e4df] text-loss"
                    }`}
                  >
                    {result.passed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {result.checks.map((check) => (
                    <li key={check.key} className="flex items-start gap-2 text-xs">
                      <span className={check.passed ? "text-accent" : "text-loss"}>
                        {check.passed ? "✓" : "✕"}
                      </span>
                      <span>
                        <strong className="font-semibold text-ink-soft">{check.key}:</strong>{" "}
                        <span className="text-muted">{check.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {runs.length > 1 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-ink">Run history</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white px-5">
            {runs.slice(0, 8).map((run) => (
              <li key={run.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted">{new Date(run.ranAt).toLocaleString("en-GB")}</span>
                <span className="font-bold text-ink">
                  {run.summary.passed}/{run.summary.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
