import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const session = await verifyToken(token)

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Check role-based access
  const path = request.nextUrl.pathname

  if (path.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/employee", request.url))
  }

  if (path.startsWith("/employee") && session.role !== "employee") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*"],
}
