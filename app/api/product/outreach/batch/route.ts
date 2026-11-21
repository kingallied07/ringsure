import { NextResponse } from "next/server";
import { canCallNow } from "@/lib/product/schedule";
import {
  getBatchState,
  listCallWindows,
  listProspects,
  saveBatchState,
} from "@/lib/product/store";

export async function GET() {
  return NextResponse.json({ batch: await getBatchState() });
}

export async function POST(request: Request) {
  let body: { action?: "start" | "stop" };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const current = await getBatchState();

  if (body.action === "stop") {
    const stopped = await saveBatchState({ ...current, running: false });
    return NextResponse.json({ batch: stopped });
  }

  const windowCheck = canCallNow(await listCallWindows());
  if (!windowCheck.allowed) {
    return NextResponse.json({ error: windowCheck.reason }, { status: 409 });
  }

  const queue = (await listProspects())
    .filter((prospect) => prospect.status === "new" && prospect.phone.trim())
    .map((prospect) => prospect.id);

  if (!queue.length) {
    return NextResponse.json({ error: "No new prospects to call" }, { status: 409 });
  }

  const started = await saveBatchState({
    running: true,
    queue,
    cursor: 0,
    startedAt: new Date().toISOString(),
    lastProspect: undefined,
    lastError: undefined,
  });

  return NextResponse.json({ batch: started });
}
