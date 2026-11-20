import { NextResponse } from "next/server";
import { listCallWindows, saveCallWindow, type CallWindow } from "@/lib/product/store";

export async function GET() {
  return NextResponse.json({ windows: await listCallWindows() });
}

export async function POST(request: Request) {
  let body: { window?: CallWindow };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const window = body.window;
  if (
    !window?.id ||
    !window.label ||
    !/^\d{2}:\d{2}$/.test(window.start) ||
    !/^\d{2}:\d{2}$/.test(window.end) ||
    !Array.isArray(window.days)
  ) {
    return NextResponse.json({ error: "Invalid call window" }, { status: 400 });
  }

  const saved = await saveCallWindow(window);
  return NextResponse.json({ window: saved });
}
