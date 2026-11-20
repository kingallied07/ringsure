"use client";

import { useState } from "react";
import type { Call } from "@/lib/product/types";

type BusinessOption = { id: string; name: string; trade: string };
type ScenarioOption = { id: string; label: string; description: string };

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

export default function SimulateForm({
  businesses,
  scenarios,
}: {
  businesses: BusinessOption[];
  scenarios: ScenarioOption[];
}) {
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [fromNumber, setFromNumber] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ call: Call; notification: { sent: boolean; reason: string } } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = scenarios.find((s) => s.id === scenarioId);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/product/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, scenarioId, fromNumber: fromNumber || undefined }),
      });
      const body = (await response.json()) as { call?: Call; notification?: { sent: boolean; reason: string }; error?: string };
      if (!response.ok || !body.call) throw new Error(body.error ?? "Could not run the call");
      setResult({ call: body.call, notification: body.notification ?? { sent: false, reason: "Unknown" } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not run the call");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="card h-fit p-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Simulate a call</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Pick a business brief and a scripted caller. The mock brain applies the real prompt rules —
          disclosure, qualification, emergency matching, no invented prices — without a phone line.
        </p>

        <div className="mt-7 space-y-5">
          <div>
            <label htmlFor="business" className="mb-1.5 block text-sm font-semibold text-ink">
              Business
            </label>
            <select
              id="business"
              className={inputClass}
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.trade})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scenario" className="mb-1.5 block text-sm font-semibold text-ink">
              Caller scenario
            </label>
            <select
              id="scenario"
              className={inputClass}
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {selected && <p className="mt-1.5 text-xs text-muted">{selected.description}</p>}
          </div>

          <div>
            <label htmlFor="fromNumber" className="mb-1.5 block text-sm font-semibold text-ink">
              Caller number <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="fromNumber"
              className={inputClass}
              placeholder="Defaults to the scenario number"
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={run}
            disabled={running || !businessId}
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
          >
            {running ? "Running call…" : "Run simulated call"}
          </button>
          {error && <p className="text-sm font-semibold text-loss">{error}</p>}
        </div>
      </div>

      <div>
        {!result ? (
          <div className="card flex min-h-[320px] items-center justify-center p-8 text-center">
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              The call transcript, captured lead and notification result will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-ink">Call result</h2>
                <span className="rounded-full bg-paper-deep px-3 py-1 text-xs font-bold text-muted">
                  {result.call.durationSeconds}s · {result.call.fromNumber}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge ok={result.call.disclosureSpoken} label="Disclosure spoken" />
                <Badge ok={Boolean(result.call.lead)} label="Lead captured" />
                <Badge ok={result.call.emergencyFlagged} label="Emergency flagged" neutral />
                <Badge ok={result.call.transferred} label="Transferred" neutral />
                <Badge ok={result.call.booked} label="Booked" neutral />
              </div>
              <p className="mt-4 text-xs text-muted">
                Notification: {result.notification.sent ? "✅ " : "ℹ️ "}
                {result.notification.reason}
              </p>
            </div>

            {result.call.lead && (
              <div className="card border-accent/30 p-6">
                <h3 className="font-display text-lg font-bold text-ink">Captured lead</h3>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <Detail label="Name" value={result.call.lead.name} />
                  <Detail label="Phone" value={result.call.lead.phone} />
                  <Detail label="Postcode" value={result.call.lead.postcode || "Not captured"} />
                  <Detail label="Job" value={result.call.lead.jobType} />
                  <Detail label="Priority" value={result.call.lead.urgency} />
                  <Detail label="Notes" value={result.call.lead.notes || "None"} />
                </dl>
              </div>
            )}

            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-ink">Transcript</h3>
              <ol className="mt-4 space-y-3">
                {result.call.transcript.map((line, i) => (
                  <li key={i} className={`flex gap-3 ${line.speaker === "caller" ? "justify-end" : ""}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        line.speaker === "ai"
                          ? "rounded-tl-sm bg-accent-soft text-ink-soft"
                          : "rounded-tr-sm bg-paper-deep text-ink"
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                        {line.speaker === "ai" ? "Ringsure AI" : "Caller"}
                      </p>
                      {line.text}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ ok, label, neutral = false }: { ok: boolean; label: string; neutral?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        ok
          ? neutral
            ? "bg-amber-soft text-[#8a5a12]"
            : "bg-accent-soft text-accent-dark"
          : "bg-paper-deep text-muted"
      }`}
    >
      {ok ? "✓ " : "○ "}
      {label}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink-soft">{value}</dd>
    </div>
  );
}
