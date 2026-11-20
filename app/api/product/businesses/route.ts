import { NextResponse } from "next/server";
import { listBusinesses } from "@/lib/product/store";

export async function GET() {
  return NextResponse.json({ businesses: await listBusinesses() });
}
