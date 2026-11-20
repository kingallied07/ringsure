import { NextResponse } from "next/server";
import { verifyCallContext } from "@/lib/product/context";
import { retrieveKnowledge } from "@/lib/product/retrieval";
import { addUnanswered } from "@/lib/product/store";

/**
 * Called by the AI agent mid-call. Tenant identity comes ONLY from the signed
 * call context header — never from the request body or the model.
 */
export async function POST(request: Request) {
  const context = verifyCallContext(request.headers.get("x-ringsure-context"));
  if (!context) {
    return NextResponse.json({ error: "Invalid or expired call context" }, { status: 401 });
  }

  let body: { query?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) return NextResponse.json({ chunks: [] });

  const fallback = { chunks: [] as Awaited<ReturnType<typeof retrieveKnowledge>>["chunks"], assertionFailed: false };
  const { chunks, assertionFailed } = await Promise.race([
    retrieveKnowledge(context.tenantId, query),
    new Promise<typeof fallback>((resolve) => setTimeout(() => resolve(fallback), 4000)),
  ]);
  if (assertionFailed) {
    console.error("Tenant isolation assertion failed for call context:", context.tenantId);
  }

  if (!chunks.length) {
    await addUnanswered({
      tenantId: context.tenantId,
      callId: context.callId ?? "live-call",
      question: query,
    });
  }

  return NextResponse.json({
    chunks,
    note: chunks.length ? undefined : "No approved answer found — say you'll pass it on.",
  });
}
