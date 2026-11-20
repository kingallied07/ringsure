import { createHmac, timingSafeEqual } from "node:crypto";
import type { Brief } from "./brief";

const secret = process.env.CALL_CONTEXT_SECRET?.trim() || "ringsure-dev-call-context-secret";

type CallConfig = { brief: Brief; agentId: string };

function sign(value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

/** Signed config embedded in the Twilio webhook URL so calls don't depend on shared storage. */
export function encodeCallConfig(brief: Brief, agentId: string) {
  const body = Buffer.from(JSON.stringify({ brief, agentId } satisfies CallConfig)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeCallConfig(value: string | null): CallConfig | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CallConfig;
  } catch {
    return null;
  }
}
