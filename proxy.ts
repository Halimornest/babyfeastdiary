import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return new TextEncoder().encode(
    secret || "babyfeastdiary-secret-key-dev-only"
  );
}

const PROTECTED_PATHS = ["/dashboard", "/onboarding"];
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bfd_token")?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      const secret = getJwtSecret();
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      // invalid token
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/register"],
};
