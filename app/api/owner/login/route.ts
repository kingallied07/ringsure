import { NextResponse } from "next/server";
import { createOwnerSession, OWNER_COOKIE, verifyOwnerPassword } from "@/lib/owner/session";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!process.env.OWNER_PASSWORD_HASH?.trim()) {
    return NextResponse.json(
      { error: "Owner password not configured. Set OWNER_PASSWORD_HASH." },
      { status: 503 },
    );
  }

  if (typeof body.password !== "string" || !verifyOwnerPassword(body.password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_COOKIE, createOwnerSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
