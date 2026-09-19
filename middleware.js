import { NextResponse } from "next/server";

// Routes that require user authentication
const PROTECTED_ROUTES = ["/account", "/orders"];

// Routes meant only for unauthenticated users (login, signup, etc.)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get("bsmart_session")?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. If accessing a protected route without session, redirect to login
  if (isProtected && !sessionToken) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If accessing auth routes with valid session, redirect to account dashboard
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
