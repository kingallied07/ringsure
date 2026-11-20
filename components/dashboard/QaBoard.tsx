"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QaReview, UnansweredQuestion } from "@/lib/product/store";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

export default function QaBoard({
  unanswered,
  reviews,
  tenants,
}: {
  unanswered: UnansweredQuestion[];
  reviews: QaReview[];
  tenants: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(unanswered);
  const [reviewList, setReviewList] = useState(reviews);
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [callId, setCallId] = useState("");
  const [score, setScore] = useState(8);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function resolve(id: string) {
    const response = await fetch("/api/product/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: id }),
    });
    if (response.ok) {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "resolved" } : item)));
      router.refresh();
    }
  }

  async function addReview() {
    if (!callId.trim()) return;
    const response = await fetch("/api/product/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, callId, score, notes }),
    });
    if (response.ok) {
      const body = (await response.json()) as { review: QaReview };
      setReviewList((current) => [body.review, ...current]);
      setCallId("");
      setNotes("");
      setStatus("Review saved.");
      router.refresh();
    } else {
      setStatus("Could not save review.");
    }
  }

  const nameFor = (id: string) => tenants.find((tenant) => tenant.id === id)?.name ?? id;
  const open = items.filter((item) => item.status === "open");

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Quality control</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Every unanswered question becomes knowledge work. Every reviewed call feeds the loop that
        makes the assistant sound like a flawless front desk over time.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-ink">Unanswered questions</h2>
            <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-[#8a5a12]">
              {open.length} open
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {items.length === 0 && (
              <p className="rounded-xl bg-paper p-5 text-sm text-muted">
                Nothing logged yet. Questions appear when the assistant can&apos;t find an approved answer.
              </p>
            )}
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-line p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-accent">
                  {nameFor(item.tenantId)} · {item.callId}
                </p>
                <p className="mt-1 text-sm text-ink-soft">&ldquo;{item.question}&rdquo;</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </span>
                  {item.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => resolve(item.id)}
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      Mark resolved
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-accent">Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink">Log a call review</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="qaTenant" className="mb-1.5 block text-sm font-semibold text-ink">
                Tenant
              </label>
              <select
                id="qaTenant"
                className={inputClass}
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="qaCallId" className="mb-1.5 block text-sm font-semibold text-ink">
                Call ID
              </label>
              <input
                id="qaCallId"
                className={inputClass}
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                placeholder="call_live_test_001"
              />
            </div>
            <div>
              <label htmlFor="qaScore" className="mb-1.5 block text-sm font-semibold text-ink">
                Score ({score}/10)
              </label>
              <input
                id="qaScore"
                type="range"
                min="0"
                max="10"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full accent-[#0e7c74]"
              />
            </div>
            <div>
              <label htmlFor="qaNotes" className="mb-1.5 block text-sm font-semibold text-ink">
                Notes
              </label>
              <textarea
                id="qaNotes"
                rows={3}
                className={inputClass}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What went well, what needs fixing"
              />
            </div>
            <button
              type="button"
              onClick={addReview}
              disabled={!callId.trim()}
              className="w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
            >
              Save review
            </button>
            {status && <p className="text-sm font-semibold text-accent-dark">{status}</p>}
          </div>
        </section>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Recent reviews</h2>
        <ul className="mt-4 divide-y divide-line">
          {reviewList.slice(0, 10).map((review) => (
            <li key={review.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-bold text-ink">{nameFor(review.tenantId)}</p>
                <p className="text-xs text-muted">{review.callId} · {review.notes || "No notes"}</p>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-dark">
                {review.score}/10
              </span>
            </li>
          ))}
          {reviewList.length === 0 && <li className="py-4 text-sm text-muted">No reviews yet.</li>}
        </ul>
      </section>
    </div>
  );
}
