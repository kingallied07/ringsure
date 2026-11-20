import Link from "next/link";
import { listBusinesses } from "@/lib/product/store";
import { tradeLabels } from "@/lib/product/brief";
import NewTenantForm from "@/components/dashboard/NewTenantForm";

export const dynamic = "force-dynamic";

export default async function BriefsPage() {
  const businesses = await listBusinesses();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Business briefs</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        A brief is everything the one brain needs to know about a business. Presets are just starting
        points — edit the fields to match the customer.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <NewTenantForm />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {businesses.map((brief) => (
          <Link key={brief.id} href={`/dashboard/briefs/${brief.id}`} className="card block p-6 transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold text-ink">{brief.businessName}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">
                  {tradeLabels[brief.trade]}
                </p>
              </div>
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold text-accent-dark">
                ID {brief.id}
              </span>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Area</dt>
                <dd className="text-right font-semibold text-ink-soft">{brief.serviceArea.join(", ")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Services</dt>
                <dd className="text-right font-semibold text-ink-soft">{brief.services.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Emergency rules</dt>
                <dd className="text-right font-semibold text-ink-soft">{brief.emergencyRules.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Updated</dt>
                <dd className="text-right text-xs text-muted">
                  {new Date(brief.updatedAt).toLocaleDateString("en-GB")}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-xs font-bold text-accent">Edit brief →</p>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}
