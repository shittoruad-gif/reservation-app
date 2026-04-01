import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require auth
  const publicPaths = ["/login", "/register", "/api/auth/login", "/api/auth/register"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Allow public paths
  if (isPublicPath) {
    // Redirect logged-in users away from login/register pages
    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    // API routes return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pages redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
