import { NextResponse } from "next/server";
import { placeLiveCall } from "@/lib/product/outreach-dial";
import { listProspects } from "@/lib/product/store";

export async function POST(request: Request) {
  let body: { prospectId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const prospect = (await listProspects()).find((item) => item.id === body.prospectId);
  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });

  try {
    const call = await placeLiveCall(prospect);
    return NextResponse.json({ call });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not place the call" },
      { status: 409 },
    );
  }
}
