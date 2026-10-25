import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { checkPrismaConnection, deleteDevSession, recordAuditEvent } from "@/lib/data-store";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    const token = cookieStore.get("gs_session")?.value;

    if (token) {
      const isPg = await checkPrismaConnection();
      if (isPg) {
        try {
          await prisma.session.delete({ where: { token } });
        } catch {
          // ignore
        }
      }
      deleteDevSession(token);
    }

    if (session) {
      recordAuditEvent({
        userId: session.userId,
        userEmail: session.user.email,
        userName: session.user.name || "User",
        action: "USER_LOGOUT",
        details: `User logged out of session (${session.user.email})`,
        resource: "arn:aws:cognito-idp:ap-south-1:userpool/gramstock-users",
        status: "SUCCESS",
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete("gs_session");
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
