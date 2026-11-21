import { notifyLead } from "@/lib/product/notify";
import {
  findBusinessByNumber,
  findOutreachCallByProviderId,
  listCalls,
  listProspects,
  saveCall,
  updateOutreachCall,
  updateProspect,
  type Prospect,
} from "@/lib/product/store";
import type { Lead, Utterance } from "@/lib/product/types";
import { verifyRetellSignature } from "@/lib/product/webhook";

type RetellCall = {
  call_id?: string;
  from_number?: string;
  to_number?: string;
  start_time?: number;
  end_time?: number;
  duration_ms?: number;
  transcript?: Array<{ role?: string; content?: string }> | string;
  recording_url?: string;
  call_analysis?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export const dynamic = "force-dynamic";

function analysisValue(analysis: Record<string, unknown> | undefined, key: string) {
  if (!analysis) return "";
  const custom = analysis.custom_analysis_data;
  let value: unknown = "";

  if (Array.isArray(custom)) {
    const item = custom.find((entry) => (entry as { name?: string })?.name === key) as
      | { value?: unknown }
      | undefined;
    value = item?.value;
  } else if (custom && typeof custom === "object") {
    value = (custom as Record<string, unknown>)[key];
  } else {
    value = analysis[key];
  }

  return typeof value === "string" ? value.trim() : "";
}

function parseTranscript(transcript: RetellCall["transcript"]): Utterance[] {
  if (!transcript) return [];
  if (typeof transcript === "string") return [{ speaker: "ai", text: transcript }];
  return transcript.map((line) => ({
    speaker: line.role === "user" || line.role === "caller" ? "caller" : "ai",
    text: line.content ?? "",
  }));
}

async function handleOutboundResult(
  call: RetellCall,
  read: (analysis: Record<string, unknown> | undefined, key: string) => string,
  parse: (transcript: RetellCall["transcript"]) => Utterance[],
  prospectId?: string,
  outreachCallId?: string,
) {
  const callId = call.call_id ?? "";
  const analysis = call.call_analysis;
  const transcript = parse(call.transcript);
  const outcome = read(analysis, "outcome") || "Call completed";
  const doNotCall = read(analysis, "do_not_call").toLowerCase() === "yes";
  const nextStep = read(analysis, "next_step");
  const notes = read(analysis, "notes");
  const email = read(analysis, "email");
  const contactName = read(analysis, "caller_name");
  const summary = [outcome, nextStep, notes, email ? `Email: ${email}` : ""]
    .filter(Boolean)
    .join(" — ");

  const disclosureSpoken =
    transcript.some((line) => /AI assistant|AI receptionist|not a person/i.test(line.text)) ||
    /AI assistant/i.test(transcript[0]?.text ?? "");

  if (outreachCallId) {
    await updateOutreachCall(outreachCallId, {
      providerCallId: callId,
      recordingUrl: call.recording_url,
      status: "completed",
      outcome,
      summary,
      transcript,
      disclosureSpoken,
    });
  }

  const targetId = prospectId ?? (callId ? (await findOutreachCallByProviderId(callId))?.prospectId : undefined);
  if (!targetId) return;

  const prospect = (await listProspects()).find((item) => item.id === targetId);
  if (!prospect) return;

  let status: Prospect["status"] = "contacted";
  if (doNotCall || /do.?not.?call|not interested/i.test(outcome)) status = "do-not-call";
  else if (/interested|pilot|signed.?up/i.test(outcome)) status = "interested";
  else if (/callback/i.test(outcome)) status = "contacted";

  await updateProspect(targetId, {
    status,
    contactName: prospect.contactName || contactName || undefined,
    notes: [prospect.notes, summary].filter(Boolean).join("\n").slice(0, 1000),
  });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-retell-signature");
  const apiKey = process.env.RETELL_API_KEY?.trim();

  if (apiKey && !verifyRetellSignature(raw, signature, apiKey)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event?: string; call?: RetellCall };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event ?? "";
  if (event !== "call_ended" && event !== "call_analyzed") {
    return new Response(null, { status: 204 });
  }

  const call = payload.call;
  if (!call?.call_id) return new Response(null, { status: 204 });

  const existing = await listCalls();
  if (existing.some((saved) => saved.providerCallId === call.call_id)) {
    return new Response(null, { status: 204 });
  }

  const prospectId =
    typeof call.metadata?.prospectId === "string" ? call.metadata.prospectId : undefined;
  const outgoing = await findOutreachCallByProviderId(call.call_id);

  if (prospectId || outgoing) {
    await handleOutboundResult(call, analysisValue, parseTranscript, prospectId, outgoing?.id);
    return new Response(null, { status: 204 });
  }

  const businessId =
    typeof call.metadata?.businessId === "string"
      ? call.metadata.businessId
      : call.to_number
        ? (await findBusinessByNumber(call.to_number))?.id
        : undefined;

  if (!businessId) {
    console.error("Retell call could not be matched to a business:", call.call_id);
    return new Response(null, { status: 204 });
  }

  const analysis = call.call_analysis;
  const transcript = parseTranscript(call.transcript);
  const name = analysisValue(analysis, "caller_name");
  const phone = analysisValue(analysis, "caller_phone") || call.from_number || "";
  const jobType = analysisValue(analysis, "job_type");
  const urgency = analysisValue(analysis, "urgency").toLowerCase();
  const emergency = urgency === "urgent";
  const hasLead = Boolean(name || jobType || analysisValue(analysis, "notes"));

  const lead: Lead | null = hasLead
    ? {
        name: name || "Unknown caller",
        phone,
        postcode: analysisValue(analysis, "postcode"),
        jobType: jobType || "General enquiry",
        urgency: emergency ? "urgent" : "standard",
        notes: [analysisValue(analysis, "emergency_reason"), analysisValue(analysis, "notes")]
          .filter(Boolean)
          .join(" · "),
        capturedAt: new Date(call.end_time ?? Date.now()).toISOString(),
      }
    : null;

  const startedAt = new Date(call.start_time ?? Date.now()).toISOString();
  const endedAt = new Date(call.end_time ?? Date.now()).toISOString();

  const saved = await saveCall({
    providerCallId: call.call_id,
    recordingUrl: call.recording_url,
    businessId,
    fromNumber: call.from_number ?? "",
    scenario: `Retell call ${call.call_id}`,
    startedAt,
    endedAt,
    durationSeconds: Math.round((call.duration_ms ?? 0) / 1000),
    transcript,
    lead,
    disclosureSpoken: transcript.some((line) => /AI assistant|AI receptionist/i.test(line.text)),
    emergencyFlagged: emergency,
    transferred: false,
    booked: false,
  });

  const business = (await findBusinessByNumber(call.to_number ?? "")) ?? null;
  await notifyLead(saved, business?.businessName ?? "Ringsure customer");

  return new Response(null, { status: 204 });
}
