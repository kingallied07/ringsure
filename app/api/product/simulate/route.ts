import { NextResponse } from "next/server";
import { runMockCall } from "@/lib/product/mock-brain";
import { notifyLead } from "@/lib/product/notify";
import { getBusiness, saveCall } from "@/lib/product/store";

export async function POST(request: Request) {
  let body: { businessId?: string; scenarioId?: string; fromNumber?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const business = body.businessId ? await getBusiness(body.businessId) : null;
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const call = await saveCall(runMockCall(business, body.scenarioId ?? "", body.fromNumber));
  const notification = await notifyLead(call, business.businessName);

  return NextResponse.json({ call, notification });
}
