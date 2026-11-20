import SimulateForm from "@/components/dashboard/SimulateForm";
import { scenarios } from "@/lib/product/mock-brain";
import { listBusinesses } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function SimulatePage() {
  const businesses = await listBusinesses();

  return (
    <SimulateForm
      businesses={businesses.map((b) => ({ id: b.id, name: b.businessName, trade: b.trade }))}
      scenarios={scenarios.map((s) => ({
        id: s.id,
        label: s.label,
        description: s.description,
      }))}
    />
  );
}
