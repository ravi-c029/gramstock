import { NextRequest, NextResponse } from "next/server";
import { bulkIngestImportData, BusinessCategory, SchemaFieldConfig, createBusiness } from "@/lib/data-store";
import { getStorageAdapter } from "@/lib/storage/adapter";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const ownerId = session?.userId || "usr_demo_owner_1";

    const body = await request.json();
    let {
      businessId,
      newBusinessName,
      schemaId,
      fileName,
      fileSize,
      category,
      rows,
      approvedSchema,
    } = body;

    if (!rows || !Array.isArray(rows) || !approvedSchema) {
      return NextResponse.json(
        { success: false, error: "rows array and approvedSchema are required" },
        { status: 400 }
      );
    }

    // If user requested to create a new dedicated store for this dataset
    if (businessId === "new" || !businessId) {
      const newBiz = await createBusiness({
        name: newBusinessName || `${category.charAt(0) + category.slice(1).toLowerCase()} Boutique`,
        category: category as BusinessCategory,
        description: `Dedicated store created from ${fileName}`,
        ownerId: ownerId,
      });
      businessId = newBiz.id;
    }

    // Persist real cloud backup to Amazon S3
    let s3Url: string | null = null;
    let s3Key: string | null = null;
    try {
      const adapter = getStorageAdapter();
      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        const csvLines = [
          headers.join(","),
          ...rows.map((r) =>
            headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        const uploadRes = await adapter.upload(
          Buffer.from(csvLines, "utf-8"),
          fileName || "dataset.csv",
          "text/csv"
        );
        s3Url = uploadRes.url;
        s3Key = uploadRes.key;
      }
    } catch (s3Err) {
      console.warn("S3 backup attempt logged:", s3Err);
    }

    const result = await bulkIngestImportData({
      businessId,
      schemaId: schemaId || "sch_imported",
      fileName: fileName || "imported_inventory.csv",
      fileSize: fileSize || 0,
      category: (category as BusinessCategory) || "RETAIL",
      rows,
      approvedSchema: approvedSchema as SchemaFieldConfig[],
    });

    return NextResponse.json({
      success: true,
      businessId,
      importedCount: result.importedCount,
      job: result.job,
      s3Url,
      s3Key,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
