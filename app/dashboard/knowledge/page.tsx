import KnowledgeManager from "@/components/dashboard/KnowledgeManager";
import { listBusinesses, listIsolationRuns, listKnowledge } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const [tenants, knowledge, runs] = await Promise.all([
    listBusinesses(),
    listKnowledge(),
    listIsolationRuns(),
  ]);

  return (
    <KnowledgeManager
      tenants={tenants.map((t) => ({ id: t.id, name: t.businessName }))}
      initialKnowledge={knowledge}
      initialRuns={runs}
    />
  );
}
