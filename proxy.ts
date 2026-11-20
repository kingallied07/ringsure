import { NextResponse, type NextRequest } from "next/server";
import { isOwnerRequest } from "@/lib/owner/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The agent calls this with a signed tool token, not a browser session.
  if (pathname === "/api/product/knowledge/search") return NextResponse.next();

  if (isOwnerRequest(request)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const login = new URL("/owner/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/product/:path*"],
};
