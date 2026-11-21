import { NextResponse } from "next/server";
import { dialOutbound, registerOutboundCall } from "@/lib/product/adapters";
import { canCallNow } from "@/lib/product/schedule";
import {
  addOutreachCall,
  getBusiness,
  getIntegration,
  listCallWindows,
  listProspects,
  updateProspectStatus,
} from "@/lib/product/store";

export async function POST(request: Request) {
  let body: { prospectId?: string };
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

  const windowCheck = canCallNow(await listCallWindows());
  if (!windowCheck.allowed) {
    return NextResponse.json({ error: windowCheck.reason }, { status: 409 });
  }

  const integration = await getIntegration();
  if (!integration?.agentId) {
    return NextResponse.json({ error: "Provision the brain before calling" }, { status: 409 });
  }

  const ringsure = await getBusiness("ringsure");
  if (!ringsure) return NextResponse.json({ error: "Ringsure tenant not found" }, { status: 404 });

  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim() || ringsure.phoneNumber;
  if (!/^\+?[0-9]{10,15}$/.test(fromNumber.replace(/[\s()-]/g, ""))) {
    return NextResponse.json({ error: "Set a valid Ringsure phone number in the brief" }, { status: 409 });
  }
  if (!/^\+?[0-9]{10,15}$/.test(prospect.phone.replace(/[\s()-]/g, ""))) {
    return NextResponse.json({ error: "Prospect phone number is not valid" }, { status: 409 });
  }

  try {
    const registered = await registerOutboundCall({
      brief: ringsure,
      agentId: integration.agentId,
      fromNumber,
      toNumber: prospect.phone,
      prospectName: prospect.contactName || prospect.targetRole || "the owner",
      prospectId: prospect.id,
    });

    await dialOutbound({
      toNumber: prospect.phone,
      fromNumber,
      sipUri: registered.sipUri,
    });

    const call = await addOutreachCall({
      prospectId: prospect.id,
      providerCallId: registered.callId,
      mode: "live",
      status: "dialling",
      scenario: "Live outbound call",
      transcript: [],
      outcome: "Dialling…",
      disclosureSpoken: true,
    });

    await updateProspectStatus(prospect.id, "contacted");
    return NextResponse.json({ call, providerCallId: registered.callId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not place the call" },
      { status: 502 },
    );
  }
}
