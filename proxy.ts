import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normal app traffic — auth guarding
  const sessionCookie = getSessionCookie(request);
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute = pathname.startsWith("/admin");

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
