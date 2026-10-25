import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("gs_session")?.value;

    if (sessionToken) {
      // Delete the session
      await prisma.session.deleteMany({ where: { token: sessionToken } }).catch(() => {});
    }

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("gs_session");
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("gs_session");
    return response;
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
