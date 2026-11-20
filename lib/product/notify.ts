import type { Call } from "./types";

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

export async function notifyLead(call: Call, businessName: string) {
  if (!call.lead) {
    return { sent: false, reason: "No lead captured — nothing to notify" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return { sent: false, reason: "Telegram not configured — mock notification only" };
  }

  const lead = call.lead;
  const message = [
    `🔔 <b>New lead — ${escapeHtml(businessName)}</b>`,
    "",
    `<b>Name:</b> ${escapeHtml(lead.name)}`,
    `<b>Phone:</b> ${escapeHtml(lead.phone)}`,
    `<b>Postcode:</b> ${escapeHtml(lead.postcode || "not captured")}`,
    `<b>Job:</b> ${escapeHtml(lead.jobType)}`,
    `<b>Priority:</b> ${lead.urgency === "urgent" ? "🚨 URGENT" : "Standard"}`,
    `<b>Call:</b> ${call.durationSeconds}s · ${escapeHtml(call.scenario)}`,
    "",
    `<b>Notes:</b> ${escapeHtml(lead.notes || "none")}`,
    `<b>Call ID:</b> ${call.id}`,
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
    return response.ok
      ? { sent: true, reason: "Telegram notification delivered" }
      : { sent: false, reason: `Telegram returned ${response.status}` };
  } catch {
    return { sent: false, reason: "Telegram request failed" };
  }
}
