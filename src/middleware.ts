import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/jwtTokenControl";

export const middleware = async (request: NextRequest) => {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === "/login";

  const token = request.cookies.get("authToken")?.value || "";

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/accounts", request.url));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const updatedResponse = await updateSession(request);
  if (updatedResponse) {
    return updatedResponse;
  }
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
