import { NextResponse } from "next/server";

type PilotPayload = {
  name?: unknown;
  businessType?: unknown;
  phone?: unknown;
  email?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => entities[char]);
}

export async function POST(request: Request) {
  let payload: PilotPayload;

  try {
    payload = (await request.json()) as PilotPayload;
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const name = clean(payload.name, 100);
  const businessType = clean(payload.businessType, 100);
  const phone = clean(payload.phone, 40);
  const email = clean(payload.email, 150);

  if (!name || !businessType || !phone || !email) {
    return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Lead notifications are not configured yet. Please email us instead." },
      { status: 503 },
    );
  }

  const message = [
    "🔔 <b>New Ringsure pilot request</b>",
    "",
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Business type:</b> ${escapeHtml(businessType)}`,
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    "",
    `<b>Received:</b> ${new Date().toUTCString()}`,
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      console.error("Telegram notification failed:", response.status);
      return NextResponse.json(
        { error: "We couldn't send your request right now. Please email us instead." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram notification error:", error);
    return NextResponse.json(
      { error: "We couldn't send your request right now. Please email us instead." },
      { status: 502 },
    );
  }
}
