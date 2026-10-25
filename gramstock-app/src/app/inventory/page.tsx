"use client";

import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, Badge } from "@/components/ui/Card";
import { useBusiness } from "@/lib/business-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  Search,
  Plus,
  Minus,
  Download,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  X,
  LayoutGrid,
  List,
} from "lucide-react";

export default function InventoryPage() {
  const { activeBusiness, businesses } = useBusiness();
  const [products, setProducts] = useState<any[]>([]);
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "low_stock" | "out_of_stock" | "expiring_soon">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Stock Adjustment Modal State
  const [adjustModalItem, setAdjustModalItem] = useState<any>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("Physical Count Correction");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState<Record<string, any>>({
    name: "",
    quantity: 10,
    price: 100,
    costPrice: 80,
    category: "",
    unit: "pcs",
  });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const fetchInventory = async () => {
    if (!activeBusiness?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        businessId: activeBusiness.id,
        status: statusFilter,
      });
      if (search) params.set("search", search);
      if (selectedCategory !== "all") params.set("category", selectedCategory);

      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setSchema(data.schema || null);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeBusiness?.id, statusFilter, selectedCategory]);

  useEffect(() => {
    if (activeBusiness?.category === "GARMENTS" && statusFilter === "expiring_soon") {
      setStatusFilter("all");
    }
  }, [activeBusiness?.category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleQuickAdjust = async (product: any, delta: number) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: activeBusiness?.id,
          productId: product.id,
          adjustment: delta,
          reason: delta > 0 ? "Quick Restock (+1)" : "Quick Dispense / Sale (-1)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
      }
    } catch (err) {
      console.error("Quick adjust failed:", err);
    }
  };

  const submitCustomAdjustment = async () => {
    if (!adjustModalItem || adjustmentDelta === 0) return;
    setIsAdjusting(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: activeBusiness?.id,
          productId: adjustModalItem.id,
          adjustment: adjustmentDelta,
          reason: adjustmentReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === adjustModalItem.id ? data.product : p))
        );
        setAdjustModalItem(null);
        setAdjustmentDelta(0);
      }
    } catch (err) {
      console.error("Custom adjust failed:", err);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name) return;
    setIsSubmittingNew(true);
    try {
      const payload = {
        businessId: activeBusiness?.id,
        schemaId: schema?.id,
        name: newProductForm.name,
        quantity: Number(newProductForm.quantity || 0),
        price: Number(newProductForm.price || 0),
        costPrice: newProductForm.costPrice ? Number(newProductForm.costPrice) : undefined,
        sku: newProductForm.sku || undefined,
        category: newProductForm.category || undefined,
        unit: newProductForm.unit || undefined,
        expiryDate: newProductForm.expiryDate || undefined,
        fields: { ...newProductForm },
      };

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [data.product, ...prev]);
        setShowAddModal(false);
        setNewProductForm({ name: "", quantity: 10, price: 100, costPrice: 80, category: "", unit: "pcs" });
      }
    } catch (err) {
      console.error("Create item failed:", err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to deactivate this item?")) return;
    try {
      const res = await fetch(`/api/inventory?businessId=${activeBusiness?.id}&productId=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const exportCSV = () => {
    if (products.length === 0) return;
    const headers = ["Product Name", "Category", "Quantity", "Unit", "Price", "Cost Price", "SKU", "Expiry Date"];
    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category || ""}"`,
      p.quantity,
      `"${p.unit || ""}"`,
      p.price,
      p.costPrice || "",
      `"${p.sku || ""}"`,
      p.expiryDate || "",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeBusiness?.name || "inventory"}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dynamicFields = useMemo(() => {
    if (!schema?.fields) return [];
    return schema.fields
      .filter((f: any) => !["name", "quantity", "price", "category"].includes(f.name))
      .slice(0, 3);
  }, [schema]);

  if (!activeBusiness || businesses.length === 0) {
    return (
      <AppShell
        title="Store Catalog"
        businessName="Pending Setup"
        businessCategory="SETUP"
        breadcrumbs={[{ label: "GramStock" }, { label: "Inventory" }]}
      >
        <div className="max-w-xl mx-auto py-16 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Package size={32} />
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)]">No Inventory Found</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            You haven&apos;t uploaded an inventory spreadsheet yet. Upload your raw CSV or Excel file to auto-categorize your store.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/imports";
              }}
              className="px-8 py-3.5 rounded-full bg-[#1868ff] hover:bg-[#0d54df] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              Upload Store CSV →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Adaptive Inventory Workspace"
      businessName={activeBusiness?.name || "My Business"}
      businessCategory={activeBusiness?.category || "RETAIL"}
      breadcrumbs={[{ label: "GramStock" }, { label: "Inventory" }]}
      actions={
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCSV}
            className="flex items-center gap-1.5 border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-sm px-2.5 sm:px-3 text-xs"
            title="Export catalog to CSV"
          >
            <Download size={14} className="text-[#1868ff] flex-shrink-0" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button size="sm" variant="primary" onClick={() => setShowAddModal(true)} className="px-2.5 sm:px-3 text-xs">
            <Plus size={14} />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Controls Toolbar: Search & Segmented Filter Pills */}
        <div className="flex flex-col gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-[26px] sm:rounded-[28px] bg-[var(--card)] border border-[var(--border)] shadow-xl transition-colors">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search catalog by name, SKU, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#1868ff] focus:ring-2 focus:ring-[#1868ff]/30 transition-all"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="rounded-xl sm:rounded-2xl px-3 sm:px-4 text-xs font-bold">
              Search
            </Button>
          </form>

          {/* Segmented Filter Pills & View Switcher */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex-shrink-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === "all"
                    ? "bg-[#1868ff] text-white shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                All SKUs
              </button>
              <button
                onClick={() => setStatusFilter("low_stock")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  statusFilter === "low_stock"
                    ? "bg-[#f59e0b] text-slate-950 shadow-md"
                    : "text-amber-500 hover:text-amber-600"
                }`}
              >
                <AlertTriangle size={12} />
                Low Stock
              </button>
              <button
                onClick={() => setStatusFilter("out_of_stock")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === "out_of_stock"
                    ? "bg-[#ff4b4b] text-white shadow-md"
                    : "text-[#ff4b4b] hover:text-red-600"
                }`}
              >
                Out of Stock
              </button>
              {activeBusiness?.category !== "GARMENTS" && (
                <button
                  onClick={() => setStatusFilter("expiring_soon")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                    statusFilter === "expiring_soon"
                      ? "bg-[#a855f7] text-white shadow-md"
                      : "text-purple-500 hover:text-purple-600"
                  }`}
                >
                  <Clock size={12} />
                  Expiring
                </button>
              )}
            </div>

            {/* Grid / Table View Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "grid" ? "bg-[#1868ff] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                title="Grid Tile View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "table" ? "bg-[#1868ff] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                title="Table View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-[var(--text-muted)]">
            <RefreshCw size={28} className="animate-spin mb-3 text-[#1868ff]" />
            <p className="text-sm font-semibold">Updating adaptive inventory workspace...</p>
          </div>
        )}

        {/* VIEW 1: GRID EQUIPMENT TILE VIEW */}
        {!loading && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.length > 0 ? (
              products.map((item) => {
                const isLow = item.quantity > 0 && item.quantity <= (item.minThreshold ?? 10);
                const isOut = item.quantity <= 0;

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between p-5 rounded-[28px] bg-[var(--card)] border border-[var(--border)] hover:border-[#1868ff]/60 hover:shadow-2xl transition-all duration-300"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)] truncate">
                          {item.category || "General"}
                        </span>
                        {isOut ? (
                          <Badge variant="danger" size="sm">Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="sm">Low Stock</Badge>
                        ) : (
                          <Badge variant="success" size="sm">In Stock</Badge>
                        )}
                      </div>

                      {/* Product Visual Container */}
                      <div className="w-full h-28 rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] flex items-center justify-center mb-4 group-hover:bg-[#1868ff]/10 transition-colors">
                        <div className="text-center space-y-1">
                          <Package size={34} className="mx-auto text-[#1868ff] group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                            {item.sku ? `SKU: ${item.sku}` : "NO SKU"}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] tracking-tight line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {item.unit ? `Unit: ${item.unit}` : ""}
                        {item.fields?.size ? ` • Size: ${item.fields.size}` : ""}
                        {item.fields?.color ? ` • ${item.fields.color}` : ""}
                        {item.fields?.fabric ? ` • ${item.fields.fabric}` : ""}
                        {item.expiryDate && activeBusiness?.category !== "GARMENTS" ? ` • Exp: ${item.expiryDate}` : ""}
                      </p>

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between gap-2 my-4 pt-3 border-t border-[var(--border)]">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Retail Price</p>
                          <p className="text-lg font-extrabold text-[var(--text-primary)] font-mono">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">On Hand</p>
                          <p className="text-lg font-extrabold text-[#1868ff] font-mono">
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Adjustment Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                      <button
                        onClick={() => handleQuickAdjust(item, -1)}
                        disabled={item.quantity <= 0}
                        className="w-9 h-9 rounded-xl bg-[var(--surface-muted)] hover:bg-[#ff4b4b]/20 hover:text-[#ff4b4b] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center border border-[var(--border)] text-[var(--text-primary)] font-bold transition-all active:scale-95"
                        title="Reduce 1 unit"
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(item, 1)}
                        className="w-9 h-9 rounded-xl bg-[var(--surface-muted)] hover:bg-emerald-500/20 hover:text-emerald-500 flex items-center justify-center border border-[var(--border)] text-[var(--text-primary)] font-bold transition-all active:scale-95"
                        title="Add 1 unit"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setAdjustModalItem(item);
                          setAdjustmentDelta(0);
                        }}
                        className="flex-1 h-9 px-3 rounded-xl text-xs font-bold bg-[#1868ff]/15 hover:bg-[#1868ff]/25 text-[#1868ff] border border-[#1868ff]/30 flex items-center justify-center transition-all"
                      >
                        Audit Adjust
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-9 h-9 rounded-xl hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-500 flex items-center justify-center transition-colors"
                        title="Deactivate item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-[var(--text-muted)]">
                <Package size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">No items match your active search or filter.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: TABLE VIEW */}
        {!loading && viewMode === "table" && (
          <Card className="p-0 overflow-hidden rounded-[28px]">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--surface-muted)] border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                    <th className="py-4 px-5 font-bold uppercase tracking-wider">Product Name</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">Department</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">Stock Qty</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">Selling Price</th>
                    {dynamicFields.map((f: any) => (
                      <th key={f.name} className="py-4 px-4 font-bold uppercase tracking-wider">
                        {f.label}
                      </th>
                    ))}
                    <th className="py-4 px-5 font-bold uppercase tracking-wider text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {products.length > 0 ? (
                    products.map((item) => {
                      const isLow = item.quantity > 0 && item.quantity <= (item.minThreshold ?? 10);
                      const isOut = item.quantity <= 0;

                      return (
                        <tr key={item.id} className="hover:bg-[var(--surface-muted)]/60 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-[var(--text-primary)]">
                            <div>
                              <span>{item.name}</span>
                              {item.sku && (
                                <span className="block text-[10px] text-[var(--text-muted)] font-mono">
                                  SKU: {item.sku}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)] font-semibold border border-[var(--border)]">
                              {item.category || "General"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-[var(--text-primary)] font-mono">
                                {item.quantity}
                              </span>
                              {item.unit && (
                                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                                  {item.unit}
                                </span>
                              )}
                              {isOut ? (
                                <Badge variant="danger" size="sm">Out</Badge>
                              ) : isLow ? (
                                <Badge variant="warning" size="sm">Low</Badge>
                              ) : null}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-extrabold text-[var(--text-primary)] font-mono">
                            {formatCurrency(item.price)}
                          </td>

                          {dynamicFields.map((f: any) => {
                            const val = item.fields?.[f.name] ?? item[f.name] ?? "—";
                            return (
                              <td key={f.name} className="py-3.5 px-4 text-[var(--text-secondary)] font-mono">
                                {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                              </td>
                            );
                          })}

                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickAdjust(item, -1)}
                                disabled={item.quantity <= 0}
                                className="w-8 h-8 rounded-xl bg-[var(--surface-muted)] hover:bg-[#ff4b4b]/20 hover:text-[#ff4b4b] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center border border-[var(--border)] text-[var(--text-primary)] font-bold transition-all"
                              >
                                <Minus size={13} />
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, 1)}
                                className="w-8 h-8 rounded-xl bg-[var(--surface-muted)] hover:bg-emerald-500/20 hover:text-emerald-500 flex items-center justify-center border border-[var(--border)] text-[var(--text-primary)] font-bold transition-all"
                              >
                                <Plus size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  setAdjustModalItem(item);
                                  setAdjustmentDelta(0);
                                }}
                                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#1868ff]/15 text-[#1868ff] border border-[#1868ff]/30 hover:bg-[#1868ff]/25 transition-all"
                              >
                                Adjust
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5 + dynamicFields.length} className="py-12 text-center text-[var(--text-muted)]">
                        No items found matching the current search/filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* AUDIT ADJUSTMENT MODAL */}
        {adjustModalItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] rounded-[32px] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                    Stock Adjustment Audit
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {adjustModalItem.name} • Current Qty: <span className="font-bold text-[var(--text-primary)]">{adjustModalItem.quantity}</span>
                  </p>
                </div>
                <button
                  onClick={() => setAdjustModalItem(null)}
                  className="w-8 h-8 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                    Adjustment Units (+ to add, - to subtract)
                  </label>
                  <input
                    type="number"
                    value={adjustmentDelta}
                    onChange={(e) => setAdjustmentDelta(Number(e.target.value))}
                    className="w-full px-4 py-3 text-base font-bold rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                    placeholder="e.g. +5 or -2"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    Updated stock count:{" "}
                    <span className="font-extrabold text-[#1868ff]">
                      {Math.max(0, adjustModalItem.quantity + adjustmentDelta)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                    Ledger Audit Reason
                  </label>
                  <select
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                  >
                    <option value="Physical Count Correction">Physical Count Correction</option>
                    <option value="Damaged / Broken Goods">Damaged / Broken Goods</option>
                    <option value="Expired / Past Best Before">Expired / Past Best Before</option>
                    <option value="Customer Return">Customer Return</option>
                    <option value="Direct Supplier Inflow">Direct Supplier Inflow</option>
                    <option value="Counter Sale Checkout">Counter Sale Checkout</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <Button variant="secondary" size="sm" onClick={() => setAdjustModalItem(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={submitCustomAdjustment}
                  disabled={isAdjusting || adjustmentDelta === 0}
                >
                  {isAdjusting ? "Saving Ledger..." : "Commit Adjustment"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ADD PRODUCT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                    Add Item to {activeBusiness?.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Fields conform dynamically to your active {activeBusiness?.category} schema
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                    Product / Item Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                    placeholder="e.g. Aashirvaad Atta 10kg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                      Initial Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProductForm.quantity}
                      onChange={(e) => setNewProductForm({ ...newProductForm, quantity: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                      Packaging Unit
                    </label>
                    <input
                      type="text"
                      value={newProductForm.unit}
                      onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                      placeholder="e.g. kg, strip, bag"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                      Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newProductForm.costPrice}
                      onChange={(e) => setNewProductForm({ ...newProductForm, costPrice: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                      Department / Category
                    </label>
                    <input
                      type="text"
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                      placeholder="e.g. Staples, Dairy"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                      SKU / Barcode
                    </label>
                    <input
                      type="text"
                      value={newProductForm.sku || ""}
                      onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#1868ff]"
                      placeholder="e.g. 8901030383123"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="primary" disabled={isSubmittingNew}>
                    {isSubmittingNew ? "Saving..." : "Create Product"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
