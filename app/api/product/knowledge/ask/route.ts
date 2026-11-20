import { NextResponse } from "next/server";
import { retrieveKnowledge } from "@/lib/product/retrieval";
import { tenantExists } from "@/lib/product/store";

/** Owner-only preview of what the agent would retrieve for this tenant. */
export async function POST(request: Request) {
  let body: { tenantId?: string; query?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tenantId = body.tenantId ?? "";
  const query = body.query?.trim() ?? "";
  if (!(await tenantExists(tenantId))) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }

  const result = await retrieveKnowledge(tenantId, query || tenantId);
  return NextResponse.json({ chunks: result.chunks, tenantId });
}
