/**
 * GramStock Cloud — CSV/XLSX Import Analysis Engine
 *
 * Analyzes uploaded datasets:
 * 1. Parses CSV or XLSX
 * 2. Infers column types from sample values
 * 3. Detects missing/duplicate data
 * 4. Suggests a business category with heuristic reasoning
 * 5. Suggests field mappings to canonical fields
 */
import Papa from "papaparse";
import * as XLSX from "xlsx";

export type InferredType =
  | "text"
  | "integer"
  | "decimal"
  | "currency"
  | "boolean"
  | "date"
  | "datetime"
  | "select";

export interface ColumnAnalysis {
  originalName: string;
  sampleValues: string[];
  inferredType: InferredType;
  nullCount: number;
  uniqueCount: number;
  totalCount: number;
  nullPercent: number;
  isDuplicate: boolean;
  suggestedMapping: string | null;
  mappingConfidence: "high" | "medium" | "low" | "none";
  notes: string[];
}

export type BusinessCategory =
  | "grocery"
  | "medical"
  | "restaurant"
  | "garments"
  | "retail"
  | "unknown";

export interface CategorySuggestion {
  category: BusinessCategory;
  reasons: string[];
  missingFields: string[];
  ambiguousFields: string[];
}

export interface AnalysisResult {
  headers: string[];
  rowCount: number;
  sampleRows: Record<string, string>[];
  columns: ColumnAnalysis[];
  duplicateHeaders: string[];
  duplicateRowCount: number;
  categorySuggestion: CategorySuggestion;
  parseErrors: string[];
}

// =============================================
// CANONICAL FIELD MAPPINGS
// =============================================

/** Maps canonical field names to possible source column patterns */
const CANONICAL_FIELDS: Record<string, { patterns: RegExp[]; priority: number }> = {
  "Product Name": {
    patterns: [
      /^(product[_\s]?name|item[_\s]?name|name|item|product|description|desc|medicine[_\s]?name|drug[_\s]?name|ingredient)$/i,
    ],
    priority: 10,
  },
  Quantity: {
    patterns: [/^(qty|quantity|stock|stock[_\s]?qty|units|count|current[_\s]?stock|available)$/i],
    priority: 9,
  },
  "Purchase Price": {
    patterns: [/^(cost|purchase[_\s]?price|cost[_\s]?price|buying[_\s]?price|cp|mrp)$/i],
    priority: 8,
  },
  "Selling Price": {
    patterns: [/^(selling[_\s]?price|price|sale[_\s]?price|sp|retail[_\s]?price|unit[_\s]?price|rate)$/i],
    priority: 8,
  },
  "Expiry Date": {
    patterns: [/^(expiry|expiry[_\s]?date|exp[_\s]?date|best[_\s]?before|expiration|use[_\s]?by|expire[_\s]?date)$/i],
    priority: 7,
  },
  Category: {
    patterns: [/^(category|cat|type|group|dept|department|section|class|segment)$/i],
    priority: 6,
  },
  SKU: {
    patterns: [/^(sku|item[_\s]?code|product[_\s]?code|barcode|code|id|ref|reference|batch[_\s]?no|batch)$/i],
    priority: 7,
  },
  Brand: {
    patterns: [/^(brand|manufacturer|maker|company|vendor|supplier)$/i],
    priority: 5,
  },
  Unit: {
    patterns: [/^(unit|uom|unit[_\s]?of[_\s]?measure|measurement|measure)$/i],
    priority: 5,
  },
  "Reorder Level": {
    patterns: [/^(reorder[_\s]?level|min[_\s]?stock|minimum[_\s]?stock|low[_\s]?stock[_\s]?level|threshold)$/i],
    priority: 4,
  },
  Size: {
    patterns: [/^(size|dimension|measurement)$/i],
    priority: 4,
  },
  Color: {
    patterns: [/^(color|colour)$/i],
    priority: 4,
  },
  "Batch Number": {
    patterns: [/^(batch|batch[_\s]?no|batch[_\s]?number|lot[_\s]?no|lot[_\s]?number)$/i],
    priority: 5,
  },
  Location: {
    patterns: [/^(location|shelf|rack|bin|warehouse|store)$/i],
    priority: 3,
  },
};

// =============================================
// CATEGORY DETECTION HEURISTICS
// =============================================

interface CategoryRule {
  strongSignals: RegExp[];
  weakSignals: RegExp[];
  counterSignals: RegExp[];
}

