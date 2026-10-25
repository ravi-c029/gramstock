"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, Badge } from "@/components/ui/Card";
import { useBusiness } from "@/lib/business-context";
import {
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type WizardStep = "upload" | "analysis" | "schema" | "validation" | "complete";

export default function ImportWizardPage() {
  const router = useRouter();
  const { activeBusiness, businesses, setActiveBusinessId, refreshBusinesses } = useBusiness();

  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Target Store Selection State
  const [targetBizId, setTargetBizId] = useState<string>("");
  const [newStoreName, setNewStoreName] = useState<string>("");

  // Uploaded dataset state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    rowCount: number;
    headers: string[];
    sampleRows: Record<string, string>[];
    fullRows: Record<string, string>[];
    analysis: any;
  } | null>(null);

  // Schema Editor State
  const [selectedCategory, setSelectedCategory] = useState<string>("GROCERY");
  const [mappings, setMappings] = useState<
    {
      sourceColumn: string;
      targetField: string;
      label: string;
      type: string;
      required: boolean;
      isIdentifier: boolean;
    }[]
  >([]);

  // Import Result
  const [importSummary, setImportSummary] = useState<{ count: number; job: any; s3Url?: string; businessId?: string } | null>(null);

  // Step 1: Upload or pick sample
  const handleSampleSelect = async (sampleName: string, defaultCategory: string) => {
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/import/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleFileName: sampleName }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }
      setupAnalysisState(data, defaultCategory);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload analysis failed");
      }
      setupAnalysisState(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const setupAnalysisState = (data: any, fallbackCategory?: string) => {
    setUploadedFile({
      name: data.fileName,
      size: data.fileSize,
      rowCount: data.rowCount,
      headers: data.headers,
      sampleRows: data.sampleRows,
      fullRows: data.fullRows,
      analysis: data.analysis,
    });

    const detected = data.analysis?.categorySuggestion?.category?.toUpperCase();
    const category = detected && detected !== "UNKNOWN" ? detected : fallbackCategory || "RETAIL";
    setSelectedCategory(category);

    // Auto-match destination store with the dataset category so stores don't mix products
    const matchingBiz = businesses.find((b) => b.category === category);
    if (matchingBiz) {
      setTargetBizId(matchingBiz.id);
    } else {
      setTargetBizId("new");
      setNewStoreName(`My ${category.charAt(0) + category.slice(1).toLowerCase()} Boutique`);
    }

    const usedKeys = new Set<string>();
    const initialMappings = data.analysis.columns.map((col: any) => {
      const canonical = col.suggestedMapping || col.originalName;
      const isReq = canonical.toLowerCase().includes("name") || canonical.toLowerCase().includes("quantity") || canonical.toLowerCase().includes("price");
      const isId = canonical.toLowerCase().includes("sku") || canonical.toLowerCase().includes("barcode") || canonical.toLowerCase().includes("batch");

      const baseKey = canonical.toLowerCase().replace(/[\s\W]+/g, "_");
      let uniqueKey = baseKey;
      let counter = 1;
      while (usedKeys.has(uniqueKey)) {
        uniqueKey = `${baseKey}_${counter}`;
        counter++;
      }
      usedKeys.add(uniqueKey);

      return {
        sourceColumn: col.originalName,
        targetField: uniqueKey,
        label: canonical,
        type: (col.inferredType || "text").toUpperCase(),
        required: isReq,
        isIdentifier: isId,
      };
    });

    setMappings(initialMappings);
    setCurrentStep("analysis");
  };

  const handleFinalIngest = async () => {
    if (!uploadedFile) return;
    setImporting(true);
    setErrorMsg(null);
    try {
      const schemaFields = mappings.map((m, idx) => ({
        id: `field_${idx}`,
        name: m.targetField,
        label: m.label,
        type: m.type as any,
        required: m.required,
        isIdentifier: m.isIdentifier,
        order: idx,
        sourceColumn: m.sourceColumn,
      }));

      const res = await fetch("/api/import/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: targetBizId || activeBusiness?.id,
          newBusinessName: newStoreName,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          category: selectedCategory,
          rows: uploadedFile.fullRows,
          approvedSchema: schemaFields,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to persist import");
      }

      if (data.businessId) {
        setActiveBusinessId(data.businessId);
      }

      setImportSummary({
        count: data.importedCount,
        job: data.job,
        s3Url: data.s3Url,
        businessId: data.businessId,
      });
      setCurrentStep("complete");
      await refreshBusinesses();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AppShell
      title="Adaptive Dataset Import"
      businessName={activeBusiness?.name || "My Business"}
      businessCategory={activeBusiness?.category || "RETAIL"}
      breadcrumbs={[{ label: "GramStock" }, { label: "Imports" }, { label: currentStep.toUpperCase() }]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-[30px] bg-[var(--card)] border border-[var(--border)] shadow-xl transition-colors">
          {[
            { id: "upload", label: "1. Upload File" },
            { id: "analysis", label: "2. Heuristics" },
            { id: "schema", label: "3. Schema Config" },
            { id: "validation", label: "4. Review & Ingest" },
          ].map((s, idx) => {
            const isCurrent = currentStep === s.id;
            const isDone =
              (s.id === "upload" && currentStep !== "upload") ||
              (s.id === "analysis" && (currentStep === "schema" || currentStep === "validation" || currentStep === "complete")) ||
              (s.id === "schema" && (currentStep === "validation" || currentStep === "complete")) ||
              (s.id === "validation" && currentStep === "complete");

            return (
              <div key={s.id} className="flex items-center gap-2.5">
                <span
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center font-extrabold text-xs transition-all ${
                    isCurrent
                      ? "bg-[#1868ff] text-white shadow-md scale-105"
                      : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {isDone ? <Check size={14} /> : idx + 1}
                </span>
                <span
                  className={`hidden sm:inline text-xs font-bold ${
                    isCurrent ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD OR SAMPLE SELECTION */}
        {currentStep === "upload" && (
          <div className="space-y-8">
            <div className="p-6 sm:p-10 rounded-[26px] sm:rounded-[32px] bg-[var(--card)] border-2 border-dashed border-[var(--border)] hover:border-[#1868ff] transition-all text-center group cursor-pointer shadow-xl">
              <input
                type="file"
                id="file-dropzone"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={analyzing}
              />
              <label
                htmlFor="file-dropzone"
                className="cursor-pointer flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-[#1868ff]/15 border border-[#1868ff]/30 text-[#1868ff] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {analyzing ? <RefreshCw size={28} className="animate-spin" /> : <Upload size={28} />}
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
                    {analyzing ? "Analyzing uploaded dataset..." : "Drop your inventory CSV or Excel here"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Supports .CSV and .XLSX files up to 25MB with auto-schema detection
                  </p>
                </div>
                <Button size="md" variant="primary" type="button" disabled={analyzing} className="pointer-events-none rounded-2xl">
                  Select File From Computer
                </Button>
              </label>
            </div>

            {/* Quick Test with Preloaded Demo Datasets */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-[#ffb800]" />
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Or Test Instantly with Built-in Datasets
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Kirana / Grocery",
                    file: "kirana_inventory_sample.csv",
                    cat: "GROCERY",
                    desc: "Atta, pulses, oils, spices, FMCG with barcodes",
                    icon: "🛒",
                  },
                  {
                    name: "Medical / Pharmacy",
                    file: "pharmacy_inventory_sample.csv",
                    cat: "MEDICAL",
                    desc: "Tablets, syrups, batch numbers, Schedule H, expiries",
                    icon: "💊",
                  },
                  {
                    name: "Restaurant / Cafe",
                    file: "restaurant_inventory_sample.csv",
                    cat: "RESTAURANT",
                    desc: "Espresso, dairy, produce, perishability, par levels",
                    icon: "☕",
                  },
                  {
                    name: "Garments / Fashion",
                    file: "garments_inventory_sample.csv",
                    cat: "GARMENTS",
                    desc: "Apparel, denim, sizes, colors, fabrics, SKUs",
                    icon: "👗",
                  },
                  {
                    name: "Hardware & Tools",
                    file: "general_retail_sample.csv",
                    cat: "RETAIL",
                    desc: "Power tools, safety equipment, warranty, aisles",
                    icon: "🔧",
                  },
                ].map((item) => (
                  <button
                    key={item.file}
                    onClick={() => handleSampleSelect(item.file, item.cat)}
                    disabled={analyzing}
                    className="p-5 rounded-[26px] bg-[var(--card)] border border-[var(--border)] hover:border-[#1868ff] hover:shadow-2xl transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h5 className="font-extrabold text-sm text-[var(--text-primary)] group-hover:text-[#1868ff] transition-colors">
                        {item.name}
                      </h5>
                      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-[#1868ff] font-bold">
                      <span>Analyze Dataset</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY DETECTION */}
        {currentStep === "analysis" && uploadedFile && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-7 space-y-6">
              <div className="flex items-start justify-between pb-5 border-b border-[var(--border)]">
                <div>
                  <span className="text-xs text-[#1868ff] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={15} /> Heuristic Pattern Detection
                  </span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)] mt-1">
                    Identified Category: {selectedCategory}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Analyzed {uploadedFile.rowCount} rows & {uploadedFile.headers.length} columns from{" "}
                    <span className="font-mono text-[var(--text-primary)] font-bold">{uploadedFile.name}</span>
                  </p>
                </div>
                <Badge variant="primary" size="lg">
                  {selectedCategory}
                </Badge>
              </div>

              {/* Explainable Reasoning Block */}
              <div className="p-4 rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-xs space-y-2">
                <p className="font-bold text-[var(--text-primary)]">Classification Rationale:</p>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  {uploadedFile.analysis?.categorySuggestion?.reasons?.map((reason: string, i: number) => (
                    <li key={i}>{reason}</li>
                  )) || <li>Matched standard inventory attributes (Name, Quantity, Price).</li>}
                </ul>
              </div>

              {/* Category Override Option */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Override Category Profile
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["GROCERY", "MEDICAL", "RESTAURANT", "GARMENTS", "RETAIL", "CUSTOM"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${
                        selectedCategory === cat
                          ? "bg-[#1868ff] text-white shadow-md"
                          : "bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center pt-2">
              <Button variant="secondary" size="md" onClick={() => setCurrentStep("upload")}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button size="md" variant="primary" onClick={() => setCurrentStep("schema")}>
                <span>Configure Schema Fields</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: SCHEMA EDITOR */}
        {currentStep === "schema" && uploadedFile && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
                    Schema Definition & Canonical Field Mapping
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Fine-tune attributes, labels, and constraints for your {selectedCategory} catalog.
                  </p>
                </div>
                <Badge variant="outline" size="md">
                  {mappings.length} Fields
                </Badge>
              </div>

              <div className="space-y-3">
                {mappings.map((field, idx) => (
                  <div
                    key={field.sourceColumn}
                    className="p-4 rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
                  >
                    <div className="sm:col-span-3">
                      <span className="text-[10px] text-[var(--text-muted)] block font-bold">Source Header</span>
                      <span className="font-bold text-[var(--text-primary)] font-mono truncate block mt-0.5">
                        {field.sourceColumn}
                      </span>
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-[10px] text-[var(--text-muted)] block font-bold">Display Label</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...mappings];
                          updated[idx].label = e.target.value;
                          setMappings(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-[10px] text-[var(--text-muted)] block font-bold">Data Type</span>
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const updated = [...mappings];
                          updated[idx].type = e.target.value;
                          setMappings(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
                      >
                        <option value="TEXT">Text</option>
                        <option value="INTEGER">Integer Number</option>
                        <option value="DECIMAL">Decimal Number</option>
                        <option value="CURRENCY">Currency (₹)</option>
                        <option value="BOOLEAN">Boolean (Yes/No)</option>
                        <option value="DATE">Date</option>
                        <option value="SELECT">Select Option</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-end gap-3 pt-2 sm:pt-0">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...mappings];
                            updated[idx].required = e.target.checked;
                            setMappings(updated);
                          }}
                          className="rounded"
                        />
                        <span className="text-xs font-bold text-[var(--text-secondary)]">Required</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.isIdentifier}
                          onChange={(e) => {
                            const updated = [...mappings];
                            updated[idx].isIdentifier = e.target.checked;
                            setMappings(updated);
                          }}
                          className="rounded"
                        />
                        <span className="text-xs font-bold text-[var(--text-secondary)]">SKU/ID</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-between items-center pt-2">
              <Button variant="secondary" size="md" onClick={() => setCurrentStep("analysis")}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button size="md" variant="primary" onClick={() => setCurrentStep("validation")}>
                <span>Validate & Ingest</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: PREVIEW & INGESTION */}
        {currentStep === "validation" && uploadedFile && (
          <div className="space-y-6">
            <Card className="p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
                    Dataset Validation & Final Ingestion
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Category: <span className="font-bold text-[var(--text-primary)]">{selectedCategory}</span> | File:{" "}
                    <span className="font-mono text-[var(--text-primary)] font-bold">{uploadedFile.name}</span>
                  </p>
                </div>
                <Badge variant="success" size="lg">
                  {uploadedFile.rowCount} Valid Rows Ready
                </Badge>
              </div>

              {/* Destination Store Selector to prevent mixing different store items */}
              <div className="p-4 rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Destination Store Catalog:
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold">Multi-Tenant Isolation</span>
                </div>
                <select
                  value={targetBizId}
                  onChange={(e) => setTargetBizId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-bold rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)]"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.category})
                    </option>
                  ))}
                  <option value="new">+ Create Brand New Store for this Dataset</option>
                </select>
                {targetBizId === "new" && (
                  <input
                    type="text"
                    placeholder={`Enter Store Name (e.g. My ${selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()} Store)`}
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)]"
                  />
                )}
                <p className="text-[11px] text-[var(--text-muted)]">
                  Items will be isolated exclusively to this store profile. Clothes will never mix with grocery or pharmacy items.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <p className="font-extrabold text-2xl">{uploadedFile.rowCount}</p>
                  <p className="text-xs font-medium">Rows to Ingest</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#1868ff]/10 border border-[#1868ff]/30 text-[#1868ff]">
                  <p className="font-extrabold text-2xl">{mappings.length}</p>
                  <p className="text-xs font-medium">Schema Fields</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)]">
                  <p className="font-extrabold text-2xl">0</p>
                  <p className="text-xs font-medium">Blocking Errors</p>
                </div>
              </div>

              {/* Data Preview */}
              <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="p-3 bg-[var(--surface-muted)] border-b border-[var(--border)] text-xs font-bold text-[var(--text-primary)]">
                  Sample Data Rows (First 5 Rows)
                </div>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[var(--surface-muted)]/50 border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                        {mappings.map((m, idx) => (
                          <th key={`hdr-${m.sourceColumn}-${idx}`} className="py-2.5 px-3 font-bold">
                            {m.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {uploadedFile.sampleRows.slice(0, 5).map((row, rowIdx) => (
                        <tr key={`row-${rowIdx}`} className="hover:bg-[var(--surface-muted)]/40">
                          {mappings.map((m, colIdx) => (
                            <td key={`cell-${rowIdx}-${m.sourceColumn}-${colIdx}`} className="py-2.5 px-3 text-[var(--text-secondary)] font-mono">
                              {row[m.sourceColumn] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center pt-2">
              <Button variant="secondary" size="md" onClick={() => setCurrentStep("schema")} disabled={importing}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button size="md" variant="coral" onClick={handleFinalIngest} disabled={importing}>
                {importing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Ingesting Dataset &amp; Backing up to AWS S3...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm &amp; Ingest Into Store</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: COMPLETED */}
        {currentStep === "complete" && importSummary && (
          <Card className="text-center p-8 sm:p-12 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 size={44} />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl sm:text-2xl text-[var(--text-primary)]">
                Import Successfully Completed!
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
                Ingested {importSummary.count} products into{" "}
                <span className="font-bold text-[var(--text-primary)]">{activeBusiness?.name}</span>.
                The schema, custom attributes, and valuation are live.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                  <span>☁️ AWS S3 Backup:</span>
                  <span className="font-bold">gramstock-cloud-dataset-2026</span>
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button variant="secondary" size="md" onClick={() => router.push("/dashboard")}>
                View Dashboard
              </Button>
              <Button size="md" variant="primary" onClick={() => router.push("/inventory")}>
                Browse Store Inventory <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
