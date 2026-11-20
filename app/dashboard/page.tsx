import Link from "next/link";
import { listBusinesses, listCalls, listEvalRuns } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [businesses, calls, runs] = await Promise.all([listBusinesses(), listCalls(), listEvalRuns()]);
  const leads = calls.filter((call) => call.lead);
  const minutes = Math.round(calls.reduce((sum, call) => sum + call.durationSeconds, 0) / 60);
  const latestRun = runs[0];

  const stats = [
    { label: "Businesses configured", value: businesses.length },
    { label: "Simulated calls", value: calls.length },
    { label: "Leads captured", value: leads.length },
    { label: "Minutes used", value: minutes },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-extrabold text-ink">One brain. Many businesses.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Every call runs through the same Ringsure prompt and tools. What changes is the structured
          brief injected at call start. This dashboard is where you build briefs, simulate calls and
          check quality — with no paid accounts connected yet.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="font-display text-3xl font-extrabold text-accent">{stat.value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-ink">Recent calls</h2>
            <Link href="/dashboard/simulate" className="text-sm font-bold text-accent hover:underline">
              Run a call →
            </Link>
          </div>
          {calls.length === 0 ? (
            <p className="mt-6 rounded-xl bg-paper p-5 text-sm text-muted">
              No calls yet. Head to <strong>Simulate a call</strong> to create the first one.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {calls.slice(0, 6).map((call) => {
                const business = businesses.find((b) => b.id === call.businessId);
                return (
                  <li key={call.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <p className="text-sm font-bold text-ink">{call.scenario}</p>
                      <p className="text-xs text-muted">
                        {business?.businessName ?? call.businessId} · {call.durationSeconds}s
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {call.emergencyFlagged && (
                        <span className="rounded-full bg-amber-soft px-2 py-1 text-[10px] font-bold text-[#8a5a12]">
                          URGENT
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          call.lead ? "bg-accent-soft text-accent-dark" : "bg-paper-deep text-muted"
                        }`}
                      >
                        {call.lead ? "Lead" : "No lead"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-ink">Latest eval run</h2>
          {latestRun ? (
            <>
              <p className="mt-5 font-display text-4xl font-extrabold text-accent">
                {latestRun.summary.passed}/{latestRun.summary.total}
              </p>
              <p className="mt-1 text-sm text-muted">Scenarios passing</p>
              <Link href="/dashboard/evals" className="mt-6 inline-block text-sm font-bold text-accent hover:underline">
                View details →
              </Link>
            </>
          ) : (
            <>
              <p className="mt-5 rounded-xl bg-paper p-5 text-sm text-muted">
                No eval runs yet. Run the scripted caller suite to check disclosure, lead capture and
                emergency handling.
              </p>
              <Link href="/dashboard/evals" className="mt-4 inline-block text-sm font-bold text-accent hover:underline">
                Run evals →
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-ink">Configured businesses</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Link key={business.id} href={`/dashboard/briefs/${business.id}`} className="card block p-5 transition hover:-translate-y-1">
              <p className="font-display text-lg font-bold text-ink">{business.businessName}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">{business.trade}</p>
              <p className="mt-3 text-sm text-muted">{business.serviceArea.join(", ")}</p>
              <p className="mt-4 text-xs font-bold text-accent">Edit brief →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
