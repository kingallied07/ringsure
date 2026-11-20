import { NextResponse } from "next/server";
import { configureTwilioNumber } from "@/lib/product/adapters";
import { getBusiness, saveBrief } from "@/lib/product/store";
import { validateBrief } from "@/lib/product/brief";

export async function POST(request: Request) {
  let body: { businessId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const business = body.businessId ? await getBusiness(body.businessId) : null;
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  try {
    const result = await configureTwilioNumber(business);
    const parsed = validateBrief(business);
    if (result.sid && parsed.success) {
      await saveBrief(business.id, parsed.data);
    }
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not configure the number." },
      { status: 502 },
    );
  }
}
