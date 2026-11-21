import { buildDynamicVariables, POST_CALL_ANALYSIS_FIELDS, SYSTEM_PROMPT, type Brief } from "./brief";
import { mintCallContext } from "./context";
import { encodeCallConfig } from "./call-config";

export type ProvisionResult = {
  mode: "mock" | "retell";
  llmId: string;
  agentId: string;
  voiceId: string;
  message: string;
};

export type RegisteredCall = {
  mode: "mock" | "retell";
  callId: string;
  sipUri: string;
};

export type NumberConfig = {
  mode: "mock" | "retell";
  sid?: string;
  voiceUrl: string;
  message: string;
};

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function voiceId() {
  return process.env.RETELL_VOICE_ID?.trim() || "11labs-Adrian";
}

function llmModel() {
  return process.env.RETELL_MODEL?.trim() || "gpt-4.1-mini";
}

function analysisModel() {
  return process.env.RETELL_ANALYSIS_MODEL?.trim() || "gpt-4.1-mini";
}

function hasRetellCredentials() {
  return Boolean(process.env.RETELL_API_KEY?.trim());
}

async function retell(path: string, body: Record<string, unknown>, method: "POST" | "PATCH" = "POST") {
  const response = await fetch(`https://api.retellai.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.RETELL_API_KEY?.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    throw new Error(`Retell ${path} failed (${response.status}): ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data as { llm_id?: string; agent_id?: string; call_id?: string };
}

function llmConfig() {
  return {
    general_prompt: SYSTEM_PROMPT,
    general_tools: [
      {
        type: "end_call",
        name: "end_call",
        description:
          "End the call only after the problem is understood and the details have been captured and confirmed back to the caller.",
      },
      {
        type: "custom",
        name: "search_knowledge",
        description:
          "Look up this business's approved facts, FAQ answers and price guidance when the caller asks a question you are not certain about. Never call it for another business.",
        url: `${appUrl()}/api/product/knowledge/search`,
        method: "POST",
        headers: { "x-ringsure-context": "{{call_context_token}}" },
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The caller's question, in their own words." },
          },
          required: ["query"],
        },
        speak_during_execution: true,
        execution_message_description: "Let me check that for you.",
      },
    ],
    model: llmModel(),
    model_temperature: 0.2,
    start_speaker: "agent",
    begin_message: "{{opening_line}}",
    post_call_analysis_data: POST_CALL_ANALYSIS_FIELDS,
    post_call_analysis_model: analysisModel(),
  };
}

function agentConfig(llmId: string) {
  return {
    agent_name: "Ringsure Receptionist",
    version_description: "Discovery-first receptionist. One brain, brief injected per call.",
    response_engine: { type: "retell-llm", llm_id: llmId },
    voice_id: voiceId(),
    // Let Retell pick the TTS model that matches the selected voice.
    language: "en-GB",
    voice_temperature: 0.9,
    voice_speed: 1,
    responsiveness: 1,
    interruption_sensitivity: 0.85,
    enable_backchannel: true,
    backchannel_words: ["yeah", "right", "okay"],
    stt_mode: "accurate",
    denoising_mode: "noise-cancellation",
    max_call_duration_ms: 240000,
    end_call_after_silence_ms: 15000,
    begin_message_delay_ms: 600,
    data_storage_setting: "everything",
    data_storage_retention_days: 30,
    opt_in_signed_url: true,
    webhook_url: `${appUrl()}/api/webhooks/retell`,
    webhook_events: ["call_ended", "call_analyzed"],
    handbook_config: {
      natural_filler_words: true,
      ai_disclosure: true,
      scope_boundaries: true,
      echo_verification: true,
    },
  };
}

async function createBrain(): Promise<ProvisionResult> {
  const llm = await retell("/create-retell-llm", llmConfig());
  const agent = await retell("/create-agent", agentConfig(llm.llm_id ?? ""));
  return {
    mode: "retell",
    llmId: llm.llm_id ?? "",
    agentId: agent.agent_id ?? "",
    voiceId: voiceId(),
    message: "Live brain created with the new discovery-first prompt. Point number at Ringsure again to apply it.",
  };
}

async function updateBrain(llmId: string, agentId: string): Promise<ProvisionResult> {
  await retell(`/update-retell-llm/${llmId}`, llmConfig(), "PATCH");
  await retell(`/update-agent/${agentId}`, agentConfig(llmId), "PATCH");
  return {
    mode: "retell",
    llmId,
    agentId,
    voiceId: voiceId(),
    message: "Live brain updated with the new discovery-first prompt. Existing numbers already use this agent — just call in to test.",
  };
}

