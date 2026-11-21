import { dialOutbound, registerOutboundCall } from "./adapters";
import { canCallNow } from "./schedule";
import {
  addOutreachCall,
  getBusiness,
  getIntegration,
  listCallWindows,
  updateProspectStatus,
  type OutreachCall,
  type Prospect,
} from "./store";

/** One place that places a real call, used by both the single-call and batch buttons. */
export async function placeLiveCall(prospect: Prospect): Promise<OutreachCall> {
  if (prospect.status === "do-not-call") throw new Error("This prospect is marked do-not-call");

  const windowCheck = canCallNow(await listCallWindows());
  if (!windowCheck.allowed) throw new Error(windowCheck.reason);

  const integration = await getIntegration();
  if (!integration?.agentId) throw new Error("Provision the brain before calling");

  const ringsure = await getBusiness("ringsure");
  if (!ringsure) throw new Error("Ringsure tenant not found");

  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim() || ringsure.phoneNumber;
  if (!/^\+?[0-9]{10,15}$/.test(fromNumber.replace(/[\s()-]/g, ""))) {
    throw new Error("Set a valid Ringsure phone number in the brief");
  }
  if (!/^\+?[0-9]{10,15}$/.test(prospect.phone.replace(/[\s()-]/g, ""))) {
    throw new Error("Prospect phone number is not valid");
  }

  const registered = await registerOutboundCall({
    brief: ringsure,
    agentId: integration.agentId,
    fromNumber,
    toNumber: prospect.phone,
    prospectName: prospect.contactName || prospect.targetRole || "the owner",
    prospectBusiness: prospect.businessName,
    prospectId: prospect.id,
  });

  await dialOutbound({ toNumber: prospect.phone, fromNumber, sipUri: registered.sipUri });

  const call = await addOutreachCall({
    prospectId: prospect.id,
    providerCallId: registered.callId,
    openerId: registered.openerId,
    mode: "live",
    status: "dialling",
    scenario: "Live outbound call",
    transcript: [],
    outcome: "Dialling…",
    disclosureSpoken: true,
  });

  await updateProspectStatus(prospect.id, "contacted");
  return call;
}
