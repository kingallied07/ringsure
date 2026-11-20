import { NextResponse } from "next/server";
import { addProspect, listProspects, updateProspectStatus, type Prospect } from "@/lib/product/store";

export async function GET() {
  return NextResponse.json({ prospects: await listProspects() });
}

export async function POST(request: Request) {
  let body: { businessName?: string; phone?: string; trade?: string; notes?: string; status?: Prospect["status"] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const businessName = body.businessName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  if (!businessName || !phone) {
    return NextResponse.json({ error: "Business name and phone are required" }, { status: 400 });
  }

  const prospect = await addProspect({
    businessName,
    phone,
    trade: body.trade?.trim() || "Home service",
    notes: body.notes?.trim() || "",
    status: body.status,
  });
  return NextResponse.json({ prospect });
}

export async function PATCH(request: Request) {
  let body: { id?: string; status?: Prospect["status"] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const allowed: Prospect["status"][] = ["new", "contacted", "interested", "pilot", "do-not-call"];
  if (!body.id || !body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Valid id and status required" }, { status: 400 });
  }

  const prospect = await updateProspectStatus(body.id, body.status);
  return NextResponse.json({ prospect });
}
