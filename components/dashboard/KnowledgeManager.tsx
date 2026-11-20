"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IsolationRun, KnowledgeChunk, KnowledgeKind } from "@/lib/product/store";

const kinds: KnowledgeKind[] = ["faq", "website", "pricing", "rule", "note"];
const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

type ChunkView = Pick<KnowledgeChunk, "id" | "tenantId" | "kind" | "title" | "content" | "createdAt">;

export default function KnowledgeManager({
  tenants,
  initialKnowledge,
  initialRuns,
}: {
  tenants: { id: string; name: string }[];
  initialKnowledge: ChunkView[];
  initialRuns: IsolationRun[];
}) {
  const router = useRouter();
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [kind, setKind] = useState<KnowledgeKind>("faq");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ title: string; content: string; kind: string }[] | null>(null);
  const [runs, setRuns] = useState(initialRuns);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const visible = knowledge.filter((item) => item.tenantId === tenantId);
  const latestRun = runs[0];

  async function addChunk() {
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/product/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, kind, title, content }),
      });
      if (!response.ok) throw new Error("Could not add knowledge");
      const body = (await response.json()) as { chunk: ChunkView };
      setKnowledge((current) => [body.chunk, ...current]);
      setTitle("");
      setContent("");
      setStatus("Added to this tenant's knowledge only.");
      router.refresh();
    } catch {
      setStatus("Could not add knowledge.");
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    setBusy(true);
    setResults(null);
    try {
      const response = await fetch("/api/product/knowledge/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, query }),
      });
      const body = (await response.json()) as { chunks?: typeof results };
      setResults(body.chunks ?? []);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/product/knowledge?id=${id}&tenantId=${tenantId}`, { method: "DELETE" });
    setKnowledge((current) => current.filter((item) => item.id !== id));
    router.refresh();
  }

  async function runIsolation() {
    setBusy(true);
    try {
      const response = await fetch("/api/product/isolation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const body = (await response.json()) as { run?: IsolationRun };
      if (body.run) setRuns((current) => [body.run!, ...current]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Tenant knowledge</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Everything the assistant knows about a business lives here. Retrieval is filtered by tenant
        before any search happens — the model never chooses which tenant to read from.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <label htmlFor="knowledgeTenant" className="mb-1.5 block text-sm font-semibold text-ink">
              Tenant
            </label>
            <select
              id="knowledgeTenant"
              className={inputClass}
              value={tenantId}
              onChange={(e) => {
                setTenantId(e.target.value);
                setResults(null);
              }}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted">Tenant ID: {tenantId}</p>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Add an approved fact</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="knowledgeKind" className="mb-1.5 block text-sm font-semibold text-ink">
                  Type
                </label>
                <select
                  id="knowledgeKind"
                  className={inputClass}
                  value={kind}
                  onChange={(e) => setKind(e.target.value as KnowledgeKind)}
                >
                  {kinds.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="knowledgeTitle" className="mb-1.5 block text-sm font-semibold text-ink">
                  Title
                </label>
                <input id="knowledgeTitle" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label htmlFor="knowledgeContent" className="mb-1.5 block text-sm font-semibold text-ink">
                  Approved answer
                </label>
                <textarea
                  id="knowledgeContent"
                  rows={5}
                  className={inputClass}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the exact answer the assistant is allowed to give."
                />
              </div>
              <button
                type="button"
                onClick={addChunk}
                disabled={busy || !title.trim() || !content.trim()}
                className="w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
              >
                Add knowledge
              </button>
              {status && <p className="text-sm font-semibold text-accent-dark">{status}</p>}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">Retrieval test</h2>
            <p className="mt-1 text-sm text-muted">
              Preview exactly what this tenant&apos;s assistant would retrieve mid-call.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                className={inputClass}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. what's your call-out charge?"
              />
              <button
                type="button"
                onClick={ask}
                disabled={busy}
                className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                Test
              </button>
            </div>
            {results && (
              <div className="mt-4 space-y-2">
                {results.length === 0 && (
                  <p className="rounded-xl bg-paper p-4 text-sm text-muted">
                    No approved answer — the agent would say it will pass the question on.
                  </p>
                )}
                {results.map((result, index) => (
                  <div key={index} className="rounded-xl border border-line bg-paper p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-accent">
                      {result.kind} · {result.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">{result.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold text-ink">Stored knowledge</h2>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-dark">
                {visible.length} chunks
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {visible.length === 0 && (
                <p className="rounded-xl bg-paper p-5 text-sm text-muted">No knowledge added yet.</p>
              )}
              {visible.map((item) => (
                <div key={item.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-accent">{item.kind}</p>
                      <p className="mt-1 text-sm font-bold text-ink">{item.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-xs font-bold text-loss hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Cross-tenant isolation</h2>
                <p className="mt-1 text-sm text-muted">Adversarial checks against leakage.</p>
              </div>
              <button
                type="button"
                onClick={runIsolation}
                disabled={busy}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                Run checks
              </button>
            </div>
            {latestRun ? (
              <>
                <p className="mt-5 font-display text-3xl font-extrabold text-accent">
                  {latestRun.summary.passed}/{latestRun.summary.total}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {latestRun.results.map((check) => (
                    <li key={check.name} className="flex gap-2">
                      <span className={check.passed ? "text-accent" : "text-loss"}>
                        {check.passed ? "✓" : "✕"}
                      </span>
                      <span>
                        <strong className="font-semibold text-ink-soft">{check.name}:</strong>{" "}
                        <span className="text-muted">{check.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-5 rounded-xl bg-paper p-5 text-sm text-muted">
                Run the checks to verify token signing, rejection and cross-tenant probes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
