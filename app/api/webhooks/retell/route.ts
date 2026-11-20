import { NextResponse } from "next/server";

/**
 * Placeholder for the real Retell webhook.
 * Mock mode: acknowledge events so the adapter shape is in place.
 * Real mode will verify the signature, then persist transcript + lead and notify.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { event?: string } | null;
  console.info("[retell-webhook] mock acknowledgement:", body?.event ?? "unknown event");

  return NextResponse.json({
    received: true,
    mode: "mock",
    note: "Connect a verified Retell webhook to persist real calls.",
  });
}
