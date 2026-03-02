import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedMatchers = [
  /^\/dashboard(?:\/.*)?$/,
  /^\/tasks(?:\/.*)?$/,
  /^\/analytics(?:\/.*)?$/,
  /^\/profile(?:\/.*)?$/,
];

function isProtectedPath(pathname: string) {
  return protectedMatchers.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/analytics/:path*", "/profile/:path*"],
};
