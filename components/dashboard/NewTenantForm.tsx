"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { tradeLabels, tradePresets, TRADES, type Trade } from "@/lib/product/brief";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

export default function NewTenantForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [trade, setTrade] = useState<Trade>("heating-gas");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/product/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tradePresets[trade], businessName: name.trim() }),
      });
      if (!response.ok) throw new Error("Could not create tenant");
      setName("");
      router.refresh();
    } catch {
      setError("Could not create tenant");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-bold text-ink">Add a tenant</h2>
      <p className="mt-1 text-sm text-muted">
        Creates a business with a trade preset. You can tune the brief and knowledge next.
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="tenantName" className="mb-1.5 block text-sm font-semibold text-ink">
            Business name
          </label>
          <input
            id="tenantName"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acute Heating Ltd"
          />
        </div>
        <div>
          <label htmlFor="tenantTrade" className="mb-1.5 block text-sm font-semibold text-ink">
            Trade preset
          </label>
          <select
            id="tenantTrade"
            className={inputClass}
            value={trade}
            onChange={(e) => setTrade(e.target.value as Trade)}
          >
            {TRADES.map((item) => (
              <option key={item} value={item}>
                {tradeLabels[item]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={busy || !name.trim()}
          className="w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create tenant"}
        </button>
        {error && <p className="text-sm font-semibold text-loss">{error}</p>}
      </div>
    </div>
  );
}
