import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const pathname = req.nextUrl.pathname;
    // console.log("token", token)
    if (token) {
      if (pathname.includes("admin") && token.role !== "ADMIN") {
        // return NextResponse.error();
        return NextResponse.redirect(new URL("/", req.url))
      }

      // Jika Verify utk USER
      if (token.role === "USER") {
        if (pathname === "/auth/login" || pathname === "/auth/signup") {
          return NextResponse.redirect(new URL("/beranda", req.url))
        }
      }
      // Jika Verify utk USER
      if (token.role === "ADMIN") {
        if (pathname === "/auth/login" || pathname === "/auth/signup") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        }
      }
    } else {
      if (pathname !== "/auth/login" && pathname !== "/auth/signup") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/signup", "/admin/:path*", "/beranda/:path*", "/bahanAjar/:path*",],
};