const CATEGORY_RULES: Record<Exclude<BusinessCategory, "unknown">, CategoryRule> = {
  grocery: {
    strongSignals: [
      /expiry|best.before|category.*(vegetable|fruit|grain|dairy|spice|oil|flour)/i,
      /^(unit|uom|measurement)$/i,
    ],
    weakSignals: [
      /price|quantity|brand|supplier/i,
    ],
    counterSignals: [/prescription|batch.no|composition|tablet|capsule/i],
  },
  medical: {
    strongSignals: [
      /prescription|composition|dosage|tablet|capsule|injection|syrup|mg|ml.per/i,
      /batch.no|lot.no|manufacturer.date/i,
    ],
    weakSignals: [/expiry|mrp|generic/i],
    counterSignals: [/size|color|style|flavor/i],
  },
  restaurant: {
    strongSignals: [
      /ingredient|recipe|portion|serving|calories|kitchen/i,
      /(food|beverage|dish|menu)[_\s]?(category|type)/i,
    ],
    weakSignals: [/quantity|cost|supplier/i],
    counterSignals: [/batch.no|prescription|size|color/i],
  },
  garments: {
    strongSignals: [
      /size|color|colour|style|gender|fabric|material|pattern|fit/i,
      /sku.*variant|variant.*sku/i,
    ],
    weakSignals: [/brand|category|price/i],
    counterSignals: [/expiry|batch|prescription|ingredient/i],
  },
  retail: {
    strongSignals: [/barcode|sku|upc|ean|product.code/i],
    weakSignals: [/price|quantity|category|brand/i],
    counterSignals: [],
  },
};

// =============================================
// TYPE INFERENCE
// =============================================

function inferType(values: string[]): InferredType {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return "text";

  // Date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/,
    /^\d{2}[\/\-]\d{2}[\/\-]\d{4}/,
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  ];

  // Boolean patterns
  const boolVals = new Set(["true", "false", "yes", "no", "1", "0", "y", "n"]);

  let numericCount = 0;
  let integerCount = 0;
  let currencyCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const val of nonEmpty) {
    const trimmed = val.trim();

    if (boolVals.has(trimmed.toLowerCase())) boolCount++;

    // Currency: starts with ₹, $, €, £
    if (/^[₹$€£]/.test(trimmed)) {
      const num = parseFloat(trimmed.replace(/[₹$€£,]/g, ""));
      if (!isNaN(num)) currencyCount++;
    }

    // Numeric
    const numVal = parseFloat(trimmed.replace(/,/g, ""));
    if (!isNaN(numVal)) {
      numericCount++;
      if (Number.isInteger(numVal) || /^\d+$/.test(trimmed.replace(/,/g, ""))) {
        integerCount++;
      }
    }

    // Date
    for (const pat of datePatterns) {
      if (pat.test(trimmed)) {
        dateCount++;
        break;
      }
    }
  }

  const ratio = (count: number) => count / nonEmpty.length;

  if (ratio(dateCount) > 0.6) return "date";
  if (ratio(currencyCount) > 0.5) return "currency";
  if (ratio(numericCount) > 0.7) {
    return ratio(integerCount) > 0.8 ? "integer" : "decimal";
  }
  if (ratio(boolCount) > 0.7) return "boolean";

  // Check for select (low cardinality text)
  const unique = new Set(nonEmpty.map((v) => v.trim().toLowerCase()));
  if (unique.size <= 15 && nonEmpty.length > 5) return "select";

  return "text";
}

function suggestMapping(
  header: string
): { mapping: string | null; confidence: ColumnAnalysis["mappingConfidence"] } {
  const cleaned = header.trim();

  for (const [canonicalName, { patterns }] of Object.entries(CANONICAL_FIELDS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        return { mapping: canonicalName, confidence: "high" };
      }
    }
  }

  // Fuzzy: check if canonical name words appear in header
  for (const [canonicalName] of Object.entries(CANONICAL_FIELDS)) {
    const words = canonicalName.toLowerCase().split(" ");
    const headerLower = cleaned.toLowerCase();
    const matchCount = words.filter((w) => headerLower.includes(w)).length;
    if (matchCount === words.length) {
      return { mapping: canonicalName, confidence: "medium" };
    }
    if (matchCount > 0 && words.length > 1) {
      return { mapping: canonicalName, confidence: "low" };
    }
  }

  return { mapping: null, confidence: "none" };
}

