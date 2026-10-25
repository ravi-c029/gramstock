import { NextRequest, NextResponse } from "next/server";
import { getBusinesses, createBusiness, BusinessCategory } from "@/lib/data-store";

import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in.", businesses: [], currentUser: null },
        { status: 401 }
      );
    }
    const isSuperAdmin = session?.user?.email === "admin@gramstock.cloud";
    const ownerId = session?.userId;
    const businesses = await getBusinesses(ownerId, isSuperAdmin);
    return NextResponse.json({
      success: true,
      businesses,
      currentUser: session.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: "Name and Category are required" },
        { status: 400 }
      );
    }

    const business = await createBusiness({
      name: body.name,
      category: body.category as BusinessCategory,
      description: body.description,
      ownerId: body.ownerId || "usr_demo_owner_1",
    });

    return NextResponse.json({
      success: true,
      business,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create business" },
      { status: 500 }
    );
  }
}
