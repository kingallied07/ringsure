import OutreachDesk from "@/components/dashboard/OutreachDesk";
import { outreachScenarios } from "@/lib/product/outreach";
import { getBatchState, listCallWindows, listOutreachCalls, listProspects } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const [prospects, calls, windows, batch] = await Promise.all([
    listProspects(),
    listOutreachCalls(),
    listCallWindows(),
    getBatchState(),
  ]);

  return (
    <OutreachDesk
      prospects={prospects}
      calls={calls}
      initialWindows={windows}
      initialBatch={batch}
      scenarios={outreachScenarios.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
    />
  );
}
