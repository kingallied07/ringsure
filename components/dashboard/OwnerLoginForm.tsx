"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function OwnerLoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/owner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Could not sign in");
      }
      setPassword("");
      router.push(next);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-5">
      <div>
        <label htmlFor="ownerPassword" className="mb-1.5 block text-sm font-semibold text-ink">
          Owner password
        </label>
        <input
          id="ownerPassword"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in to my desk"}
      </button>
      {error && (
        <p role="alert" className="rounded-xl bg-[#fbf0ed] px-4 py-3 text-sm font-semibold text-loss">
          {error}
        </p>
      )}
    </form>
  );
}
