import { NextResponse } from "next/server";
import {
  addProspect,
  addProspectsBulk,
  deleteProspect,
  listProspects,
  updateProspect,
  type Prospect,
} from "@/lib/product/store";

export async function GET() {
  return NextResponse.json({ prospects: await listProspects() });
}

export async function POST(request: Request) {
  let body: {
    businessName?: string;
    phone?: string;
    contactName?: string;
    targetRole?: string;
    trade?: string;
    notes?: string;
    status?: Prospect["status"];
    items?: { businessName: string; phone: string; contactName?: string; targetRole?: string; trade: string }[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (Array.isArray(body.items) && body.items.length) {
    const valid = body.items.filter((item) => item.businessName?.trim() && item.phone?.trim());
    if (!valid.length) return NextResponse.json({ error: "No valid prospects in the list" }, { status: 400 });
    const created = await addProspectsBulk(valid);
    return NextResponse.json({ prospects: created, created: created.length });
  }

  const businessName = body.businessName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  if (!businessName || !phone) {
    return NextResponse.json({ error: "Business name and phone are required" }, { status: 400 });
  }

  const prospect = await addProspect({
    businessName,
    phone,
    contactName: body.contactName?.trim() || "",
    targetRole: body.targetRole?.trim() || "",
    trade: body.trade?.trim() || "Home service",
    notes: body.notes?.trim() || "",
    status: body.status,
  });
  return NextResponse.json({ prospect });
}

export async function PATCH(request: Request) {
  let body: {
    id?: string;
    status?: Prospect["status"];
    businessName?: string;
    phone?: string;
    contactName?: string;
    targetRole?: string;
    trade?: string;
    notes?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const allowed: Prospect["status"][] = ["new", "contacted", "interested", "pilot", "do-not-call"];
  if (body.status && !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const prospect = await updateProspect(body.id, {
    status: body.status,
    businessName: body.businessName?.trim(),
    phone: body.phone?.trim(),
    contactName: body.contactName?.trim(),
    targetRole: body.targetRole?.trim(),
    trade: body.trade?.trim(),
    notes: body.notes?.trim(),
  });
  return NextResponse.json({ prospect });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteProspect(id);
  return NextResponse.json({ ok: true });
}
