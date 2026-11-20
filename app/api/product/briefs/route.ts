import { NextResponse } from "next/server";
import { validateBrief } from "@/lib/product/brief";
import { createBusiness, saveBrief } from "@/lib/product/store";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = validateBrief(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Brief validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  const id = typeof body.id === "string" && body.id ? body.id : null;
  const saved = id ? await saveBrief(id, parsed.data) : await createBusiness(parsed.data);
  return NextResponse.json({ brief: saved });
}