function detectCategory(
  headers: string[],
  sampleRows: Record<string, string>[]
): CategorySuggestion {
  const headerStr = headers.join(" ").toLowerCase();
  const sampleStr = sampleRows
    .slice(0, 5)
    .flatMap((r) => Object.values(r))
    .join(" ")
    .toLowerCase();

  const combined = `${headerStr} ${sampleStr}`;

  const scores: Record<Exclude<BusinessCategory, "unknown">, number> = {
    grocery: 0,
    medical: 0,
    restaurant: 0,
    garments: 0,
    retail: 0,
  };

  const reasons: Record<Exclude<BusinessCategory, "unknown">, string[]> = {
    grocery: [],
    medical: [],
    restaurant: [],
    garments: [],
    retail: [],
  };

  for (const [cat, rules] of Object.entries(CATEGORY_RULES) as [
    Exclude<BusinessCategory, "unknown">,
    CategoryRule,
  ][]) {
    // Counter signals negate
    let hasCounter = false;
    for (const pat of rules.counterSignals) {
      if (pat.test(combined)) {
        hasCounter = true;
        break;
      }
    }
    if (hasCounter) {
      scores[cat] -= 5;
      continue;
    }

    for (const pat of rules.strongSignals) {
      const m = combined.match(pat);
      if (m) {
        scores[cat] += 3;
        reasons[cat].push(`Found field: "${m[0]}"`);
      }
    }

    for (const pat of rules.weakSignals) {
      if (pat.test(combined)) {
        scores[cat] += 1;
      }
    }
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [
    Exclude<BusinessCategory, "unknown">,
    number,
  ][];

  const [bestCat, bestScore] = sorted[0];
  const [, secondScore] = sorted[1] ?? ["", 0];

  // If score is low or too close to second, fall back to unknown
  if (bestScore <= 0 || (bestScore - secondScore < 2 && bestScore < 4)) {
    return {
      category: "unknown",
      reasons: ["No clear category signals detected. Please select manually."],
      missingFields: [],
      ambiguousFields: [],
    };
  }

  // Build missing recommended fields
  const mappedHeaders = headers.map((h) => suggestMapping(h).mapping).filter(Boolean);
  const requiredForCategory: Record<Exclude<BusinessCategory, "unknown">, string[]> = {
    grocery: ["Product Name", "Quantity", "Category"],
    medical: ["Product Name", "Quantity", "Expiry Date", "Batch Number"],
    restaurant: ["Product Name", "Quantity", "Unit"],
    garments: ["Product Name", "Quantity", "Size", "Color"],
    retail: ["Product Name", "Quantity", "SKU"],
  };

  const missing = (requiredForCategory[bestCat] ?? []).filter(
    (f) => !mappedHeaders.includes(f)
  );

  return {
    category: bestCat,
    reasons: reasons[bestCat].slice(0, 4),
    missingFields: missing,
    ambiguousFields: [],
  };
}

// =============================================
// MAIN ANALYSIS FUNCTIONS
// =============================================

export async function parseCSV(
  content: string
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const result = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      reject(new Error(result.errors.map((e) => e.message).join("; ")));
      return;
    }

    resolve({
      headers: result.meta.fields ?? [],
      rows: result.data,
    });
  });
}

export function parseXLSX(
  buffer: Buffer
): { headers: string[]; rows: Record<string, string>[] } {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("XLSX file has no sheets");

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false, // Returns strings, avoids formula execution
  });

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(rows[0]).map((h) => h.trim());
  const stringRows = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim(), String(v ?? "")]))
  ) as Record<string, string>[];

  return { headers, rows: stringRows };
}

