import { NextResponse } from "next/server";
import { runIsolationChecks } from "@/lib/product/isolation";
import { tenantExists } from "@/lib/product/store";

export async function POST(request: Request) {
  let body: { tenantId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tenantId = body.tenantId ?? "";
  if (!(await tenantExists(tenantId))) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }

  const run = await runIsolationChecks(tenantId);
  return NextResponse.json({ run });
}
