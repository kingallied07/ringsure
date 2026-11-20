import { NextResponse } from "next/server";
import { runMockOutreach } from "@/lib/product/outreach";
import { addOutreachCall, listProspects, updateProspectStatus, type Prospect } from "@/lib/product/store";

export async function POST(request: Request) {
  let body: { prospectId?: string; scenarioId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const prospect = (await listProspects()).find((item) => item.id === body.prospectId);
  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  if (prospect.status === "do-not-call") {
    return NextResponse.json({ error: "This prospect is marked do-not-call" }, { status: 409 });
  }

  const call = await addOutreachCall(runMockOutreach(prospect, body.scenarioId ?? ""));
  const nextStatus: Prospect["status"] = call.outcome.toLowerCase().includes("do not call")
    ? "do-not-call"
    : call.outcome.toLowerCase().includes("pilot")
      ? "pilot"
      : "contacted";
  await updateProspectStatus(prospect.id, nextStatus);

  return NextResponse.json({ call });
}
