import { createHmac, timingSafeEqual } from "node:crypto";

/** Retell signs webhooks with HMAC-SHA256 over rawBody + timestamp, using the API key. */
export function verifyRetellSignature(
  rawBody: string,
  signature: string | null,
  apiKey: string | undefined,
) {
  if (!apiKey || !signature) return false;

  const match = signature.match(/v=(\d+),d=(.*)/);
  if (!match) return false;

  const [, timestamp, digest] = match;
  const age = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(age) || age > 5 * 60 * 1000) return false;

  const expected = createHmac("sha256", apiKey).update(rawBody + timestamp).digest("hex");
  const given = Buffer.from(digest, "hex");
  const wanted = Buffer.from(expected, "hex");
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
