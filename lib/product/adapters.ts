import { buildDynamicVariables, POST_CALL_ANALYSIS_FIELDS, SYSTEM_PROMPT, type Brief } from "./brief";
import { mintCallContext } from "./context";

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

function hasRetellCredentials() {
  return Boolean(process.env.RETELL_API_KEY?.trim());
}

async function retell(path: string, body: Record<string, unknown>) {
  const response = await fetch(`https://api.retellai.com${path}`, {
    method: "POST",
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

async function provisionRetell(): Promise<ProvisionResult> {
  const selectedVoice = voiceId();

  const llm = await retell("/create-retell-llm", {
    general_prompt: SYSTEM_PROMPT,
    general_tools: [
      {
        type: "end_call",
        name: "end_call",
        description: "End the call once the caller's details have been captured and confirmed.",
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
    model: "gpt-4.1-mini",
    model_temperature: 0.2,
    start_speaker: "agent",
    begin_message: "{{opening_line}}",
    post_call_analysis_data: POST_CALL_ANALYSIS_FIELDS,
    post_call_analysis_model: "gpt-4.1-mini",
  });

  const agent = await retell("/create-agent", {
    agent_name: "Ringsure Receptionist",
    version_description: "One brain for all home service businesses; brief injected per call.",
    response_engine: { type: "retell-llm", llm_id: llm.llm_id },
    voice_id: selectedVoice,
    voice_model: process.env.RETELL_VOICE_MODEL?.trim() || "eleven_flash_v2_5",
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
  });

  return {
    mode: "retell",
    llmId: llm.llm_id ?? "",
    agentId: agent.agent_id ?? "",
    voiceId: selectedVoice,
    message: "Live Retell LLM and agent created. Add the agent ID to your imported Twilio number.",
  };
}

export async function provisionBrain(): Promise<ProvisionResult> {
  if (!hasRetellCredentials()) {
    return {
      mode: "mock",
      llmId: "llm_mock",
      agentId: "agent_mock",
      voiceId: voiceId(),
      message: "Mock mode — add RETELL_API_KEY to create the real brain.",
    };
  }
  return provisionRetell();
}

export async function registerInboundCall(input: {
  brief: Brief;
  agentId?: string;
  fromNumber: string;
  toNumber: string;
}): Promise<RegisteredCall> {
  if (!hasRetellCredentials() || !input.agentId) {
    const callId = `call_mock_${Date.now()}`;
    return { mode: "mock", callId, sipUri: `sip:${callId}@sip.retellai.com` };
  }

  const result = await retell("/register-call", {
    agent_id: input.agentId,
    from_number: input.fromNumber,
    to_number: input.toNumber,
    direction: "inbound",
    dynamic_variables: buildDynamicVariables(input.brief, mintCallContext(input.brief.id, "inbound")),
    metadata: { businessId: input.brief.id },
  });

  return {
    mode: "retell",
    callId: result.call_id ?? "",
    sipUri: `sip:${result.call_id ?? ""}@sip.retellai.com`,
  };
}

function twilioAuth() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) return null;
  return { sid, header: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` };
}

export async function configureTwilioNumber(brief: Brief): Promise<NumberConfig> {
  const voiceUrl = `${appUrl()}/api/telephony/twilio/voice`;
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

export function twilioVoiceXml(sipUri: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>${sipUri}</Sip>
  </Dial>
</Response>`;
}
