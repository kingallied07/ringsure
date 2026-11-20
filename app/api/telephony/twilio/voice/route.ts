import { registerInboundCall, twilioVoiceXml } from "@/lib/product/adapters";
import { findBusinessByNumber, getIntegration } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const fromNumber = String(form.get("From") ?? "");
  const toNumber = String(form.get("To") ?? "");

  const business = await findBusinessByNumber(toNumber);
  const integration = await getIntegration();

  if (!business || !integration?.agentId) {
    return xml(
      `<Response><Say voice="alice">Sorry, this number isn't set up to take calls yet. Please try again later.</Say></Response>`,
    );
  }

  try {
    const call = await registerInboundCall({
      brief: business,
      agentId: integration.agentId,
      fromNumber,
      toNumber,
    });
    return xml(twilioVoiceXml(call.sipUri));
  } catch (error) {
    console.error("Inbound call setup failed:", error);
    return xml(
      `<Response><Say voice="alice">Sorry, we're having trouble connecting this call. Please try again shortly.</Say></Response>`,
    );
  }
}

function xml(body: string) {
  return new Response(body, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
