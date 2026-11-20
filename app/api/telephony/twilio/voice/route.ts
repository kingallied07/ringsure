import { decodeCallConfig } from "@/lib/product/call-config";
import { registerInboundCall, twilioVoiceXml } from "@/lib/product/adapters";
import { findBusinessByNumber, getIntegration, type Brief } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const fromNumber = String(form.get("From") ?? "");
  const toNumber = String(form.get("To") ?? "");

  // Preferred path: the signed brief is embedded in the webhook URL by
  // "Point number at Ringsure", so calls work even if shared storage is slow.
  const encoded = new URL(request.url).searchParams.get("cfg");
  const embedded = decodeCallConfig(encoded);
  let brief: Brief | null = embedded?.brief ?? null;
  let agentId = embedded?.agentId ?? "";

  if (!brief || !agentId) {
    brief = await findBusinessByNumber(toNumber);
    agentId = (await getIntegration())?.agentId ?? "";
  }

  if (!brief || !agentId) {
    return xml(
      `<Response><Say voice="alice">Sorry, this number isn't set up to take calls yet. Please try again later.</Say></Response>`,
    );
  }

  try {
    const call = await registerInboundCall({ brief, agentId, fromNumber, toNumber });
    return xml(twilioVoiceXml(call.sipUri));
  } catch (error) {
    console.error("Inbound call setup failed:", error);
    return xml(
      `<Response><Say voice="alice">Sorry, we're having trouble connecting this call. Please try again shortly.</Say></Response>`,
    );
  }
}

function xml(body: string) {
  return new Response(body, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}
