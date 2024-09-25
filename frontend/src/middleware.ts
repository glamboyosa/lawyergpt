import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasAuthCookie } from "./lib/auth";

export function middleware(request: NextRequest) {
	const userCookie = hasAuthCookie();

	// Check if the current path is not "/auth"
	if (!request.nextUrl.pathname.startsWith("/auth")) {
		if (!userCookie) {
			return NextResponse.redirect(new URL("/auth", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
