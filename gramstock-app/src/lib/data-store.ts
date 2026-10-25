/**
 * GramStock Cloud — Data Store & Repository Layer
 * 
 * Provides unified data access for Businesses, Schemas, Products, Stock Movements,
 * and Import Jobs.
 * 
 * Supports:
 * 1. PostgreSQL via Prisma Client when available.
 * 2. File-backed local store (.data/gramstock-dev.json) in development when PostgreSQL
 *    is not running, ensuring full local autonomy without phantom credentials or crashes.
 * 3. Preloaded sample businesses and datasets across all 5 categories.
 */

import fs from "fs";
import path from "path";
import { prisma } from "./db";

export type BusinessCategory = "GROCERY" | "MEDICAL" | "RESTAURANT" | "GARMENTS" | "RETAIL" | "CUSTOM";

export interface SchemaFieldConfig {
  id: string;
  name: string;
  label: string;
  type: "TEXT" | "INTEGER" | "DECIMAL" | "CURRENCY" | "BOOLEAN" | "DATE" | "DATETIME" | "SELECT";
  required: boolean;
  isIdentifier?: boolean;
  isFilterable?: boolean;
  isAggregatable?: boolean;
  order: number;
  defaultValue?: string | null;
  unit?: string | null;
  options?: string[];
  sourceColumn?: string | null;
}

export interface BusinessRecord {
  id: string;
  name: string;
  category: BusinessCategory;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  businessId: string;
  schemaId: string;
  name: string;
  quantity: number;
  price: number;
  costPrice?: number;
  sku?: string;
  category?: string;
  unit?: string;
  expiryDate?: string;
  minThreshold?: number;
  fields: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementRecord {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  type: "IMPORT_INITIAL" | "MANUAL_ADD" | "MANUAL_REDUCE" | "ADJUSTMENT" | "SALE" | "RETURN" | "DAMAGE" | "EXPIRED";
  quantity: number;
  previousQty: number;
  newQty: number;
  reason?: string;
  notes?: string;
  actorId?: string;
  createdAt: string;
}

export interface BusinessSchemaRecord {
  id: string;
  businessId: string;
  version: number;
  isActive: boolean;
  name: string;
  fields: SchemaFieldConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportJobRecord {
  id: string;
  businessId: string;
  status: "PENDING" | "ANALYZING" | "AWAITING_REVIEW" | "IMPORTING" | "COMPLETED" | "FAILED";
  fileName: string;
  fileSize: number;
  mimeType: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  detectedCategory?: BusinessCategory;
  suggestedSchema?: any;
  approvedSchema?: any;
  errorSummary?: any;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role?: "STORE_OWNER" | "SUPER_ADMIN";
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  action:
    | "USER_LOGIN"
    | "USER_SIGNUP"
    | "USER_LOGOUT"
    | "IMPORT_DATASET"
    | "CREATE_PRODUCT"
    | "ADJUST_STOCK"
    | "DELETE_PRODUCT"
    | "SCHEMA_UPDATE";
  category?: BusinessCategory;
  businessId?: string;
  businessName?: string;
  details: string;
  resource?: string;
  status: "SUCCESS" | "FAILURE";
  latencyMs?: number;
  ipAddress?: string;
  cloudTrailEventId: string;
}

interface DevDatabaseState {
  users: UserRecord[];
  sessions: SessionRecord[];
  auditLogs: AuditLogRecord[];
  businesses: BusinessRecord[];
  schemas: BusinessSchemaRecord[];
  products: ProductRecord[];
  movements: StockMovementRecord[];
  importJobs: ImportJobRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DEV_DB_PATH = path.join(DATA_DIR, "gramstock-dev.json");

// In-memory cache + file sync
let devDbCache: DevDatabaseState | null = null;
import net from "net";

const globalForPrismaState = globalThis as unknown as {
  __gramstock_isPrismaAvailable?: boolean;
};

export async function checkPrismaConnection(): Promise<boolean> {
  if (typeof globalForPrismaState.__gramstock_isPrismaAvailable === "boolean") {
    return globalForPrismaState.__gramstock_isPrismaAvailable;
  }

  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) {
    globalForPrismaState.__gramstock_isPrismaAvailable = false;
    return false;
  }

  try {
    const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
    if (isLocal) {
      // Fast 150ms non-blocking TCP socket probe to port 5432
      const portMatch = dbUrl.match(/:(\d+)\//);
      const port = portMatch ? parseInt(portMatch[1], 10) : 5432;

      const isOpen = await new Promise<boolean>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(150);
        socket.once("connect", () => {
          socket.destroy();
          resolve(true);
        });
        socket.once("timeout", () => {
          socket.destroy();
          resolve(false);
        });
        socket.once("error", () => {
          socket.destroy();
          resolve(false);
        });
        socket.connect(port, "127.0.0.1");
      });

      if (!isOpen) {
        globalForPrismaState.__gramstock_isPrismaAvailable = false;
        return false;
      }
    }

    // Attempt lightweight query with 400ms timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 400)),
    ]);
    globalForPrismaState.__gramstock_isPrismaAvailable = true;
    return true;
  } catch {
    globalForPrismaState.__gramstock_isPrismaAvailable = false;
    return false;
  }
}

export function getStorageMode(): { mode: "prisma" | "local_dev"; description: string } {
  if (globalForPrismaState.__gramstock_isPrismaAvailable) {
    return { mode: "prisma", description: "PostgreSQL Database Connected" };
  }
  return { mode: "local_dev", description: "Local File-Backed Development Store (.data/)" };
}

function loadDevDatabase(): DevDatabaseState {
  if (devDbCache) return devDbCache;

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }

  if (fs.existsSync(DEV_DB_PATH)) {
    try {
      const raw = fs.readFileSync(DEV_DB_PATH, "utf-8");
      devDbCache = JSON.parse(raw);
      return devDbCache!;
    } catch {
      // parse error, fallback to seed
    }
  }

  devDbCache = buildInitialSeedData();
  saveDevDatabase(devDbCache);
  return devDbCache;
}

function saveDevDatabase(state: DevDatabaseState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DEV_DB_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist dev database to disk:", err);
  }
}

