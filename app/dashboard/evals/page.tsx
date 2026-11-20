import EvalRunner from "@/components/dashboard/EvalRunner";
import { listBusinesses, listEvalRuns } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function EvalsPage() {
  const [businesses, runs] = await Promise.all([listBusinesses(), listEvalRuns()]);

  return (
    <EvalRunner
      businesses={businesses.map((b) => ({ id: b.id, name: b.businessName }))}
      initialRuns={runs}
    />
  );
}
