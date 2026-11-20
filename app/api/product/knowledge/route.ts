import { NextResponse } from "next/server";
import {
  addKnowledge,
  deleteKnowledge,
  listKnowledge,
  tenantExists,
  type KnowledgeKind,
} from "@/lib/product/store";

const kinds: KnowledgeKind[] = ["faq", "website", "pricing", "rule", "note"];

export async function GET(request: Request) {
  const tenantId = new URL(request.url).searchParams.get("tenantId") ?? undefined;
  return NextResponse.json({ knowledge: await listKnowledge(tenantId) });
}

export async function POST(request: Request) {
  let body: { tenantId?: string; kind?: string; title?: string; content?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tenantId = body.tenantId?.trim() ?? "";
  const title = body.title?.trim() ?? "";
  const content = body.content?.trim() ?? "";
  const kind = (body.kind ?? "faq") as KnowledgeKind;

  if (!(await tenantExists(tenantId))) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  if (!title || !content || !kinds.includes(kind)) {
    return NextResponse.json({ error: "Title, content and a valid kind are required" }, { status: 400 });
  }

  const chunk = await addKnowledge({ tenantId, kind, title, content });
  return NextResponse.json({ chunk });
}

export async function DELETE(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id") ?? "";
  const tenantId = params.get("tenantId") ?? "";
  if (!id || !tenantId) return NextResponse.json({ error: "id and tenantId required" }, { status: 400 });
  await deleteKnowledge(id, tenantId);
  return NextResponse.json({ ok: true });
}
