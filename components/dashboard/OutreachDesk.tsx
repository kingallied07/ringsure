"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CallWindow, OutreachCall, Prospect } from "@/lib/product/store";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

const DAY_LABELS = [
  [1, "Mon"],
  [2, "Tue"],
  [3, "Wed"],
  [4, "Thu"],
  [5, "Fri"],
  [6, "Sat"],
  [7, "Sun"],
] as const;

const STATUSES = ["new", "contacted", "interested", "pilot", "do-not-call"] as const;

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
  const [prospectList, setProspectList] = useState(prospects);
  const [callList, setCallList] = useState(calls);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState(prospects[0]?.id ?? "");
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [openTranscript, setOpenTranscript] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    businessName: prospects[0]?.businessName ?? "",
    phone: prospects[0]?.phone ?? "",
    contactName: prospects[0]?.contactName ?? "",
    targetRole: prospects[0]?.targetRole ?? "",
    trade: prospects[0]?.trade ?? "",
    notes: prospects[0]?.notes ?? "",
  });
  const [newProspect, setNewProspect] = useState({ businessName: "", phone: "", contactName: "", targetRole: "owner", trade: "Heating & Gas" });
  const [bulkText, setBulkText] = useState("");
  const [windows, setWindows] = useState(initialWindows);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const callWindow = windows[0];
  const selected = prospectList.find((p) => p.id === selectedId) ?? null;
  const selectedCalls = callList.filter((c) => c.prospectId === selectedId);
  const selectedScenario = scenarios.find((s) => s.id === scenarioId);

  const visibleProspects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return prospectList.filter((p) => {
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesTerm =
        !term ||
        p.businessName.toLowerCase().includes(term) ||
        (p.contactName ?? "").toLowerCase().includes(term) ||
        p.phone.includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [prospectList, search, statusFilter]);

  function selectProspect(prospect: Prospect) {
    setSelectedId(prospect.id);
    setDraft({
      businessName: prospect.businessName,
      phone: prospect.phone,
      contactName: prospect.contactName ?? "",
      targetRole: prospect.targetRole ?? "",
      trade: prospect.trade,
      notes: prospect.notes ?? "",
    });
    setOpenTranscript(null);
    setMessage(null);
  }

  async function saveProspect() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/product/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, ...draft }),
      });
      if (!response.ok) throw new Error("Could not save");
      const body = (await response.json()) as { prospect: Prospect };
      setProspectList((current) => current.map((p) => (p.id === selected.id ? body.prospect : p)));
      setMessage("Prospect details saved.");
      router.refresh();
    } catch {
      setMessage("Could not save prospect details.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: Prospect["status"]) {
    const response = await fetch("/api/product/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok) {
      const body = (await response.json()) as { prospect: Prospect };
      setProspectList((current) => current.map((p) => (p.id === id ? body.prospect : p)));
      router.refresh();
    }
  }

  async function removeProspect() {
    if (!selected) return;
    setBusy(true);
    await fetch(`/api/product/prospects?id=${selected.id}`, { method: "DELETE" });
    setProspectList((current) => current.filter((p) => p.id !== selected.id));
    setSelectedId("");
    setDraft({ businessName: "", phone: "", contactName: "", targetRole: "", trade: "", notes: "" });
    setMessage("Prospect removed.");
    setBusy(false);
    router.refresh();
  }

  async function addProspect() {
    if (!newProspect.businessName.trim() || !newProspect.phone.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/product/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProspect),
      });
      if (!response.ok) throw new Error("Could not add");
      const body = (await response.json()) as { prospect: Prospect };
      setProspectList((current) => [body.prospect, ...current]);
      selectProspect(body.prospect);
      setNewProspect({ businessName: "", phone: "", contactName: "", targetRole: "owner", trade: "Heating & Gas" });
      setMessage("Prospect added.");
      router.refresh();
    } catch {
      setMessage("Could not add prospect.");
    } finally {
      setBusy(false);
    }
  }

  async function importBulk() {
    if (!bulkText.trim()) return;
    setBusy(true);
    setMessage(null);
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
      if (!response.ok) throw new Error(body.error ?? "Could not import");
      setBulkText("");
      setMessage(`${body.created ?? items.length} prospects imported.`);
      const list = await (await fetch("/api/product/prospects")).json() as { prospects: Prospect[] };
      setProspectList(list.prospects);
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not import");
    } finally {
      setBusy(false);
    }
  }

  async function runCall() {
    if (!selected || selected.status === "do-not-call") return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/product/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: selected.id, scenarioId }),
      });
      const body = (await response.json()) as { call?: OutreachCall; error?: string };
      if (!response.ok || !body.call) throw new Error(body.error ?? "Could not run the call");
      setCallList((current) => [body.call!, ...current]);
      setMessage("Call logged. Summary below.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not run the call");
    } finally {
      setBusy(false);
    }
  }

  async function callProspect() {
    if (!selected || selected.status === "do-not-call") return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/product/outreach/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: selected.id }),
      });
      const body = (await response.json()) as { call?: OutreachCall; error?: string };
      if (!response.ok || !body.call) throw new Error(body.error ?? "Could not place the call");
      setCallList((current) => [body.call!, ...current]);
      setMessage("Calling now. The transcript and summary will appear when the call ends.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not place the call");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!selectedId || !callList.some((call) => call.prospectId === selectedId && call.status === "dialling")) return;
    const timer = setInterval(async () => {
      const response = await fetch(`/api/product/outreach?prospectId=${selectedId}`);
      const body = (await response.json()) as { calls: OutreachCall[] };
      const remote = new Map(body.calls.map((call) => [call.id, call]));
      setCallList((current) => current.map((call) => remote.get(call.id) ?? call));
    }, 8000);
    return () => clearInterval(timer);
  }, [selectedId, callList]);

  async function saveWindow() {
    if (!callWindow) return;
    setBusy(true);
    const response = await fetch("/api/product/call-windows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ window: callWindow }),
    });
    setMessage(response.ok ? "Call window saved." : "Could not save call window.");
    setBusy(false);
    router.refresh();
  }

  function updateWindow(patch: Partial<CallWindow>) {
    setWindows((current) => current.map((item, i) => (i === 0 ? { ...item, ...patch } : item)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Outreach desk</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Find a prospect, see what happened on previous calls, and run the next one.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <details className="relative">
            <summary className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft">
              Add prospect
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-line bg-white p-4 shadow-xl">
              <input className={inputClass} placeholder="Business name" value={newProspect.businessName} onChange={(e) => setNewProspect({ ...newProspect, businessName: e.target.value })} />
              <input className={inputClass} placeholder="Phone" value={newProspect.phone} onChange={(e) => setNewProspect({ ...newProspect, phone: e.target.value })} />
              <input className={inputClass} placeholder="Contact name" value={newProspect.contactName} onChange={(e) => setNewProspect({ ...newProspect, contactName: e.target.value })} />
              <input className={inputClass} placeholder="Aim to speak to (e.g. owner)" value={newProspect.targetRole} onChange={(e) => setNewProspect({ ...newProspect, targetRole: e.target.value })} />
              <input className={inputClass} placeholder="Trade" value={newProspect.trade} onChange={(e) => setNewProspect({ ...newProspect, trade: e.target.value })} />
              <button type="button" onClick={addProspect} disabled={busy} className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Save prospect</button>
            </div>
          </details>
          <details className="relative">
            <summary className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft">
              Import list
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-96 space-y-3 rounded-2xl border border-line bg-white p-4 shadow-xl">
              <p className="text-xs text-muted">One per line: business, phone, contact, target role, trade</p>
              <textarea rows={5} className={`${inputClass} font-mono text-xs`} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
              <button type="button" onClick={importBulk} disabled={busy} className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Import</button>
            </div>
          </details>
          <details className="relative">
            <summary className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft">
              Call window
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-line bg-white p-4 shadow-xl">
              {callWindow && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input aria-label="From" type="time" className={inputClass} value={callWindow.start} onChange={(e) => updateWindow({ start: e.target.value })} />
                    <input aria-label="To" type="time" className={inputClass} value={callWindow.end} onChange={(e) => updateWindow({ end: e.target.value })} />
                  </div>
                  <input aria-label="Don't call before" type="datetime-local" className={inputClass} value={callWindow.notBefore ? new Date(callWindow.notBefore).toISOString().slice(0, 16) : ""} onChange={(e) => updateWindow({ notBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                  <div className="flex flex-wrap gap-1.5">
                    {DAY_LABELS.map(([day, label]) => {
                      const active = callWindow.days.includes(day);
                      return (
                        <button key={day} type="button" onClick={() => updateWindow({ days: active ? callWindow.days.filter((d) => d !== day) : [...callWindow.days, day].sort() })} className={`rounded-full border px-2 py-1 text-xs font-bold ${active ? "border-accent bg-accent text-white" : "border-line text-muted"}`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <input type="checkbox" checked={callWindow.enabled} onChange={(e) => updateWindow({ enabled: e.target.checked })} className="h-4 w-4 accent-[#0e7c74]" />
                    Enabled
                  </label>
                  <button type="button" onClick={saveWindow} disabled={busy} className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Save window</button>
                </>
              )}
            </div>
          </details>
        </div>
      </div>

      {message && <p className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-dark">{message}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <section className="card h-fit p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink">Prospects</h2>
            <span className="text-xs font-semibold text-muted">{visibleProspects.length}</span>
          </div>
          <input className={`${inputClass} mt-4`} placeholder="Search name or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["all", ...STATUSES].map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusFilter === status ? "bg-ink text-white" : "bg-paper text-muted"}`}>
                {status}
              </button>
            ))}
          </div>
          <div className="mt-4 max-h-[65vh] space-y-2 overflow-y-auto pr-1">
            {visibleProspects.map((prospect) => (
              <button key={prospect.id} type="button" onClick={() => selectProspect(prospect)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === prospect.id ? "border-accent bg-accent-soft/60" : "border-line bg-white hover:border-accent/40"}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{prospect.businessName}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${prospect.status === "do-not-call" ? "bg-[#f9e4df] text-loss" : "bg-paper-deep text-muted"}`}>
                    {prospect.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{prospect.contactName || "No named contact"} · {prospect.trade}</p>
                <p className="mt-1 text-[11px] text-muted">{prospect.phone}</p>
              </button>
            ))}
            {visibleProspects.length === 0 && <p className="rounded-xl bg-paper p-4 text-sm text-muted">No prospects match that search.</p>}
          </div>
        </section>

        <section className="space-y-5">
          {!selected ? (
            <div className="card p-10 text-center text-sm text-muted">Select a prospect to see their details and conversations.</div>
          ) : (
            <>
              <div className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink">{selected.businessName}</h2>
                    <p className="mt-1 text-xs text-muted">Prospect {selected.id} · {selectedCalls.length} call{selectedCalls.length === 1 ? "" : "s"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select aria-label="Prospect status" className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-semibold" value={selected.status} onChange={(e) => changeStatus(selected.id, e.target.value as Prospect["status"])}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button type="button" onClick={removeProspect} disabled={busy} className="text-xs font-bold text-loss hover:underline">Remove</button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Field label="Business" value={draft.businessName} onChange={(v) => setDraft({ ...draft, businessName: v })} />
                  <Field label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
                  <Field label="Contact name" value={draft.contactName} onChange={(v) => setDraft({ ...draft, contactName: v })} />
                  <Field label="Aim to speak to" value={draft.targetRole} onChange={(v) => setDraft({ ...draft, targetRole: v })} />
                  <Field label="Trade" value={draft.trade} onChange={(v) => setDraft({ ...draft, trade: v })} />
                  <Field label="Notes" value={draft.notes} onChange={(v) => setDraft({ ...draft, notes: v })} />
                </div>
                <button type="button" onClick={saveProspect} disabled={busy} className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Save details</button>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-ink">Make the next call</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <select className={`${inputClass} min-w-[220px] flex-1`} value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
                    {scenarios.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <button type="button" onClick={callProspect} disabled={busy || selected.status === "do-not-call"} className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    Call now (live)
                  </button>
                  <button type="button" onClick={runCall} disabled={busy || selected.status === "do-not-call"} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Run scripted demo</button>
                </div>
                <p className="mt-3 text-xs text-muted">Live calls dial the prospect from the Ringsure number. Scripted demos stay inside the desk.</p>
                {selected.status === "do-not-call" && <p className="mt-3 text-sm font-semibold text-loss">Marked do-not-call — no calls will be made.</p>}
                {selectedScenario && <p className="mt-3 text-xs text-muted">{selectedScenario.description}</p>}
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-ink">Conversation history</h3>
                <div className="mt-4 space-y-3">
                  {selectedCalls.length === 0 && <p className="rounded-xl bg-paper p-5 text-sm text-muted">No calls logged for this prospect yet.</p>}
                  {selectedCalls.map((call) => (
                    <div key={call.id} className="rounded-xl border border-line p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-ink">{call.outcome}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {new Date(call.createdAt).toLocaleString("en-GB")} · {call.scenario} ·{" "}
                            <span className="font-semibold">{call.mode === "live" ? "Live call" : "Scripted demo"}</span>
                            {call.mode === "live" && ` · ${call.status}`}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          call.mode === "live" && call.status === "dialling"
                            ? "bg-amber-soft text-[#8a5a12]"
                            : call.disclosureSpoken
                              ? "bg-accent-soft text-accent-dark"
                              : "bg-[#f9e4df] text-loss"
                        }`}>
                          {call.mode === "live" && call.status === "dialling" ? "Dialling…" : call.disclosureSpoken ? "AI disclosed" : "No disclosure"}
                        </span>
                      </div>
                      {call.summary && (
                        <div className="mt-3 rounded-lg bg-accent-soft/50 p-3 text-sm text-ink-soft">
                          <span className="text-xs font-bold uppercase tracking-wide text-accent">Summary</span>
                          <p className="mt-1">{call.summary}</p>
                        </div>
                      )}
                      {call.recordingUrl && (
                        <audio controls src={call.recordingUrl} className="mt-3 w-full" preload="none" />
                      )}
                      <button type="button" onClick={() => setOpenTranscript(openTranscript === call.id ? null : call.id)} className="mt-3 text-xs font-bold text-accent hover:underline">
                        {openTranscript === call.id ? "Hide transcript" : "View transcript"}
                      </button>
                      {openTranscript === call.id && (
                        <ol className="mt-3 space-y-2 border-t border-line pt-3">
                          {call.transcript.map((line, i) => (
                            <li key={i} className={`flex ${line.speaker === "caller" ? "justify-end" : ""}`}>
                              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${line.speaker === "ai" ? "bg-accent-soft text-ink-soft" : "bg-paper-deep text-ink"}`}>
                                <p className="text-[9px] font-bold uppercase text-muted">{line.speaker === "ai" ? "Ringsure AI" : "Prospect"}</p>
                                {line.text}
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
