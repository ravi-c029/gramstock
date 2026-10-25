import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBusinesses } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const isSuperAdmin = session.user.email === "admin@gramstock.cloud";
    const userBusinesses = await getBusinesses(session.userId, isSuperAdmin);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || (isSuperAdmin ? "SUPER_ADMIN" : "STORE_OWNER"),
        businesses: userBusinesses,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
