import { NextResponse } from "next/server";
import {
  addQaReview,
  listQaReviews,
  listUnanswered,
  resolveUnanswered,
  tenantExists,
} from "@/lib/product/store";

export async function GET(request: Request) {
  const tenantId = new URL(request.url).searchParams.get("tenantId") ?? undefined;
  const [unanswered, reviews] = await Promise.all([listUnanswered(tenantId), listQaReviews(tenantId)]);
  return NextResponse.json({ unanswered, reviews });
}

export async function POST(request: Request) {
  let body: { tenantId?: string; callId?: string; score?: number; notes?: string; questionId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.questionId) {
    const item = await resolveUnanswered(body.questionId);
    return NextResponse.json({ item });
  }

  const tenantId = body.tenantId ?? "";
  if (!(await tenantExists(tenantId))) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  if (!body.callId || typeof body.score !== "number") {
    return NextResponse.json({ error: "callId and score are required" }, { status: 400 });
  }

  const review = await addQaReview({
    tenantId,
    callId: body.callId,
    score: Math.max(0, Math.min(10, body.score)),
    notes: body.notes?.trim() || "",
  });
  return NextResponse.json({ review });
}
