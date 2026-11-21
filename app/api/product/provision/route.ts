import { NextResponse } from "next/server";
import { provisionBrain } from "@/lib/product/adapters";
import { getIntegration, saveIntegration } from "@/lib/product/store";

export async function GET() {
  return NextResponse.json({ integration: await getIntegration() });
}

export async function POST() {
  try {
    const current = await getIntegration();
    const result = await provisionBrain(current ?? undefined);
    const integration = await saveIntegration({
      provider: result.mode,
      llmId: result.llmId,
      agentId: result.agentId,
      voiceId: result.voiceId,
      provisionedAt: new Date().toISOString(),
    });
    return NextResponse.json({ result, integration });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not provision the brain." },
      { status: 502 },
    );
  }
}
