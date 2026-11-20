import OutreachDesk from "@/components/dashboard/OutreachDesk";
import { outreachScenarios } from "@/lib/product/outreach";
import { listOutreachCalls, listProspects } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const [prospects, calls] = await Promise.all([listProspects(), listOutreachCalls()]);

  return (
    <OutreachDesk
      prospects={prospects}
      calls={calls}
      scenarios={outreachScenarios.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
    />
  );
}
