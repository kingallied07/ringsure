import { createHmac, timingSafeEqual } from "node:crypto";

const secret = process.env.CALL_CONTEXT_SECRET?.trim() || "ringsure-dev-call-context-secret";

type ContextPayload = {
  tenantId: string;
  exp: number;
  purpose: "inbound" | "outbound";
  callId?: string;
};

function encode(payload: ContextPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

/** Minted server-side when a call is registered. Never derived from caller input or model output. */
export function mintCallContext(
  tenantId: string,
  purpose: ContextPayload["purpose"] = "inbound",
  callId?: string,
) {
  return encode({ tenantId, purpose, callId, exp: Date.now() + 15 * 60 * 1000 });
}

export function verifyCallContext(token: string | null): ContextPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const givenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (givenBuffer.length !== expectedBuffer.length || !timingSafeEqual(givenBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ContextPayload;
    if (!payload.tenantId || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
