import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId") || "biz_kirana_1";

    const metrics = await getDashboardMetrics(businessId);
    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