export function analyzeDataset(
  headers: string[],
  rows: Record<string, string>[]
): AnalysisResult {
  const parseErrors: string[] = [];

  // Detect duplicate headers
  const headerCounts = new Map<string, number>();
  for (const h of headers) {
    const key = h.toLowerCase();
    headerCounts.set(key, (headerCounts.get(key) ?? 0) + 1);
  }
  const duplicateHeaders = headers.filter(
    (h) => (headerCounts.get(h.toLowerCase()) ?? 0) > 1
  );
  if (duplicateHeaders.length > 0) {
    parseErrors.push(`Duplicate column headers: ${[...new Set(duplicateHeaders)].join(", ")}`);
  }

  // Analyze each column
  const columns: ColumnAnalysis[] = headers.map((header, idx) => {
    const values = rows.map((r) => r[header] ?? "");
    const nonEmpty = values.filter((v) => v.trim() !== "");
    const nullCount = values.length - nonEmpty.length;
    const uniqueValues = new Set(values.map((v) => v.trim()));

    const sampleValues = nonEmpty.slice(0, 5);
    const inferredType = inferType(sampleValues);
    const { mapping, confidence } = suggestMapping(header);

    const notes: string[] = [];
    const nullPercent = values.length > 0 ? (nullCount / values.length) * 100 : 0;
    if (nullPercent > 50) notes.push(`${nullPercent.toFixed(0)}% empty values`);
    if (inferredType === "select") notes.push(`${uniqueValues.size} unique values`);

    return {
      originalName: header,
      sampleValues,
      inferredType,
      nullCount,
      uniqueCount: uniqueValues.size,
      totalCount: values.length,
      nullPercent,
      isDuplicate: (headerCounts.get(header.toLowerCase()) ?? 0) > 1,
      suggestedMapping: mapping,
      mappingConfidence: confidence,
      notes,
    };
  });

  // Detect duplicate rows (by first identifier column or first column)
  const rowSignatures = rows.map((r) =>
    headers
      .slice(0, 3)
      .map((h) => r[h] ?? "")
      .join("|")
  );
  const sigCounts = new Map<string, number>();
  for (const sig of rowSignatures) {
    sigCounts.set(sig, (sigCounts.get(sig) ?? 0) + 1);
  }
  const duplicateRowCount = rowSignatures.filter((s) => (sigCounts.get(s) ?? 0) > 1).length;

  const sampleRows = rows.slice(0, 10);
  const categorySuggestion = detectCategory(headers, sampleRows);

  return {
    headers,
    rowCount: rows.length,
    sampleRows,
    columns,
    duplicateHeaders,
    duplicateRowCount,
    categorySuggestion,
    parseErrors,
  };
}

// =============================================
// VALIDATION ENGINE
// =============================================

export interface ValidationResult {
  validRows: number;
  invalidRows: number;
  warningRows: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ValidationWarning {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  type: InferredType;
  required: boolean;
}

export function validateRows(
  rows: Record<string, string>[],
  mappings: FieldMapping[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const invalidRowSet = new Set<number>();
  const warningRowSet = new Set<number>();

  const identifierField = mappings.find((m) => m.targetField === "SKU" || m.targetField === "Product Name");
  const identifierValues = new Map<string, number>();

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;

    for (const mapping of mappings) {
      const value = row[mapping.sourceColumn] ?? "";
      const trimmed = value.trim();

      // Required field check
      if (mapping.required && trimmed === "") {
        errors.push({
          row: rowNum,
          field: mapping.targetField,
          value: "",
          message: `Required field "${mapping.targetField}" is empty`,
        });
        invalidRowSet.add(rowNum);
        continue;
      }

      if (trimmed === "") continue;

      // Type validation
      if (mapping.type === "integer" || mapping.type === "decimal" || mapping.type === "currency") {
        const num = parseFloat(trimmed.replace(/[₹$€£,]/g, ""));
        if (isNaN(num)) {
          errors.push({
            row: rowNum,
            field: mapping.targetField,
            value: trimmed,
            message: `Expected number for "${mapping.targetField}", got "${trimmed}"`,
          });
          invalidRowSet.add(rowNum);
        } else if (num < 0 && (mapping.targetField === "Quantity" || mapping.targetField === "Selling Price")) {
          warnings.push({
            row: rowNum,
            field: mapping.targetField,
            value: trimmed,
            message: `Negative value (${trimmed}) for "${mapping.targetField}"`,
          });
          warningRowSet.add(rowNum);
        }
      }

      if (mapping.type === "date" || mapping.type === "datetime") {
        const d = new Date(trimmed);
        if (isNaN(d.getTime())) {
          warnings.push({
            row: rowNum,
            field: mapping.targetField,
            value: trimmed,
            message: `Could not parse date "${trimmed}" for field "${mapping.targetField}"`,
          });
          warningRowSet.add(rowNum);
        }
      }
    }

    // Duplicate identifier check
    if (identifierField) {
      const idVal = row[identifierField.sourceColumn]?.trim() ?? "";
      if (idVal !== "") {
        const prevRow = identifierValues.get(idVal);
        if (prevRow !== undefined) {
          warnings.push({
            row: rowNum,
            field: identifierField.targetField,
            value: idVal,
            message: `Duplicate identifier "${idVal}" (first seen at row ${prevRow})`,
          });
          warningRowSet.add(rowNum);
        } else {
          identifierValues.set(idVal, rowNum);
        }
      }
    }
  });

  return {
    validRows: rows.length - invalidRowSet.size,
    invalidRows: invalidRowSet.size,
    warningRows: warningRowSet.size,
    errors: errors.slice(0, 200), // Cap for performance
    warnings: warnings.slice(0, 200),
  };
}
