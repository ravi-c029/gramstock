import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  createProduct,
  adjustStock,
  deleteProduct,
  getActiveSchema,
} from "@/lib/data-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId") || "biz_kirana_1";
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = (searchParams.get("status") as any) || "all";

    const [products, schema] = await Promise.all([
      getProducts(businessId, { search, category, status }),
      getActiveSchema(businessId),
    ]);

    return NextResponse.json({
      success: true,
      products,
      schema,
      totalCount: products.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, schemaId, name, quantity, price, costPrice, sku, category, unit, minThreshold, expiryDate, fields } = body;

    if (!businessId || !name || quantity === undefined || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: businessId, name, quantity, price" },
        { status: 400 }
      );
    }

    const product = await createProduct({
      businessId,
      schemaId: schemaId || "sch_default",
      name,
      quantity: Number(quantity),
      price: Number(price),
      costPrice: costPrice !== undefined ? Number(costPrice) : undefined,
      sku,
      category,
      unit,
      minThreshold: minThreshold !== undefined ? Number(minThreshold) : undefined,
      expiryDate,
      fields,
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create item" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, productId, adjustment, reason, notes } = body;

    if (!businessId || !productId || adjustment === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: "businessId, productId, adjustment, and reason are required" },
        { status: 400 }
      );
    }

    const result = await adjustStock({
      businessId,
      productId,
      adjustment: Number(adjustment),
      reason,
      notes,
    });

    return NextResponse.json({
      success: true,
      product: result.product,
      movement: result.movement,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to adjust stock" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const productId = searchParams.get("productId");

    if (!businessId || !productId) {
      return NextResponse.json(
        { success: false, error: "businessId and productId are required" },
        { status: 400 }
      );
    }

    const success = await deleteProduct(businessId, productId);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
