import { NextResponse } from "next/server";
import { placeLiveCall } from "@/lib/product/outreach-dial";
import {
  getBatchState,
  listProspects,
  saveBatchState,
} from "@/lib/product/store";

/** Dials exactly one prospect from the active batch. The desk calls this repeatedly. */
export async function POST() {
  const batch = await getBatchState();
  if (!batch.running) return NextResponse.json({ done: true, reason: "Batch not running" });

  const prospects = await listProspects();
  const nextId = batch.queue[batch.cursor];

  if (!nextId) {
    await saveBatchState({ ...batch, running: false });
    return NextResponse.json({ done: true, called: batch.cursor });
  }

  const prospect = prospects.find((item) => item.id === nextId);
  if (!prospect || prospect.status === "do-not-call" || prospect.status !== "new") {
    await saveBatchState({ ...batch, cursor: batch.cursor + 1, lastError: undefined });
    return NextResponse.json({ done: false, skipped: true, remaining: batch.queue.length - batch.cursor - 1 });
  }

  try {
    await placeLiveCall(prospect);
    const updated = await saveBatchState({
      ...batch,
      cursor: batch.cursor + 1,
      lastProspect: prospect.businessName,
      lastError: undefined,
    });
    return NextResponse.json({
      done: false,
      called: updated.cursor,
      total: updated.queue.length,
      remaining: updated.queue.length - updated.cursor,
      prospect: prospect.businessName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the call";
    await saveBatchState({
      ...batch,
      cursor: batch.cursor + 1,
      lastError: `${prospect.businessName}: ${message}`,
    });
    return NextResponse.json({ done: false, skipped: true, remaining: batch.queue.length - batch.cursor - 1, error: message });
  }
}
