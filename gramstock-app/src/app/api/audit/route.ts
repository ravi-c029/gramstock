import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/data-store";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view audit trail." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const requestedEmail = searchParams.get("email") || undefined;

    const isSuperAdmin = session.user?.email === "admin@gramstock.cloud";

    // Strictly enforce that CloudTrail & RUM telemetry is ONLY accessible by Cloud Super Admin!
    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied (403): AWS CloudTrail & CloudWatch RUM telemetry is strictly restricted to Cloud Super Admin (admin@gramstock.cloud). Regular merchants are isolated to their store inventory.",
        },
        { status: 403 }
      );
    }

    const logs = getAuditLogs({ userEmail: requestedEmail, limit });

    return NextResponse.json({
      success: true,
      totalCount: logs.length,
      logs,
      isSuperAdmin,
      currentActorEmail: session.user.email,
      complianceStatus: {
        soc2Compliance: "ACTIVE",
        awsCloudTrailStatus: "RECORDING_ENABLED",
        region: "ap-south-1",
        encryption: "AES-256-KMS",
        isolationMode: isSuperAdmin ? "SUPER_ADMIN_CROSS_TENANT" : "STRICT_ROW_LEVEL_SILO",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
