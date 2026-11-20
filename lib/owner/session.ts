import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const OWNER_COOKIE = "ringsure_owner";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.OWNER_SESSION_SECRET?.trim() || "ringsure-dev-session-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createOwnerSession() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_TTL, v: 1 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyOwnerSession(token: string | undefined | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export function isOwnerRequest(request: NextRequest) {
  return verifyOwnerSession(request.cookies.get(OWNER_COOKIE)?.value);
}

/** OWNER_PASSWORD_HASH format: scryptSaltHex:hashHex */
export function verifyOwnerPassword(password: string) {
  const stored = process.env.OWNER_PASSWORD_HASH?.trim();
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
