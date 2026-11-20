"use client";

import { useState } from "react";
import type { Call } from "@/lib/product/types";

export default function CallLibrary({
  calls,
  businesses,
}: {
  calls: Call[];
  businesses: { id: string; name: string }[];
}) {
  const [selectedId, setSelectedId] = useState(calls[0]?.id ?? "");
  const selected = calls.find((call) => call.id === selectedId) ?? calls[0];
  const nameFor = (id: string) => businesses.find((b) => b.id === id)?.name ?? id;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Conversations</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Every call the assistant handles, with its transcript and lead. Real Retell calls include a
        recording when available.
      </p>

      {calls.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm text-muted">No conversations yet. Make a test call or run a simulation.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="card max-h-[75vh] overflow-y-auto p-4">
            {calls.map((call) => (
              <button
                key={call.id}
                type="button"
                onClick={() => setSelectedId(call.id)}
                className={`mb-2 w-full rounded-xl border p-4 text-left transition ${
                  selected?.id === call.id
                    ? "border-accent bg-accent-soft/60"
                    : "border-line bg-white hover:border-accent/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-ink">{nameFor(call.businessId)}</p>
                  <span className="shrink-0 text-[10px] font-semibold text-muted">
                    {call.durationSeconds}s
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{call.scenario}</p>
                <p className="mt-2 text-[11px] text-muted">
                  {new Date(call.startedAt).toLocaleString("en-GB")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {call.lead && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent-dark">
                      Lead
                    </span>
                  )}
                  {call.emergencyFlagged && (
                    <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[10px] font-bold text-[#8a5a12]">
                      URGENT
                    </span>
                  )}
                  {call.recordingUrl && (
                    <span className="rounded-full bg-paper-deep px-2 py-0.5 text-[10px] font-bold text-muted">
                      Recording
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-5">
              <div className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink">
                      {nameFor(selected.businessId)}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      Call {selected.id} · {selected.fromNumber || "Unknown number"} ·{" "}
                      {new Date(selected.startedAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      selected.disclosureSpoken
                        ? "bg-accent-soft text-accent-dark"
                        : "bg-[#f9e4df] text-loss"
                    }`}
                  >
                    {selected.disclosureSpoken ? "✓ Disclosure" : "✕ No disclosure"}
                  </span>
                </div>

                {selected.recordingUrl && (
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                      Recording
                    </p>
                    <audio controls src={selected.recordingUrl} className="w-full" preload="none" />
                  </div>
                )}

                {selected.lead && (
                  <div className="mt-6 rounded-xl border border-accent/25 bg-accent-soft/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-accent">Captured lead</p>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <Detail label="Name" value={selected.lead.name} />
                      <Detail label="Phone" value={selected.lead.phone} />
                      <Detail label="Postcode" value={selected.lead.postcode || "—"} />
                      <Detail label="Job" value={selected.lead.jobType} />
                      <Detail label="Priority" value={selected.lead.urgency} />
                      <Detail label="Notes" value={selected.lead.notes || "—"} />
                    </div>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-ink">Transcript</h3>
                <ol className="mt-5 space-y-3">
                  {selected.transcript.map((line, index) => (
                    <li key={index} className={`flex ${line.speaker === "caller" ? "justify-end" : ""}`}>
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
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="font-semibold text-ink-soft">{value}</p>
    </div>
  );
}
