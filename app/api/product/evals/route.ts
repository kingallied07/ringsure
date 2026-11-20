import { NextResponse } from "next/server";
import { runEvals } from "@/lib/product/mock-brain";
import { getBusiness, listEvalRuns, saveEvalRun } from "@/lib/product/store";

export async function GET() {
  return NextResponse.json({ runs: await listEvalRuns() });
}

export async function POST(request: Request) {
  let body: { businessId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const business = body.businessId ? await getBusiness(body.businessId) : null;
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const results = runEvals(business);
  const run = await saveEvalRun({
    results,
    summary: {
      passed: results.filter((r) => r.passed).length,
      total: results.length,
    },
  });

  return NextResponse.json({ run });
}