export async function provisionBrain(existing?: { llmId?: string; agentId?: string }): Promise<ProvisionResult> {
  if (!hasRetellCredentials()) {
    return {
      mode: "mock",
      llmId: "llm_mock",
      agentId: "agent_mock",
      voiceId: voiceId(),
      message: "Mock mode — add RETELL_API_KEY to create the real brain.",
    };
  }
  if (existing?.llmId && existing?.agentId) return updateBrain(existing.llmId, existing.agentId);
  return createBrain();
}

export async function registerCall(input: {
  brief: Brief;
  agentId?: string;
  fromNumber: string;
  toNumber: string;
  direction: "inbound" | "outbound";
  prospectName?: string;
  prospectId?: string;
}): Promise<RegisteredCall> {
  if (!hasRetellCredentials() || !input.agentId) {
    const callId = `call_mock_${Date.now()}`;
    return { mode: "mock", callId, sipUri: `sip:${callId}@sip.retellai.com` };
  }

  const result = await retell("/v2/register-phone-call", {
    agent_id: input.agentId,
    from_number: input.fromNumber,
    to_number: input.toNumber,
    direction: input.direction,
    retell_llm_dynamic_variables: buildDynamicVariables(
      input.brief,
      mintCallContext(input.brief.id, input.direction),
      input.direction,
      input.prospectName,
    ),
    metadata: { businessId: input.brief.id, prospectId: input.prospectId },
  });

  return {
    mode: "retell",
    callId: result.call_id ?? "",
    sipUri: `sip:${result.call_id ?? ""}@sip.retellai.com`,
  };
}

export function registerInboundCall(input: {
  brief: Brief;
  agentId?: string;
  fromNumber: string;
  toNumber: string;
}) {
  return registerCall({ ...input, direction: "inbound" });
}

export function registerOutboundCall(input: {
  brief: Brief;
  agentId?: string;
  fromNumber: string;
  toNumber: string;
  prospectName?: string;
  prospectId?: string;
}) {
  return registerCall({ ...input, direction: "outbound" });
}

function twilioAuth() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) return null;
  return { sid, header: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` };
}

export async function configureTwilioNumber(brief: Brief, agentId?: string): Promise<NumberConfig> {
  const cfg = agentId ? encodeCallConfig(brief, agentId) : "";
  const voiceUrl = `${appUrl()}/api/telephony/twilio/voice${cfg ? `?cfg=${encodeURIComponent(cfg)}` : ""}`;
  const auth = twilioAuth();

  if (!auth) {
    return {
      mode: "mock",
      voiceUrl,
      message: "Mock mode — add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to configure a real number.",
    };
  }

  if (!brief.phoneNumber) {
    return { mode: "retell", voiceUrl, message: "Add an E.164 phone number to this brief first." };
  }

  const listUrl = `https://api.twilio.com/2010-04-01/Accounts/${auth.sid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(brief.phoneNumber)}`;
  const list = await fetch(listUrl, { headers: { Authorization: auth.header } });
  if (!list.ok) throw new Error(`Twilio number lookup failed (${list.status})`);
  const found = (await list.json()) as { incoming_phone_numbers?: { sid: string }[] };
  const sid = found.incoming_phone_numbers?.[0]?.sid;

  if (!sid) {
    return {
      mode: "retell",
      voiceUrl,
      message: "Number not found on this Twilio account — buy or import it first.",
    };
  }

  const body = new URLSearchParams({ VoiceUrl: voiceUrl, VoiceMethod: "POST" });
  const update = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${auth.sid}/IncomingPhoneNumbers/${sid}.json`,
    { method: "POST", headers: { Authorization: auth.header }, body },
  );
  if (!update.ok) throw new Error(`Twilio number update failed (${update.status})`);

  return {
    mode: "retell",
    sid,
    voiceUrl,
    message: "Twilio number now points at the Ringsure voice webhook.",
  };
}

/** Places the actual outbound call through Twilio, dialling the Retell SIP endpoint. */
export async function dialOutbound(input: {
  toNumber: string;
  fromNumber: string;
  sipUri: string;
  statusCallback?: string;
}) {
  const auth = twilioAuth();
  if (!auth) throw new Error("Twilio credentials are not configured");

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Sip>${input.sipUri}</Sip></Dial></Response>`;
  const body = new URLSearchParams({
    To: input.toNumber,
    From: input.fromNumber,
    Twiml: twiml,
    Method: "POST",
  });
  if (input.statusCallback) body.set("StatusCallback", input.statusCallback);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${auth.sid}/Calls.json`,
    { method: "POST", headers: { Authorization: auth.header }, body },
  );
  const data = (await response.json().catch(() => null)) as { sid?: string; message?: string } | null;
  if (!response.ok) {
    throw new Error(data?.message || `Twilio call failed (${response.status})`);
  }
  return { callSid: data?.sid ?? "" };
}

export function twilioVoiceXml(sipUri: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>${sipUri}</Sip>
  </Dial>
</Response>`;
}
