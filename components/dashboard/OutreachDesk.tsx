"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OutreachCall, Prospect } from "@/lib/product/store";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

export default function OutreachDesk({
  prospects,
  calls,
  scenarios,
}: {
  prospects: Prospect[];
  calls: OutreachCall[];
  scenarios: { id: string; label: string; description: string }[];
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [trade, setTrade] = useState("Heating & Gas");
  const [selectedId, setSelectedId] = useState(prospects[0]?.id ?? "");
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [result, setResult] = useState<OutreachCall | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = prospects.find((p) => p.id === selectedId);
  const selectedScenario = scenarios.find((s) => s.id === scenarioId);

  async function addProspect() {
    if (!businessName.trim() || !phone.trim()) return;
    setBusy(true);
    try {
      const response = await fetch("/api/product/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, phone, trade }),
      });
      if (!response.ok) throw new Error("Could not add prospect");
      setBusinessName("");
      setPhone("");
      router.refresh();
    } catch {
      setStatus("Could not add prospect");
    } finally {
      setBusy(false);
    }
  }

  async function setStatusFor(id: string, next: Prospect["status"]) {
    await fetch("/api/product/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    router.refresh();
  }

  async function runCall() {
    if (!selected || selected.status === "do-not-call") return;
    setBusy(true);
    setResult(null);
    setStatus(null);
    try {
      const response = await fetch("/api/product/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: selected.id, scenarioId }),
      });
      const body = (await response.json()) as { call?: OutreachCall; error?: string };
      if (!response.ok || !body.call) throw new Error(body.error ?? "Could not run the call");
      setResult(body.call);
      router.refresh();
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Could not run the call");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">The product sells itself</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Use the same voice and brain to call potential customers, explain the missed-call problem and
        offer a free pilot. Outbound calls disclose that they&apos;re AI, and &ldquo;not interested&rdquo;
        is immediately recorded as do-not-call.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Add a prospect</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="prospectName" className="mb-1.5 block text-sm font-semibold text-ink">
                  Business name
                </label>
                <input
                  id="prospectName"
                  className={inputClass}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acute Heating Ltd"
                />
              </div>
              <div>
                <label htmlFor="prospectPhone" className="mb-1.5 block text-sm font-semibold text-ink">
                  Phone
                </label>
                <input
                  id="prospectPhone"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 161 555 0100"
                />
              </div>
              <div>
                <label htmlFor="prospectTrade" className="mb-1.5 block text-sm font-semibold text-ink">
                  Trade
                </label>
                <input
                  id="prospectTrade"
                  className={inputClass}
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={addProspect}
                disabled={busy || !businessName.trim() || !phone.trim()}
                className="w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
              >
                Add prospect
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold text-ink">Run a demo call</h2>
              <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-[#8a5a12]">
                Mock
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="prospectSelect" className="mb-1.5 block text-sm font-semibold text-ink">
                  Prospect
                </label>
                <select
                  id="prospectSelect"
                  className={inputClass}
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.status === "do-not-call"}>
                      {p.businessName} · {p.status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="scenarioSelect" className="mb-1.5 block text-sm font-semibold text-ink">
                  Caller response
                </label>
                <select
                  id="scenarioSelect"
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
                {selectedScenario && (
                  <p className="mt-1.5 text-xs text-muted">{selectedScenario.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={runCall}
                disabled={busy || !selected || selected.status === "do-not-call"}
                className="w-full rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-ink-soft disabled:opacity-60"
              >
                Run demo call
              </button>
              {status && <p className="text-sm font-semibold text-loss">{status}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-amber/30 bg-amber-soft/60 p-5 text-xs leading-relaxed text-[#7a4e0d]">
            Compliance: outbound calls identify as AI, target businesses only, honour do-not-call
            immediately, and never claim to be a human in your office. Keep a suppression list before
            running real campaigns.
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Prospects</h2>
            <div className="mt-5 space-y-2">
              {prospects.map((prospect) => (
                <div key={prospect.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                  <div>
                    <p className="text-sm font-bold text-ink">{prospect.businessName}</p>
                    <p className="text-xs text-muted">
                      {prospect.trade} · {prospect.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={`Status for ${prospect.businessName}`}
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-semibold text-ink-soft"
                      value={prospect.status}
                      onChange={(e) => setStatusFor(prospect.id, e.target.value as Prospect["status"])}
                    >
                      {["new", "contacted", "interested", "pilot", "do-not-call"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div className="card border-accent/30 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-ink">Demo call result</h2>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-dark">
                  {result.outcome}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted">
                {result.disclosureSpoken ? "✓ AI disclosure spoken" : "✕ Disclosure missing"}
              </p>
              <ol className="mt-5 space-y-3">
                {result.transcript.map((line, i) => (
                  <li key={i} className={`flex ${line.speaker === "caller" ? "justify-end" : ""}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        line.speaker === "ai"
                          ? "rounded-tl-sm bg-accent-soft text-ink-soft"
                          : "rounded-tr-sm bg-paper-deep text-ink"
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                        {line.speaker === "ai" ? "Ringsure AI" : "Prospect"}
                      </p>
                      {line.text}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Recent demo calls</h2>
            <ul className="mt-4 divide-y divide-line">
              {calls.slice(0, 6).map((call) => {
                const prospect = prospects.find((p) => p.id === call.prospectId);
                return (
                  <li key={call.id} className="flex justify-between gap-3 py-3 text-sm">
                    <span className="font-semibold text-ink">{prospect?.businessName ?? "Prospect"}</span>
                    <span className="text-muted">{call.outcome}</span>
                  </li>
                );
              })}
              {calls.length === 0 && <li className="py-4 text-sm text-muted">No demo calls yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