function buildInitialSeedData(): DevDatabaseState {
  const defaultOwnerId = "usr_demo_owner_1";
  const now = new Date().toISOString();

  // 1. Kirana Store
  const bizKirana: BusinessRecord = {
    id: "biz_kirana_1",
    name: "Gupta Super Kirana",
    category: "GROCERY",
    description: "Daily essentials, staples, spices, and packaged food",
    ownerId: "usr_kirana",
    createdAt: now,
    updatedAt: now,
  };

  const schemaKirana: BusinessSchemaRecord = {
    id: "sch_kirana_1",
    businessId: bizKirana.id,
    version: 1,
    isActive: true,
    name: "Kirana Schema v1",
    fields: [
      { id: "f1", name: "name", label: "Product Name", type: "TEXT", required: true, order: 0 },
      { id: "f2", name: "category", label: "Category", type: "SELECT", required: false, order: 1, options: ["Staples", "Pulses", "Oils", "Dairy", "Spices", "Packaged Food", "Beverages", "Household"] },
      { id: "f3", name: "quantity", label: "Quantity In Stock", type: "DECIMAL", required: true, order: 2, unit: "units" },
      { id: "f4", name: "unit", label: "Packaging Unit", type: "TEXT", required: false, order: 3 },
      { id: "f5", name: "costPrice", label: "Cost Price (₹)", type: "CURRENCY", required: false, order: 4 },
      { id: "f6", name: "price", label: "Selling Price (₹)", type: "CURRENCY", required: true, order: 5 },
      { id: "f7", name: "barcode", label: "Barcode / EAN", type: "TEXT", required: false, isIdentifier: true, order: 6 },
      { id: "f8", name: "minThreshold", label: "Min Stock Alert", type: "INTEGER", required: false, order: 7 },
      { id: "f9", name: "supplier", label: "Primary Supplier", type: "TEXT", required: false, order: 8 },
      { id: "f10", name: "expiryDate", label: "Best Before / Expiry", type: "DATE", required: false, order: 9 },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const productsKirana: ProductRecord[] = [
    {
      id: "prod_k1",
      businessId: bizKirana.id,
      schemaId: schemaKirana.id,
      name: "Aashirvaad Shudh Chakki Atta 10kg",
      category: "Staples",
      quantity: 45,
      price: 440,
      costPrice: 390,
      unit: "bag",
      minThreshold: 10,
      expiryDate: "2027-02-15",
      fields: { barcode: "8901030383123", supplier: "ITC Ltd" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_k2",
      businessId: bizKirana.id,
      schemaId: schemaKirana.id,
      name: "Daawat Rozana Super Basmati Rice 5kg",
      category: "Staples",
      quantity: 8, // Low stock!
      price: 399,
      costPrice: 340,
      unit: "bag",
      minThreshold: 15,
      expiryDate: "2027-05-30",
      fields: { barcode: "8901537001021", supplier: "LT Foods" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_k3",
      businessId: bizKirana.id,
      schemaId: schemaKirana.id,
      name: "Tata Sampann Toor Dal 1kg",
      category: "Pulses",
      quantity: 85,
      price: 175,
      costPrice: 145,
      unit: "kg",
      minThreshold: 20,
      expiryDate: "2026-12-31",
      fields: { barcode: "8901052028712", supplier: "Tata Consumer" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_k4",
      businessId: bizKirana.id,
      schemaId: schemaKirana.id,
      name: "Fortune Sunlite Refined Sunflower Oil 1L",
      category: "Oils",
      quantity: 120,
      price: 135,
      costPrice: 110,
      unit: "pouch",
      minThreshold: 25,
      expiryDate: "2027-04-10",
      fields: { barcode: "8906007281001", supplier: "Adani Wilmar" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_k5",
      businessId: bizKirana.id,
      schemaId: schemaKirana.id,
      name: "Amul Pasteurized Butter 500g",
      category: "Dairy",
      quantity: 0, // Out of stock!
      price: 275,
      costPrice: 240,
      unit: "pack",
      minThreshold: 15,
      expiryDate: "2026-11-20",
      fields: { barcode: "8901262010052", supplier: "GCMMF Amul" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_k6",
      businessId: bizKirana.id,
      schemaId: schemaKirana.id,
      name: "Maggi 2-Minute Masala Noodles 70g",
      category: "Packaged Food",
      quantity: 250,
      price: 14,
      costPrice: 11.5,
      unit: "packet",
      minThreshold: 50,
      expiryDate: "2027-01-10",
      fields: { barcode: "8901058852304", supplier: "Nestle India" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_k7",
      businessId: bizKirana.id,
      schemaId: schemaKirana.id,
      name: "Britannia Good Day Butter Cookies 200g",
      category: "Packaged Food",
      quantity: 110,
      price: 40,
      costPrice: 32,
      unit: "pack",
      minThreshold: 25,
      expiryDate: "2026-12-15",
      fields: { barcode: "8901063012014", supplier: "Britannia" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 2. Pharmacy Store
  const bizPharmacy: BusinessRecord = {
    id: "biz_pharmacy_2",
    name: "Apollo Medico Pharmacy",
    category: "MEDICAL",
    description: "Prescription drugs, generic formulations, OTC products, medical devices",
    ownerId: "usr_pharmacy",
    createdAt: now,
    updatedAt: now,
  };

  const schemaPharmacy: BusinessSchemaRecord = {
    id: "sch_pharmacy_2",
    businessId: bizPharmacy.id,
    version: 1,
    isActive: true,
    name: "Pharmacy Schema v1",
    fields: [
      { id: "fp1", name: "name", label: "Medicine / Item Name", type: "TEXT", required: true, order: 0 },
      { id: "fp2", name: "genericComposition", label: "Generic Composition", type: "TEXT", required: false, order: 1 },
      { id: "fp3", name: "batchNo", label: "Batch Number", type: "TEXT", required: true, isIdentifier: true, order: 2 },
      { id: "fp4", name: "quantity", label: "Quantity In Stock", type: "INTEGER", required: true, order: 3 },
      { id: "fp5", name: "unit", label: "Unit", type: "TEXT", required: false, order: 4 },
      { id: "fp6", name: "costPrice", label: "Purchase Rate (₹)", type: "CURRENCY", required: false, order: 5 },
      { id: "fp7", name: "price", label: "MRP (₹)", type: "CURRENCY", required: true, order: 6 },
      { id: "fp8", name: "manufacturer", label: "Manufacturer", type: "TEXT", required: false, order: 7 },
      { id: "fp9", name: "expiryDate", label: "Expiry Date", type: "DATE", required: true, order: 8 },
      { id: "fp10", name: "scheduleH", label: "Schedule H Prescription", type: "BOOLEAN", required: false, order: 9 },
      { id: "fp11", name: "rackLocation", label: "Rack / Shelf", type: "TEXT", required: false, order: 10 },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const productsPharmacy: ProductRecord[] = [
    {
      id: "prod_p1",
      businessId: bizPharmacy.id,
      schemaId: schemaPharmacy.id,
      name: "Dolo 650mg Tablet",
      category: "Antipyretic",
      quantity: 450,
      price: 33.5,
      costPrice: 24.0,
      unit: "strip",
      expiryDate: "2027-09-30",
      fields: { genericComposition: "Paracetamol 650mg", batchNo: "DL8821", manufacturer: "Micro Labs", scheduleH: false, rackLocation: "RACK-A1" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_p2",
      businessId: bizPharmacy.id,
      schemaId: schemaPharmacy.id,
      name: "Augmentin 625 Duo",
      category: "Antibiotic",
      quantity: 14, // Low stock & expiring in 2 months
      price: 204.5,
      costPrice: 155.0,
      unit: "strip",
      expiryDate: "2026-12-15",
      fields: { genericComposition: "Amoxicillin + Clavulanic Acid", batchNo: "AG1042", manufacturer: "GSK", scheduleH: true, rackLocation: "RACK-B2" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_p3",
      businessId: bizPharmacy.id,
      schemaId: schemaPharmacy.id,
      name: "Cetirizine 10mg Strip",
      category: "Antiallergic",
      quantity: 300,
      price: 18.0,
      costPrice: 9.5,
      unit: "strip",
      expiryDate: "2027-11-20",
      fields: { genericComposition: "Cetirizine Hydrochloride", batchNo: "CT9014", manufacturer: "Cipla", scheduleH: false, rackLocation: "RACK-A3" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_p4",
      businessId: bizPharmacy.id,
      schemaId: schemaPharmacy.id,
      name: "Azithral 500mg",
      category: "Antibiotic",
      quantity: 120,
      price: 119.0,
      costPrice: 88.0,
      unit: "strip",
      expiryDate: "2027-04-15",
      fields: { genericComposition: "Azithromycin 500mg", batchNo: "AZ4421", manufacturer: "Alembic", scheduleH: true, rackLocation: "RACK-B1" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_p5",
      businessId: bizPharmacy.id,
      schemaId: schemaPharmacy.id,
      name: "Benadryl Cough Syrup 100ml",
      category: "Cough & Cold",
      quantity: 5, // Low stock and expiring in 10 days!
      price: 125.0,
      costPrice: 92.0,
      unit: "bottle",
      expiryDate: "2026-11-01",
      fields: { genericComposition: "Diphenhydramine + Ammonium Chloride", batchNo: "BN3301", manufacturer: "Johnson & Johnson", scheduleH: false, rackLocation: "RACK-C1" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_p6",
      businessId: bizPharmacy.id,
      schemaId: schemaPharmacy.id,
      name: "Volini Pain Relief Gel 50g",
      category: "Pain Relief",
      quantity: 90,
      price: 165.0,
      costPrice: 122.0,
      unit: "tube",
      expiryDate: "2027-05-15",
      fields: { genericComposition: "Diclofenac Diethylamine", batchNo: "VL8811", manufacturer: "Sun Pharma", scheduleH: false, rackLocation: "RACK-C2" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 3. Restaurant / Cafe
  const bizRestaurant: BusinessRecord = {
    id: "biz_restaurant_3",
    name: "The Green Bistro & Cafe",
    category: "RESTAURANT",
    description: "Culinary ingredients, fresh dairy, perishables, and beverage supplies",
    ownerId: "usr_restaurant",
    createdAt: now,
    updatedAt: now,
  };

  const schemaRestaurant: BusinessSchemaRecord = {
    id: "sch_restaurant_3",
    businessId: bizRestaurant.id,
    version: 1,
    isActive: true,
    name: "Kitchen & Pantry Schema v1",
    fields: [
      { id: "fr1", name: "name", label: "Ingredient Name", type: "TEXT", required: true, order: 0 },
      { id: "fr2", name: "category", label: "Kitchen Station", type: "SELECT", required: false, order: 1, options: ["Barista", "Dairy", "Produce", "Pantry", "Meat", "Bakery"] },
      { id: "fr3", name: "quantity", label: "Current Stock", type: "DECIMAL", required: true, order: 2 },
      { id: "fr4", name: "unit", label: "Unit (kg/L/can/pc)", type: "TEXT", required: true, order: 3 },
      { id: "fr5", name: "price", label: "Cost Per Unit (₹)", type: "CURRENCY", required: true, order: 4 },
      { id: "fr6", name: "minThreshold", label: "Prep Par Level", type: "DECIMAL", required: false, order: 5 },
      { id: "fr7", name: "perishable", label: "Perishable Item", type: "BOOLEAN", required: true, order: 6 },
      { id: "fr8", name: "shelfLifeDays", label: "Shelf Life (Days)", type: "INTEGER", required: false, order: 7 },
      { id: "fr9", name: "storageLocation", label: "Cold Room / Shelf", type: "TEXT", required: false, order: 8 },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const productsRestaurant: ProductRecord[] = [
    {
      id: "prod_r1",
      businessId: bizRestaurant.id,
      schemaId: schemaRestaurant.id,
      name: "Espresso Coffee Beans Arabica",
      category: "Barista",
      quantity: 18.5,
      price: 850.0,
      costPrice: 850.0,
      unit: "kg",
      minThreshold: 5.0,
      fields: { perishable: false, shelfLifeDays: 180, storageLocation: "Dry Pantry Shelf 2" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_r2",
      businessId: bizRestaurant.id,
      schemaId: schemaRestaurant.id,
      name: "Full Cream Fresh Milk",
      category: "Dairy",
      quantity: 42.0,
      price: 66.0,
      costPrice: 66.0,
      unit: "liter",
      minThreshold: 15.0,
      fields: { perishable: true, shelfLifeDays: 3, storageLocation: "Walk-in Chiller" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_r3",
      businessId: bizRestaurant.id,
      schemaId: schemaRestaurant.id,
      name: "Mozzarella Cheese Block",
      category: "Dairy",
      quantity: 4.5, // Below prep threshold 8.0!
      price: 420.0,
      costPrice: 420.0,
      unit: "kg",
      minThreshold: 8.0,
      fields: { perishable: true, shelfLifeDays: 21, storageLocation: "Walk-in Chiller" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_r4",
      businessId: bizRestaurant.id,
      schemaId: schemaRestaurant.id,
      name: "Fresh Basil Leaves",
      category: "Produce",
      quantity: 0.8, // Low!
      price: 280.0,
      costPrice: 280.0,
      unit: "kg",
      minThreshold: 1.0,
      fields: { perishable: true, shelfLifeDays: 4, storageLocation: "Produce Cooler" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 4. Garments Store
  const bizGarments: BusinessRecord = {
    id: "biz_garments_4",
    name: "Urban Threads Apparel",
    category: "GARMENTS",
    description: "Contemporary fashion, denim, apparel, accessories and seasonal styles",
    ownerId: "usr_garments",
    createdAt: now,
    updatedAt: now,
  };

  const schemaGarments: BusinessSchemaRecord = {
    id: "sch_garments_4",
    businessId: bizGarments.id,
    version: 1,
    isActive: true,
    name: "Fashion Apparel Schema v1",
    fields: [
      { id: "fg1", name: "name", label: "Product Title", type: "TEXT", required: true, order: 0 },
      { id: "fg2", name: "sku", label: "SKU Code", type: "TEXT", required: true, isIdentifier: true, order: 1 },
      { id: "fg3", name: "category", label: "Apparel Category", type: "SELECT", required: false, order: 2, options: ["Tops", "Bottoms", "Shirts", "Dresses", "Knitwear", "Accessories"] },
      { id: "fg4", name: "size", label: "Size (S/M/L/XL/Waist)", type: "TEXT", required: true, order: 3 },
      { id: "fg5", name: "color", label: "Color / Shade", type: "TEXT", required: true, order: 4 },
      { id: "fg6", name: "quantity", label: "Stock Units", type: "INTEGER", required: true, order: 5 },
      { id: "fg7", name: "costPrice", label: "Cost (₹)", type: "CURRENCY", required: false, order: 6 },
      { id: "fg8", name: "price", label: "Retail Price (₹)", type: "CURRENCY", required: true, order: 7 },
      { id: "fg9", name: "fabric", label: "Fabric Material", type: "TEXT", required: false, order: 8 },
      { id: "fg10", name: "gender", label: "Target Gender", type: "SELECT", required: false, order: 9, options: ["Men", "Women", "Unisex", "Kids"] },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const productsGarments: ProductRecord[] = [
    {
      id: "prod_g1",
      businessId: bizGarments.id,
      schemaId: schemaGarments.id,
      name: "Oversized Heavy Cotton Tee",
      sku: "TSH-BLK-L",
      category: "Tops",
      quantity: 65,
      price: 799.0,
      costPrice: 320.0,
      fields: { size: "L", color: "Jet Black", fabric: "100% Combed Cotton", gender: "Unisex" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_g2",
      businessId: bizGarments.id,
      schemaId: schemaGarments.id,
      name: "Slim Tapered Selvedge Denim",
      sku: "DNM-IND-32",
      category: "Bottoms",
      quantity: 30,
      price: 1899.0,
      costPrice: 850.0,
      fields: { size: "32", color: "Raw Indigo", fabric: "13oz Cotton Denim", gender: "Men" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_g3",
      businessId: bizGarments.id,
      schemaId: schemaGarments.id,
      name: "Pure Linen Casual Shirt",
      sku: "LNN-SGE-M",
      category: "Shirts",
      quantity: 6, // Low stock
      price: 1499.0,
      costPrice: 620.0,
      fields: { size: "M", color: "Sage Green", fabric: "French Linen", gender: "Men" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_g4",
      businessId: bizGarments.id,
      schemaId: schemaGarments.id,
      name: "Floral Tiered Midi Dress",
      sku: "DRS-YLW-M",
      category: "Dresses",
      quantity: 28,
      price: 1999.0,
      costPrice: 780.0,
      fields: { size: "M", color: "Sunflower Yellow", fabric: "Viscose Crepe", gender: "Women" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_g5",
      businessId: bizGarments.id,
      schemaId: schemaGarments.id,
      name: "Merino Wool Crewneck Sweater",
      sku: "SWT-NVY-L",
      category: "Knitwear",
      quantity: 15,
      price: 2799.0,
      costPrice: 1150.0,
      fields: { size: "L", color: "Midnight Navy", fabric: "100% Australian Merino", gender: "Unisex" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_g6",
      businessId: bizGarments.id,
      schemaId: schemaGarments.id,
      name: "Relaxed Cargo Chino Pants",
      sku: "CRG-KHK-32",
      category: "Bottoms",
      quantity: 38,
      price: 1599.0,
      costPrice: 680.0,
      fields: { size: "32", color: "Dust Khaki", fabric: "Cotton Twill Stretch", gender: "Men" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod_g7",
      businessId: bizGarments.id,
      schemaId: schemaGarments.id,
      name: "Seamless Workout Leggings",
      sku: "LGG-BLK-S",
      category: "Activewear",
      quantity: 50,
      price: 1199.0,
      costPrice: 450.0,
      fields: { size: "S", color: "Charcoal Black", fabric: "Nylon Spandex Blend", gender: "Women" },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Initial movements
  const movements: StockMovementRecord[] = [
    {
      id: "mov_1",
      businessId: bizKirana.id,
      productId: "prod_k1",
      productName: "Aashirvaad Shudh Chakki Atta 10kg",
      type: "IMPORT_INITIAL",
      quantity: 45,
      previousQty: 0,
      newQty: 45,
      reason: "Initial dataset ingestion",
      createdAt: now,
    },
    {
      id: "mov_2",
      businessId: bizKirana.id,
      productId: "prod_k2",
      productName: "Daawat Rozana Super Basmati Rice 5kg",
      type: "SALE",
      quantity: 5,
      previousQty: 13,
      newQty: 8,
      reason: "Store counter checkout #4102",
      createdAt: now,
    },
    {
      id: "mov_3",
      businessId: bizPharmacy.id,
      productId: "prod_p2",
      productName: "Augmentin 625 Duo",
      type: "ADJUSTMENT",
      quantity: 2,
      previousQty: 16,
      newQty: 14,
      reason: "Dispensed on Prescription #RX-9921",
      createdAt: now,
    },
  ];

  return {
    users: [
      {
        id: "usr_kirana",
        email: "gupta@kirana.cloud",
        name: "Gupta Ji",
        passwordHash: "$2b$10$MW1gcE1pX9jUr4rLKFTN8OvBEZMes.HfpmnUJlGN8ZKVIUXAJDO4e", // Kirana@2026
        role: "STORE_OWNER",
        createdAt: now,
      },
      {
        id: "usr_pharmacy",
        email: "apollo@pharmacy.cloud",
        name: "Dr. Apollo",
        passwordHash: "$2b$10$XQvZdgIovNq1OBLwUV4qLuK9.mcPrPJIq3p1kcG4zRQQuNM9w8c1K", // Pharmacy@2026
        role: "STORE_OWNER",
        createdAt: now,
      },
      {
        id: "usr_garments",
        email: "urban@threads.cloud",
        name: "Vikram Threads",
        passwordHash: "$2b$10$zHtCWYfLtrcc024w05x7duWqsYxrGbP92yC/G0UWFY0NIrZ6j1p/O", // Garments@2026
        role: "STORE_OWNER",
        createdAt: now,
      },
      {
        id: "usr_restaurant",
        email: "bistro@cafe.cloud",
        name: "Chef Marco",
        passwordHash: "$2b$10$0IGg14gwdRq/eoLiKhYwdua7L7GEbIiFY0CKUDk1kQFkyS/PcV/MS", // Bistro@2026
        role: "STORE_OWNER",
        createdAt: now,
      },
      {
        id: "usr_admin",
        email: "admin@gramstock.cloud",
        name: "Cloud Architect Admin",
        passwordHash: "$2b$10$Z2Xf0Dxl8PaE1Qb6IS58nu1Q4mRb9dEqXDzxYLdWBgJjFCjixdAsu", // Admin@2026
        role: "SUPER_ADMIN",
        createdAt: now,
      },
      {
        id: "usr_fresh_demo",
        email: "new@merchant.cloud",
        name: "Aakash Verma",
        passwordHash: "$2b$10$9giLfqdv8yQ3MBrPn11.eOrBwQqF5hMwK08mE82au9cgwd59NrA5W", // New@2026
        role: "STORE_OWNER",
        createdAt: now,
      },
    ],
    sessions: [],
    auditLogs: [
      {
        id: "evt_init_1",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        userId: "usr_kirana",
        userEmail: "gupta@kirana.cloud",
        userName: "Gupta Ji",
        action: "IMPORT_DATASET",
        category: "GROCERY",
        businessId: "biz_kirana_1",
        businessName: "Gupta Super Kirana",
        details: "Auto-ingested kirana_inventory_sample.csv (7 items) with Amazon S3 cloud backup",
        resource: "s3://gramstock-cloud-dataset-2026/uploads/kirana_inventory_sample.csv",
        status: "SUCCESS",
        latencyMs: 242,
        ipAddress: "103.211.54.12",
        cloudTrailEventId: "arn:aws:cloudtrail:ap-south-1:9920148:event/881a-49bf",
      },
      {
        id: "evt_init_2",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        userId: "usr_pharmacy",
        userEmail: "apollo@pharmacy.cloud",
        userName: "Dr. Apollo",
        action: "CREATE_PRODUCT",
        category: "MEDICAL",
        businessId: "biz_pharmacy_2",
        businessName: "Apollo Medico Pharmacy",
        details: "Created Volini Pain Relief Gel 50g with Batch VL8811 & Expiry 2027-05-15",
        resource: "prod_p6",
        status: "SUCCESS",
        latencyMs: 84,
        ipAddress: "49.36.120.88",
        cloudTrailEventId: "arn:aws:cloudtrail:ap-south-1:9920148:event/992c-55fa",
      },
      {
        id: "evt_init_3",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: "usr_garments",
        userEmail: "urban@threads.cloud",
        userName: "Vikram Threads",
        action: "ADJUST_STOCK",
        category: "GARMENTS",
        businessId: "biz_garments_4",
        businessName: "Urban Threads Apparel",
        details: "Restocked Pure Linen Casual Shirt (+5 units)",
        resource: "prod_g3",
        status: "SUCCESS",
        latencyMs: 65,
        ipAddress: "122.161.42.19",
        cloudTrailEventId: "arn:aws:cloudtrail:ap-south-1:9920148:event/774d-11aa",
      },
      {
        id: "evt_init_4",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        userId: "usr_admin",
        userEmail: "admin@gramstock.cloud",
        userName: "Cloud Architect Admin",
        action: "USER_LOGIN",
        details: "Admin authenticated via AWS Cognito JWT provider from Mumbai ap-south-1 console",
        status: "SUCCESS",
        latencyMs: 110,
        ipAddress: "103.44.18.91",
        cloudTrailEventId: "arn:aws:cloudtrail:ap-south-1:9920148:event/331f-00ee",
      },
    ],
    businesses: [bizKirana, bizPharmacy, bizRestaurant, bizGarments],
    schemas: [schemaKirana, schemaPharmacy, schemaRestaurant, schemaGarments],
    products: [...productsKirana, ...productsPharmacy, ...productsRestaurant, ...productsGarments],
    movements,
    importJobs: [
      {
        id: "job_init_kirana",
        businessId: bizKirana.id,
        status: "COMPLETED",
        fileName: "kirana_inventory_sample.csv",
        fileSize: 1042,
        mimeType: "text/csv",
        totalRows: 12,
        validRows: 12,
        invalidRows: 0,
        importedRows: 6,
        detectedCategory: "GROCERY",
        createdAt: now,
      },
    ],
  };
}

// ==============================================================================
// PUBLIC REPOSITORY API
// ==============================================================================

export async function getBusinesses(ownerId?: string, isSuperAdmin?: boolean): Promise<BusinessRecord[]> {
  const isPg = await checkPrismaConnection();
  if (isPg) {
    try {
      const records = await prisma.business.findMany({
        where: ownerId && !isSuperAdmin ? { ownerId } : undefined,
        orderBy: { createdAt: "desc" },
      });
      return records.map((b: any) => ({
        id: b.id,
        name: b.name,
        category: b.category as BusinessCategory,
        description: b.description || undefined,
        ownerId: b.ownerId,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("Prisma getBusinesses fallback to local store:", err);
    }
  }

  const db = loadDevDatabase();
  if (isSuperAdmin) return db.businesses;
  if (ownerId) return db.businesses.filter((b) => b.ownerId === ownerId);
  return [];
}

// ==============================================================================
// AUTH & AUDIT LOG REPOSITORY
// ==============================================================================

export function findDevUserByEmail(email: string): UserRecord | null {
  const db = loadDevDatabase();
  const normalized = email.toLowerCase().trim();
  const direct = db.users.find((u) => u.email.toLowerCase() === normalized);
  if (direct) return direct;
  if (
    normalized === "apollo@medico.cloud" ||
    normalized === "apollo@pharmacy.cloud" ||
    normalized === "dr.rajesh@apollomedico.in"
  ) {
    return db.users.find((u) => u.id === "usr_pharmacy") || null;
  }
  return null;
}

export function findDevUserById(id: string): UserRecord | null {
  const db = loadDevDatabase();
  return db.users.find((u) => u.id === id) || null;
}

export function createDevUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "STORE_OWNER" | "SUPER_ADMIN";
}): UserRecord {
  const db = loadDevDatabase();
  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name,
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    role: data.role || "STORE_OWNER",
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDevDatabase(db);
  return newUser;
}

export function createDevSession(userId: string, token: string, expiresAt: Date): SessionRecord {
  const db = loadDevDatabase();
  if (!db.sessions) db.sessions = [];
  const session: SessionRecord = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    token,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  };
  db.sessions.push(session);
  saveDevDatabase(db);
  return session;
}

export function getDevSession(token: string): { userId: string; user: { id: string; name: string; email: string; role?: string } } | null {
  const db = loadDevDatabase();
  if (!db.sessions) return null;
  const sess = db.sessions.find((s) => s.token === token);
  if (!sess) return null;
  if (new Date(sess.expiresAt) < new Date()) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDevDatabase(db);
    return null;
  }
  const user = db.users.find((u) => u.id === sess.userId);
  if (!user) return null;
  return {
    userId: user.id,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export function deleteDevSession(token: string): void {
  const db = loadDevDatabase();
  if (!db.sessions) return;
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDevDatabase(db);
}

export function recordAuditEvent(event: {
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditLogRecord["action"];
  category?: BusinessCategory;
  businessId?: string;
  businessName?: string;
  details: string;
  resource?: string;
  status: "SUCCESS" | "FAILURE";
  latencyMs?: number;
  ipAddress?: string;
  cloudTrailEventId?: string;
}): AuditLogRecord {
  const db = loadDevDatabase();
  if (!db.auditLogs) db.auditLogs = [];
  const record: AuditLogRecord = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    cloudTrailEventId:
      event.cloudTrailEventId ||
      `arn:aws:cloudtrail:ap-south-1:9920148:event/${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`,
    ...event,
  };
  db.auditLogs.unshift(record);
  saveDevDatabase(db);
  return record;
}

export function getAuditLogs(options?: { userEmail?: string; limit?: number }): AuditLogRecord[] {
  const db = loadDevDatabase();
  let list = db.auditLogs || [];
  if (options?.userEmail) {
    list = list.filter((e) => e.userEmail.toLowerCase() === options.userEmail!.toLowerCase());
  }
  return list.slice(0, options?.limit || 50);
}

export async function getBusinessById(id: string): Promise<BusinessRecord | null> {
  const isPg = await checkPrismaConnection();
  if (isPg) {
    try {
      const b = await prisma.business.findUnique({ where: { id } });
      if (b) {
        return {
          id: b.id,
          name: b.name,
          category: b.category as BusinessCategory,
          description: b.description || undefined,
          ownerId: b.ownerId,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("Prisma getBusinessById fallback to local store:", err);
    }
  }

  const db = loadDevDatabase();
  return db.businesses.find((b) => b.id === id) || null;
}

export async function createBusiness(data: {
  name: string;
  category: BusinessCategory;
  description?: string;
  ownerId: string;
}): Promise<BusinessRecord> {
  const isPg = await checkPrismaConnection();
  if (isPg) {
    try {
      const b = await prisma.business.create({
        data: {
          name: data.name,
          category: data.category as any,
          description: data.description,
          ownerId: data.ownerId,
        },
      });
      return {
        id: b.id,
        name: b.name,
        category: b.category as BusinessCategory,
        description: b.description || undefined,
        ownerId: b.ownerId,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma createBusiness fallback to local store:", err);
    }
  }

  const db = loadDevDatabase();
  const now = new Date().toISOString();
  const newBiz: BusinessRecord = {
    id: `biz_${Date.now()}`,
    name: data.name,
    category: data.category,
    description: data.description,
    ownerId: data.ownerId,
    createdAt: now,
    updatedAt: now,
  };
  db.businesses.unshift(newBiz);
  saveDevDatabase(db);
  return newBiz;
}

export async function getActiveSchema(businessId: string): Promise<BusinessSchemaRecord | null> {
  const isPg = await checkPrismaConnection();
  if (isPg) {
    try {
      const s = await prisma.businessSchema.findFirst({
        where: { businessId, isActive: true },
        include: { fields: { orderBy: { order: "asc" } } },
      });
      if (s) {
        return {
          id: s.id,
          businessId: s.businessId,
          version: s.version,
          isActive: s.isActive,
          name: s.name,
          fields: s.fields.map((f: any) => ({
            id: f.id,
            name: f.name,
            label: f.label,
            type: f.type as any,
            required: f.required,
            isIdentifier: f.isIdentifier,
            isFilterable: f.isFilterable,
            isAggregatable: f.isAggregatable,
            order: f.order,
            defaultValue: f.defaultValue,
            unit: f.unit,
            options: f.options,
            sourceColumn: f.sourceColumn,
          })),
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("Prisma getActiveSchema fallback to local store:", err);
    }
  }

  const db = loadDevDatabase();
  return db.schemas.find((s) => s.businessId === businessId && s.isActive) || null;
}

export async function saveSchema(
  businessId: string,
  schemaData: { name: string; fields: SchemaFieldConfig[] }
): Promise<BusinessSchemaRecord> {
  const isPg = await checkPrismaConnection();
  if (isPg) {
    try {
      // Deactivate older schemas
      await prisma.businessSchema.updateMany({
        where: { businessId },
        data: { isActive: false },
      });
      const created = await prisma.businessSchema.create({
        data: {
          businessId,
          name: schemaData.name,
          isActive: true,
          version: 1,
          fields: {
            create: schemaData.fields.map((f, i) => ({
              name: f.name,
              label: f.label,
              type: f.type as any,
              required: f.required ?? false,
              isIdentifier: f.isIdentifier ?? false,
              isFilterable: f.isFilterable ?? false,
              isAggregatable: f.isAggregatable ?? false,
              order: i,
              defaultValue: f.defaultValue,
              unit: f.unit,
              options: f.options ?? [],
              sourceColumn: f.sourceColumn,
            })),
          },
        },
        include: { fields: { orderBy: { order: "asc" } } },
      });
      return {
        id: created.id,
        businessId: created.businessId,
        version: created.version,
        isActive: created.isActive,
        name: created.name,
        fields: created.fields.map((f: any) => ({
          id: f.id,
          name: f.name,
          label: f.label,
          type: f.type as any,
          required: f.required,
          isIdentifier: f.isIdentifier,
          isFilterable: f.isFilterable,
          isAggregatable: f.isAggregatable,
          order: f.order,
          defaultValue: f.defaultValue,
          unit: f.unit,
          options: f.options,
          sourceColumn: f.sourceColumn,
        })),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma saveSchema fallback to local store:", err);
    }
  }

  const db = loadDevDatabase();
  const now = new Date().toISOString();
  // Deactivate existing
  db.schemas.forEach((s) => {
    if (s.businessId === businessId) s.isActive = false;
  });

  const newSchema: BusinessSchemaRecord = {
    id: `sch_${Date.now()}`,
    businessId,
    version: 1,
    isActive: true,
    name: schemaData.name,
    fields: schemaData.fields.map((f, i) => ({ ...f, id: f.id || `f_${i}`, order: i })),
    createdAt: now,
    updatedAt: now,
  };
  db.schemas.push(newSchema);
  saveDevDatabase(db);
  return newSchema;
}

export async function getProducts(
  businessId: string,
  options?: { search?: string; category?: string; status?: "all" | "low_stock" | "out_of_stock" | "expiring_soon" }
): Promise<ProductRecord[]> {
  const isPg = await checkPrismaConnection();
  if (isPg) {
    try {
      const records = await prisma.product.findMany({
        where: {
          businessId,
          isActive: true,
          ...(options?.search ? { name: { contains: options.search, mode: "insensitive" } } : {}),
          ...(options?.category && options.category !== "all" ? { category: options.category } : {}),
        },
        orderBy: { updatedAt: "desc" },
      });
      return records.map((p: any) => ({
        id: p.id,
        businessId: p.businessId,
        schemaId: p.schemaId,
        name: p.name,
        quantity: Number(p.quantity ?? 0),
        price: Number(p.price ?? 0),
        sku: p.sku || undefined,
        category: p.category || undefined,
        expiryDate: p.expiryDate ? p.expiryDate.toISOString().split("T")[0] : undefined,
        fields: (p.fields as any) || {},
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("Prisma getProducts fallback to local store:", err);
    }
  }

  const db = loadDevDatabase();
  let list = db.products.filter((p) => p.businessId === businessId && p.isActive);

  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q)));
  }

  if (options?.category && options.category !== "all") {
    list = list.filter((p) => p.category === options.category);
  }

  if (options?.status === "low_stock") {
    list = list.filter((p) => p.quantity > 0 && p.quantity <= (p.minThreshold ?? 10));
  } else if (options?.status === "out_of_stock") {
    list = list.filter((p) => p.quantity <= 0);
  } else if (options?.status === "expiring_soon") {
    const now = new Date();
    const thresholdDays = 60;
    list = list.filter((p) => {
      if (!p.expiryDate) return false;
      const exp = new Date(p.expiryDate);
      const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return diffDays <= thresholdDays && diffDays >= 0;
    });
  }

  return list;
}

export async function createProduct(data: {
  businessId: string;
  schemaId: string;
  name: string;
  quantity: number;
  price: number;
  costPrice?: number;
  sku?: string;
  category?: string;
  unit?: string;
  minThreshold?: number;
  expiryDate?: string;
  fields?: Record<string, any>;
}): Promise<ProductRecord> {
  const isPg = await checkPrismaConnection();
  if (isPg) {
    try {
      const p = await prisma.product.create({
        data: {
          businessId: data.businessId,
          schemaId: data.schemaId,
          name: data.name,
          quantity: data.quantity,
          price: data.price,
          sku: data.sku,
          category: data.category,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
          fields: data.fields || {},
          isActive: true,
        },
      });
      return {
        id: p.id,
        businessId: p.businessId,
        schemaId: p.schemaId,
        name: p.name,
        quantity: Number(p.quantity ?? 0),
        price: Number(p.price ?? 0),
        sku: p.sku || undefined,
        category: p.category || undefined,
        expiryDate: p.expiryDate ? p.expiryDate.toISOString().split("T")[0] : undefined,
        fields: (p.fields as any) || {},
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma createProduct fallback to local store:", err);
    }
  }

  const db = loadDevDatabase();
  const now = new Date().toISOString();
  const newProduct: ProductRecord = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    businessId: data.businessId,
    schemaId: data.schemaId,
    name: data.name,
    quantity: data.quantity,
    price: data.price,
    costPrice: data.costPrice,
    sku: data.sku,
    category: data.category,
    unit: data.unit,
    minThreshold: data.minThreshold,
    expiryDate: data.expiryDate,
    fields: data.fields || {},
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  db.products.unshift(newProduct);

  // Add stock movement audit log
  db.movements.unshift({
    id: `mov_${Date.now()}`,
    businessId: data.businessId,
    productId: newProduct.id,
    productName: newProduct.name,
    type: "MANUAL_ADD",
    quantity: data.quantity,
    previousQty: 0,
    newQty: data.quantity,
    reason: "New item created manually",
    createdAt: now,
  });

  saveDevDatabase(db);
  return newProduct;
}

export async function adjustStock(data: {
  businessId: string;
  productId: string;
  adjustment: number;
  reason: string;
  notes?: string;
  actorId?: string;
}): Promise<{ product: ProductRecord; movement: StockMovementRecord }> {
  const db = loadDevDatabase();
  const product = db.products.find((p) => p.id === data.productId && p.businessId === data.businessId);
  if (!product) {
    throw new Error("Product not found");
  }

  const previousQty = product.quantity;
  const newQty = Math.max(0, previousQty + data.adjustment);
  product.quantity = newQty;
  product.updatedAt = new Date().toISOString();

  const movementType = data.adjustment > 0 ? "MANUAL_ADD" : data.adjustment < 0 ? "MANUAL_REDUCE" : "ADJUSTMENT";

  const movement: StockMovementRecord = {
    id: `mov_${Date.now()}`,
    businessId: data.businessId,
    productId: product.id,
    productName: product.name,
    type: movementType,
    quantity: Math.abs(data.adjustment),
    previousQty,
    newQty,
    reason: data.reason,
    notes: data.notes,
    actorId: data.actorId,
    createdAt: new Date().toISOString(),
  };

  db.movements.unshift(movement);
  saveDevDatabase(db);
  return { product, movement };
}

export async function deleteProduct(businessId: string, productId: string): Promise<boolean> {
  const db = loadDevDatabase();
  const idx = db.products.findIndex((p) => p.id === productId && p.businessId === businessId);
  if (idx === -1) return false;
  db.products[idx].isActive = false;
  db.products[idx].updatedAt = new Date().toISOString();
  saveDevDatabase(db);
  return true;
}

export async function getStockMovements(businessId: string, limit = 20): Promise<StockMovementRecord[]> {
  const db = loadDevDatabase();
  return db.movements.filter((m) => m.businessId === businessId).slice(0, limit);
}

export async function getDashboardMetrics(businessId: string) {
  const db = loadDevDatabase();
  const products = db.products.filter((p) => p.businessId === businessId && p.isActive);
  const business = db.businesses.find((b) => b.id === businessId);

  const totalItems = products.length;
  let totalStockUnits = 0;
  let totalValuation = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringSoonCount = 0;

  const now = new Date();
  const thresholdDays = 60;

  const categoryBreakdown: Record<string, { count: number; value: number }> = {};

  products.forEach((p) => {
    totalStockUnits += p.quantity;
    const itemValue = p.quantity * p.price;
    totalValuation += itemValue;

    if (p.quantity <= 0) {
      outOfStockCount++;
    } else if (p.quantity <= (p.minThreshold ?? 10)) {
      lowStockCount++;
    }

    if (p.expiryDate) {
      const exp = new Date(p.expiryDate);
      const diff = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (diff <= thresholdDays && diff >= 0) {
        expiringSoonCount++;
      }
    }

    const cat = p.category || "General";
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { count: 0, value: 0 };
    }
    categoryBreakdown[cat].count++;
    categoryBreakdown[cat].value += itemValue;
  });

  const categoryChartData = Object.entries(categoryBreakdown).map(([name, data]) => ({
    name,
    count: data.count,
    value: Math.round(data.value),
  }));

  return {
    businessName: business?.name || "Inventory Store",
    businessCategory: business?.category || "RETAIL",
    totalItems,
    totalStockUnits,
    totalValuation: Math.round(totalValuation),
    lowStockCount,
    outOfStockCount,
    expiringSoonCount,
    categoryChartData,
    recentMovements: db.movements.filter((m) => m.businessId === businessId).slice(0, 8),
    storageMode: getStorageMode(),
  };
}

export async function bulkIngestImportData(data: {
  businessId: string;
  schemaId: string;
  fileName: string;
  fileSize: number;
  category: BusinessCategory;
  rows: Record<string, any>[];
  approvedSchema: SchemaFieldConfig[];
}): Promise<{ job: ImportJobRecord; importedCount: number }> {
  const db = loadDevDatabase();
  const now = new Date().toISOString();

  // Save the schema if new or update active
  await saveSchema(data.businessId, {
    name: `${data.category} Imported Schema`,
    fields: data.approvedSchema,
  });

  const findValue = (r: any, patterns: RegExp[]): string | undefined => {
    for (const key of Object.keys(r)) {
      for (const p of patterns) {
        if (p.test(key.trim())) {
          const val = r[key];
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            return String(val).trim();
          }
        }
      }
    }
    return undefined;
  };

  let importedCount = 0;
  let mergedCount = 0;
  let skippedEmptyCount = 0;

  for (let idx = 0; idx < data.rows.length; idx++) {
    const row = data.rows[idx];

    // 1. Skip completely empty rows
    const nonNullValues = Object.values(row).filter(
      (v) => v !== undefined && v !== null && String(v).trim() !== ""
    );
    if (nonNullValues.length === 0) {
      skippedEmptyCount++;
      continue;
    }

    // 2. Extract and sanitize values with safe fallbacks
    const rawName = findValue(row, [
      /^(product[_\s]?name|item[_\s]?name|medicine[_\s]?name|drug[_\s]?name|ingredient[_\s]?name|product[_\s]?title|title|name|item|product|description)$/i,
    ]);
    const name = rawName || `Item #${idx + 1}`;

    const qtyStr = findValue(row, [/^(qty|quantity|stock|stock[_\s]?qty|units|current[_\s]?stock|available)$/i]);
    const parsedQty = qtyStr ? parseFloat(qtyStr.replace(/[^0-9.-]/g, "")) : 0;
    const quantity = isNaN(parsedQty) ? 0 : parsedQty;

    const priceStr = findValue(row, [
      /^(selling[_\s]?price|retail[_\s]?price|price|rate|mrp|unit[_\s]?price|cost[_\s]?per[_\s]?unit)$/i,
    ]);
    const parsedPrice = priceStr ? parseFloat(priceStr.replace(/[^0-9.-]/g, "")) : 0;
    const price = isNaN(parsedPrice) ? 0 : parsedPrice;

    const costStr = findValue(row, [
      /^(cost[_\s]?price|cost|purchase[_\s]?price|purchase[_\s]?rate|purchase[_\s]?cost|buying[_\s]?price)$/i,
    ]);
    const parsedCost = costStr ? parseFloat(costStr.replace(/[^0-9.-]/g, "")) : undefined;
    const costPrice = parsedCost !== undefined && !isNaN(parsedCost) ? parsedCost : undefined;

    const rawSku = findValue(row, [/^(sku|item[_\s]?code|product[_\s]?code|barcode|ean|batch[_\s]?no|batch|code|ref)$/i]);
    const sku = rawSku || undefined;

    const category = findValue(row, [/^(category|dept|department|kitchen[_\s]?station|type|group|section)$/i]);
    const unit = findValue(row, [/^(unit|uom|measure)$/i]);

    // ONLY extract expiry date if category is not garments (apparel has no expiration)
    const isPerishableCategory = data.category !== "GARMENTS";
    const rawExpiry = isPerishableCategory
      ? findValue(row, [/^(expiry|expiry[_\s]?date|exp[_\s]?date|best[_\s]?before|expiration|use[_\s]?by)$/i])
      : undefined;
    const expiryDate = rawExpiry && !["n/a", "na", "-", "nil", "none", "null"].includes(rawExpiry.toLowerCase())
      ? rawExpiry
      : undefined;

    const threshStr = findValue(row, [
      /^(reorder[_\s]?level|min[_\s]?stock|minimum[_\s]?stock|min[_\s]?threshold|prep[_\s]?par[_\s]?level|threshold)$/i,
    ]);
    const parsedThresh = threshStr ? parseFloat(threshStr.replace(/[^0-9.-]/g, "")) : 10;
    const minThreshold = isNaN(parsedThresh) ? 10 : parsedThresh;

    // 3. Smart Deduplication / Upsert within the same business silo
    // If a product with the same SKU or same normalized Name already exists in this store:
    const existingIndex = db.products.findIndex(
      (p) =>
        p.businessId === data.businessId &&
        ((sku && p.sku && p.sku.toLowerCase() === sku.toLowerCase()) ||
          (p.name.trim().toLowerCase() === name.trim().toLowerCase()))
    );

    if (existingIndex !== -1) {
      // Duplicate found: Intelligently merge stock & update details
      const existing = db.products[existingIndex];
      existing.quantity += quantity;
      if (price > 0) existing.price = price;
      if (costPrice) existing.costPrice = costPrice;
      if (expiryDate) existing.expiryDate = expiryDate;
      existing.fields = { ...existing.fields, ...row };
      existing.updatedAt = now;
      mergedCount++;
    } else {
      // New distinct product
      const newProd: ProductRecord = {
        id: `prod_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        businessId: data.businessId,
        schemaId: data.schemaId,
        name,
        quantity,
        price,
        costPrice,
        sku,
        category,
        unit,
        expiryDate,
        minThreshold,
        fields: { ...row },
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      db.products.unshift(newProd);
      importedCount++;
    }
  }

  const job: ImportJobRecord = {
    id: `job_${Date.now()}`,
    businessId: data.businessId,
    status: "COMPLETED",
    fileName: data.fileName,
    fileSize: data.fileSize,
    mimeType: "text/csv",
    totalRows: data.rows.length,
    validRows: importedCount + mergedCount,
    invalidRows: skippedEmptyCount,
    importedRows: importedCount + mergedCount,
    detectedCategory: data.category,
    suggestedSchema: data.approvedSchema,
    approvedSchema: data.approvedSchema,
    startedAt: now,
    completedAt: now,
    createdAt: now,
  };

  db.importJobs.unshift(job);
  saveDevDatabase(db);

  return { job, importedCount: importedCount + mergedCount };
}
