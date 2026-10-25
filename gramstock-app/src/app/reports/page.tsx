"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useBusiness } from "@/lib/business-context";
import { formatDate } from "@/lib/utils";
import { Download, ShieldCheck, RefreshCw, Store } from "lucide-react";

export default function ReportsPage() {
  const { activeBusiness } = useBusiness();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLog = async () => {
    if (!activeBusiness?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?businessId=${activeBusiness.id}`);
      const data = await res.json();
      if (data.success && data.metrics) {
        setMovements(data.metrics.recentMovements || []);
      }
    } catch (err) {
      console.error("Failed to load audit log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLog();
  }, [activeBusiness?.id]);

  const exportAuditCSV = () => {
    if (movements.length === 0) return;
    const headers = ["ID", "Timestamp", "Product Name", "Movement Type", "Quantity Adjusted", "Stock After", "Reason / Notes"];
    const rows = movements.map((m) => [
      `"${m.id}"`,
      `"${m.createdAt}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.type}"`,
      m.quantity,
      m.newQty,
      `"${(m.reason || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeBusiness?.name || "audit"}_movements.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      title="Audit Trail & Ledger"
      businessName={activeBusiness?.name || "My Business"}
      businessCategory={activeBusiness?.category || "RETAIL"}
      breadcrumbs={[{ label: "GramStock" }, { label: "Reports" }]}
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={exportAuditCSV}
          disabled={movements.length === 0}
          className="flex items-center gap-1.5 border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-sm disabled:opacity-40 px-2.5 sm:px-3 text-xs"
        >
          <Download size={14} className="text-[#1868ff]" />
          <span className="hidden sm:inline">Export Ledger</span>
          <span className="sm:hidden">Export</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-[var(--card)] border border-[var(--border)] shadow-xl transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1868ff] to-[#00d2ff] text-white flex items-center justify-center flex-shrink-0 shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
                Immutable Stock Movement Ledger
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Complete trace of every restock, checkout, and import operation for audit compliance.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAuditLog} className="rounded-xl">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync Ledger</span>
          </Button>
        </div>

        {/* Ledger Rows */}
        <Card className="p-6 rounded-[28px]">
          <div className="space-y-3">
            {loading ? (
              <div className="py-16 text-center text-[var(--text-muted)]">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#1868ff]" />
                <p className="text-xs font-semibold">Loading ledger records...</p>
              </div>
            ) : movements.length > 0 ? (
              movements.map((mov) => (
                <div
                  key={mov.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[#1868ff] flex-shrink-0">
                      <Store size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {mov.productName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        Reason: {mov.reason || "Manual audit adjustment"} • {formatDate(mov.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-auto">
                    <div className="text-right">
                      <p className="text-xs font-mono font-extrabold text-[var(--text-primary)]">
                        {mov.type === "SALE" || mov.type === "MANUAL_REDUCE" ? (
                          <span className="text-[#ff4b4b]">-{mov.quantity} units</span>
                        ) : (
                          <span className="text-[#10b981]">+{mov.quantity} units</span>
                        )}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">Previous: {mov.previousQty} → New: {mov.newQty}</p>
                    </div>

                    <Badge
                      variant={
                        mov.type === "IMPORT_INITIAL"
                          ? "primary"
                          : mov.type === "SALE" || mov.type === "MANUAL_REDUCE"
                          ? "coral"
                          : "success"
                      }
                      size="sm"
                    >
                      {mov.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                No ledger activity recorded yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
