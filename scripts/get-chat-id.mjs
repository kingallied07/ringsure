import { readFileSync } from "node:fs";

// Find the chat ID that should receive pilot leads.
// 1. Send any message to your Telegram bot.
// 2. Run `npm run chat-id`.
// 3. Copy the ID into TELEGRAM_CHAT_ID in .env.local (and in Netlify environment variables).

let token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    token = env.match(/^TELEGRAM_BOT_TOKEN=(.*)$/m)?.[1]?.trim();
  } catch {
    // .env.local is optional here; environment variables work too.
  }
}

if (!token) {
  console.error("Set TELEGRAM_BOT_TOKEN in .env.local or in your environment first.");
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = await response.json();

if (!data.ok) {
  console.error(`Telegram error: ${data.description}`);
  process.exit(1);
}

const chats = new Map();

for (const update of data.result) {
  const chat = update.message?.chat ?? update.callback_query?.message?.chat;
  if (!chat) continue;
  const name = [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.title || "Unknown";
  chats.set(chat.id, name);
}

if (chats.size === 0) {
  console.log("No chats found yet. Send a message to your bot, then run this again.");
  process.exit(0);
}

console.log("Chats found — copy the right ID into TELEGRAM_CHAT_ID:\n");
for (const [id, name] of chats) {
  console.log(`${id}  ${name}`);
}
