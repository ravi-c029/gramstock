import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseCSV, parseXLSX, analyzeDataset } from "@/lib/import/analyzer";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let fileName = "dataset.csv";
    let fileSize = 0;
    let headers: string[] = [];
    let rows: Record<string, string>[] = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body.sampleFileName) {
        fileName = body.sampleFileName;
        const filePath = path.join(process.cwd(), "public", "samples", fileName);
        if (!fs.existsSync(filePath)) {
          return NextResponse.json(
            { success: false, error: `Sample file ${fileName} not found` },
            { status: 404 }
          );
        }
        const fileContent = fs.readFileSync(filePath, "utf-8");
        fileSize = Buffer.byteLength(fileContent, "utf-8");
        const parsed = await parseCSV(fileContent);
        headers = parsed.headers;
        rows = parsed.rows;
      } else if (body.csvContent) {
        fileName = body.fileName || "custom_data.csv";
        fileSize = Buffer.byteLength(body.csvContent, "utf-8");
        const parsed = await parseCSV(body.csvContent);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        return NextResponse.json(
          { success: false, error: "Missing sampleFileName or csvContent" },
          { status: 400 }
        );
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided in form data" },
          { status: 400 }
        );
      }

      fileName = file.name;
      fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const parsed = parseXLSX(buffer);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        const text = buffer.toString("utf-8");
        const parsed = await parseCSV(text);
        headers = parsed.headers;
        rows = parsed.rows;
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported Content-Type" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "The uploaded dataset is empty or could not be parsed." },
        { status: 400 }
      );
    }

    const analysis = analyzeDataset(headers, rows);

    return NextResponse.json({
      success: true,
      fileName,
      fileSize,
      rowCount: rows.length,
      headers,
      analysis,
      sampleRows: rows.slice(0, 15),
      fullRows: rows, // Send for client preview and validation step
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze dataset" },
      { status: 500 }
    );
  }
}
