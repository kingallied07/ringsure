import type { CallWindow } from "./store";

const dayNumbers: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function canCallNow(windows: CallWindow[], now = new Date()) {
  const active = windows.find((window) => window.enabled);
  if (!active) {
    return { allowed: false, reason: "No call window configured — set one in the Outreach desk" };
  }

  if (active.notBefore && now.getTime() < new Date(active.notBefore).getTime()) {
    const when = new Date(active.notBefore).toLocaleString("en-GB", {
      timeZone: active.timezone,
      dateStyle: "medium",
      timeStyle: "short",
    });
    return { allowed: false, reason: `Calls begin ${when} ${active.timezone}` };
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: active.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = dayNumbers[value("weekday")] ?? 0;
  const time = `${value("hour")}:${value("minute")}`;

  if (!active.days.includes(day)) {
    return { allowed: false, reason: `Outside allowed days (${active.days.join(", ")})` };
  }
  if (time < active.start || time > active.end) {
    return { allowed: false, reason: `Outside calling hours ${active.start}–${active.end} ${active.timezone}` };
  }

  return { allowed: true, reason: `Inside call window ${active.start}–${active.end}` };
}
