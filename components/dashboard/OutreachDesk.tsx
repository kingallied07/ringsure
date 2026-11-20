"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CallWindow, OutreachCall, Prospect } from "@/lib/product/store";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

const DAY_LABELS = [
  [1, "Mon"],
  [2, "Tue"],
  [3, "Wed"],
  [4, "Thu"],
  [5, "Fri"],
  [6, "Sat"],
  [7, "Sun"],
] as const;

export default function OutreachDesk({
  prospects,
  calls,
  initialWindows,
  scenarios,
}: {
  prospects: Prospect[];
  calls: OutreachCall[];
  initialWindows: CallWindow[];
  scenarios: { id: string; label: string; description: string }[];
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [targetRole, setTargetRole] = useState("owner");
  const [trade, setTrade] = useState("Heating & Gas");
  const [bulkText, setBulkText] = useState("");
  const [selectedId, setSelectedId] = useState(prospects[0]?.id ?? "");
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [result, setResult] = useState<OutreachCall | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [windows, setWindows] = useState(initialWindows);

  const window = windows[0];
  const selected = prospects.find((p) => p.id === selectedId);
  const selectedScenario = scenarios.find((s) => s.id === scenarioId);

  async function addProspect() {
    if (!businessName.trim() || !phone.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/product/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, phone, contactName, targetRole, trade }),
      });
      if (!response.ok) throw new Error("Could not add prospect");
      setBusinessName("");
      setPhone("");
      setContactName("");
      setStatus("Prospect added.");
      router.refresh();
    } catch {
      setStatus("Could not add prospect");
    } finally {
      setBusy(false);
    }
  }

  async function importBulk() {
    if (!bulkText.trim()) return;
    setBusy(true);
    setStatus(null);
    const items = bulkText
      .split(/\r?\n/)
      .map((line) => line.split(/[,\t]/).map((part) => part.trim()))
      .filter((parts) => parts[0] && parts[1])
      .map(([businessName, phone, contactName, targetRole, trade]) => ({
        businessName,
        phone,
        contactName,
        targetRole: targetRole || "owner",
        trade: trade || "Home service",
      }));
    try {
      const response = await fetch("/api/product/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const body = (await response.json()) as { created?: number; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not import list");
      setBulkText("");
      setStatus(`${body.created ?? items.length} prospects imported.`);
      router.refresh();
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Could not import list");
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

  async function saveWindow() {
    if (!window) return;
    setBusy(true);
    try {
      const response = await fetch("/api/product/call-windows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ window }),
      });
      if (!response.ok) throw new Error("Could not save call window");
      setStatus("Call window saved.");
      router.refresh();
    } catch {
      setStatus("Could not save call window");
    } finally {
      setBusy(false);
    }
  }

  function updateWindow(patch: Partial<CallWindow>) {
    setWindows((current) => current.map((item, i) => (i === 0 ? { ...item, ...patch } : item)));
    setStatus(null);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">The product sells itself</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Build a named prospect list, set the hours we&apos;re allowed to call, and let the AI demo
        itself. Outbound calls disclose that they&apos;re AI and honour do-not-call.
      </p>

      {status && <p className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-dark">{status}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Calling window</h2>
            <p className="mt-1 text-xs text-muted">Times are in {window?.timezone ?? "Europe/London"}.</p>
            {window && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="windowStart" className="mb-1 block text-xs font-semibold text-ink">
                      From
                    </label>
                    <input
                      id="windowStart"
                      type="time"
                      className={inputClass}
                      value={window.start}
                      onChange={(e) => updateWindow({ start: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="windowEnd" className="mb-1 block text-xs font-semibold text-ink">
                      To
                    </label>
                    <input
                      id="windowEnd"
                      type="time"
                      className={inputClass}
                      value={window.end}
                      onChange={(e) => updateWindow({ end: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="notBefore" className="mb-1 block text-xs font-semibold text-ink">
                    Don&apos;t call before
                  </label>
                  <input
                    id="notBefore"
                    type="datetime-local"
                    className={inputClass}
                    value={
                      window.notBefore
                        ? new Date(window.notBefore).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      updateWindow({ notBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                    }
                  />
                </div>
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold text-ink">Days</legend>
                  <div className="flex flex-wrap gap-2">
                    {DAY_LABELS.map(([day, label]) => {
                      const active = window.days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            updateWindow({
                              days: active
                                ? window.days.filter((d) => d !== day)
                                : [...window.days, day].sort(),
                            })
                          }
                          className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                            active
                              ? "border-accent bg-accent text-white"
                              : "border-line bg-white text-muted"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={window.enabled}
                    onChange={(e) => updateWindow({ enabled: e.target.checked })}
                    className="h-4 w-4 accent-[#0e7c74]"
                  />
                  Window enabled
                </label>
                <button
                  type="button"
                  onClick={saveWindow}
                  disabled={busy}
                  className="w-full rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  Save window
                </button>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Add one prospect</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="prospectName" className="mb-1.5 block text-sm font-semibold text-ink">
                  Business name
                </label>
                <input id="prospectName" className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="prospectPhone" className="mb-1.5 block text-sm font-semibold text-ink">
                  Phone
                </label>
                <input id="prospectPhone" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 161 555 0100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="contactName" className="mb-1.5 block text-sm font-semibold text-ink">
                    Contact name
                  </label>
                  <input id="contactName" className={inputClass} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Sarah Jones" />
                </div>
                <div>
                  <label htmlFor="targetRole" className="mb-1.5 block text-sm font-semibold text-ink">
                    Aim to speak to
                  </label>
                  <input id="targetRole" className={inputClass} value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="owner" />
                </div>
              </div>
              <div>
                <label htmlFor="prospectTrade" className="mb-1.5 block text-sm font-semibold text-ink">
                  Trade
                </label>
                <input id="prospectTrade" className={inputClass} value={trade} onChange={(e) => setTrade(e.target.value)} />
              </div>
              <button type="button" onClick={addProspect} disabled={busy || !businessName.trim() || !phone.trim()} className="w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                Add prospect
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Import a list</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              One per line: business, phone, contact name, target role, trade. Commas or tabs work.
            </p>
            <textarea
              aria-label="Prospect list"
              rows={6}
              className={`${inputClass} mt-4 font-mono text-xs`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"Northside Gas, +441615550101, Mark Reed, owner, Heating & Gas\nRapid Rooter, +441615550102, Aisha Khan, operations manager, Plumbing"}
            />
            <button type="button" onClick={importBulk} disabled={busy || !bulkText.trim()} className="mt-3 w-full rounded-full border border-accent/40 bg-white px-5 py-3 text-sm font-bold text-accent-dark hover:bg-accent-soft disabled:opacity-60">
              Import prospects
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Run a demo call</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="prospectSelect" className="mb-1.5 block text-sm font-semibold text-ink">
                  Prospect
                </label>
                <select id="prospectSelect" className={inputClass} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.status === "do-not-call"}>
                      {p.businessName} · {p.contactName || "no contact"} · {p.status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="scenarioSelect" className="mb-1.5 block text-sm font-semibold text-ink">
                  Caller response
                </label>
                <select id="scenarioSelect" className={inputClass} value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                {selectedScenario && <p className="mt-1.5 text-xs text-muted">{selectedScenario.description}</p>}
              </div>
              <button type="button" onClick={runCall} disabled={busy || !selected || selected.status === "do-not-call"} className="w-full rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                Run demo call
              </button>
              <p className="text-xs text-muted">
                Calls are blocked outside the calling window above. Nothing goes out tonight.
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Prospects</h2>
            <div className="mt-5 space-y-2">
              {prospects.map((prospect) => (
                <div key={prospect.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                  <div>
                    <p className="text-sm font-bold text-ink">{prospect.businessName}</p>
                    <p className="text-xs text-muted">
                      {prospect.contactName || "No named contact"}
                      {prospect.targetRole ? ` · aim: ${prospect.targetRole}` : ""} · {prospect.phone}
                    </p>
                  </div>
                  <select
                    aria-label={`Status for ${prospect.businessName}`}
                    className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-semibold text-ink-soft"
                    value={prospect.status}
                    onChange={(e) => setStatusFor(prospect.id, e.target.value as Prospect["status"])}
                  >
                    {["new", "contacted", "interested", "pilot", "do-not-call"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div className="card border-accent/30 p-6">
              <h2 className="font-display text-xl font-bold text-ink">Demo call result</h2>
              <p className="mt-2 text-sm font-semibold text-accent-dark">{result.outcome}</p>
              <ol className="mt-5 space-y-3">
                {result.transcript.map((line, i) => (
                  <li key={i} className={`flex ${line.speaker === "caller" ? "justify-end" : ""}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${line.speaker === "ai" ? "bg-accent-soft text-ink-soft" : "bg-paper-deep text-ink"}`}>
                      <p className="text-[10px] font-bold uppercase text-muted">{line.speaker === "ai" ? "Ringsure AI" : "Prospect"}</p>
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
