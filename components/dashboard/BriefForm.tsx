"use client";

import Link from "next/link";
import { useState } from "react";
import { QUALIFICATION_FIELDS, tradeLabels, TRADES, type Brief, type Trade } from "@/lib/product/brief";
import { CheckIcon } from "@/components/ui/icons";

function toLines(values: string[]) {
  return values.join("\n");
}

function fromLines(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none";

export default function BriefForm({ brief }: { brief: Brief }) {
  const [form, setForm] = useState({
    businessName: brief.businessName,
    trade: brief.trade as Trade,
    serviceArea: toLines(brief.serviceArea),
    services: toLines(brief.services),
    emergencyRules: toLines(brief.emergencyRules),
    greeting: brief.greeting,
    hours: brief.hours,
    toneNotes: brief.toneNotes,
    transferNumber: brief.transferNumber,
    qualificationFields: [...brief.qualificationFields],
    calendarEnabled: brief.calendarEnabled,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  function toggleField(field: (typeof QUALIFICATION_FIELDS)[number]) {
    const fields = form.qualificationFields.includes(field)
      ? form.qualificationFields.filter((f) => f !== field)
      : [...form.qualificationFields, field];
    set("qualificationFields", fields);
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/product/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: brief.id,
          businessName: form.businessName,
          trade: form.trade,
          serviceArea: fromLines(form.serviceArea),
          services: fromLines(form.services),
          emergencyRules: fromLines(form.emergencyRules),
          greeting: form.greeting,
          hours: form.hours,
          toneNotes: form.toneNotes,
          transferNumber: form.transferNumber,
          qualificationFields: form.qualificationFields,
          calendarEnabled: form.calendarEnabled,
        }),
      });
      const result = (await response.json()) as { error?: string };
      setStatus(
        response.ok
          ? { ok: true, message: "Brief saved. The brain will use this on the next call." }
          : { ok: false, message: result.error ?? "Could not save the brief." },
      );
    } catch {
      setStatus({ ok: false, message: "Could not save the brief." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/briefs" className="text-sm font-bold text-accent hover:underline">
        ← All briefs
      </Link>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">{brief.businessName}</h1>
      <p className="mt-2 text-sm text-muted">
        Business ID <code className="rounded bg-paper-deep px-1.5 py-0.5">{brief.id}</code>. Changes are
        picked up on the next simulated call.
      </p>

      <div className="card mt-8 space-y-7 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="businessName" className="mb-1.5 block text-sm font-semibold text-ink">
              Business name
            </label>
            <input
              id="businessName"
              className={inputClass}
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="trade" className="mb-1.5 block text-sm font-semibold text-ink">
              Trade preset
            </label>
            <select
              id="trade"
              className={inputClass}
              value={form.trade}
              onChange={(e) => set("trade", e.target.value as Trade)}
            >
              {TRADES.map((trade) => (
                <option key={trade} value={trade}>
                  {tradeLabels[trade]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="greeting" className="mb-1.5 block text-sm font-semibold text-ink">
            Greeting
          </label>
          <textarea
            id="greeting"
            rows={2}
            className={inputClass}
            value={form.greeting}
            onChange={(e) => set("greeting", e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            The AI disclosure is appended automatically — never remove it from the prompt.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="serviceArea" className="mb-1.5 block text-sm font-semibold text-ink">
              Service areas <span className="font-normal text-muted">(one per line)</span>
            </label>
            <textarea
              id="serviceArea"
              rows={3}
              className={inputClass}
              value={form.serviceArea}
              onChange={(e) => set("serviceArea", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="services" className="mb-1.5 block text-sm font-semibold text-ink">
              Services offered <span className="font-normal text-muted">(one per line)</span>
            </label>
            <textarea
              id="services"
              rows={3}
              className={inputClass}
              value={form.services}
              onChange={(e) => set("services", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="emergencyRules" className="mb-1.5 block text-sm font-semibold text-ink">
            Emergency trigger phrases <span className="font-normal text-muted">(one per line)</span>
          </label>
          <textarea
            id="emergencyRules"
            rows={3}
            className={inputClass}
            value={form.emergencyRules}
            onChange={(e) => set("emergencyRules", e.target.value)}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Qualification fields to collect</legend>
          <div className="flex flex-wrap gap-2">
            {QUALIFICATION_FIELDS.map((field) => {
              const checked = form.qualificationFields.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleField(field)}
                  aria-pressed={checked}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    checked
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-white text-muted hover:border-accent/40"
                  }`}
                >
                  {checked && <CheckIcon className="h-3 w-3" />}
                  {field}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="hours" className="mb-1.5 block text-sm font-semibold text-ink">
              Opening hours
            </label>
            <input
              id="hours"
              className={inputClass}
              value={form.hours}
              onChange={(e) => set("hours", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="transferNumber" className="mb-1.5 block text-sm font-semibold text-ink">
              Transfer number <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="transferNumber"
              className={inputClass}
              placeholder="+44 7700 900000"
              value={form.transferNumber}
              onChange={(e) => set("transferNumber", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="toneNotes" className="mb-1.5 block text-sm font-semibold text-ink">
            Tone notes
          </label>
          <textarea
            id="toneNotes"
            rows={2}
            className={inputClass}
            value={form.toneNotes}
            onChange={(e) => set("toneNotes", e.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={form.calendarEnabled}
            onChange={(e) => set("calendarEnabled", e.target.checked)}
            className="h-4 w-4 accent-[#0e7c74]"
          />
          Calendar booking enabled
        </label>

        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save brief"}
          </button>
          {status && (
            <p className={`text-sm font-semibold ${status.ok ? "text-accent-dark" : "text-loss"}`} role="status">
              {status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
