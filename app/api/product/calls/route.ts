import { NextResponse } from "next/server";
import { listCalls } from "@/lib/product/store";

export async function GET(request: Request) {
  const businessId = new URL(request.url).searchParams.get("businessId") ?? undefined;
  return NextResponse.json({ calls: await listCalls(businessId) });
}
