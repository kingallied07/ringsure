import { NextResponse } from "next/server";
import { syncBuiltInKnowledge } from "@/lib/product/store";

/** Refreshes the built-in approved facts in the live store after a prompt/knowledge change. */
export async function POST() {
  const result = await syncBuiltInKnowledge();
  return NextResponse.json({ ok: true, ...result });
}
