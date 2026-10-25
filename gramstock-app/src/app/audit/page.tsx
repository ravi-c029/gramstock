"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useBusiness } from "@/lib/business-context";
import {
  ShieldAlert,
  Activity,
  User,
  Clock,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  Shield,
} from "lucide-react";

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  category?: string;
  businessId?: string;
  businessName?: string;
  details: string;
  resource?: string;
  status: "SUCCESS" | "FAILURE";
  latencyMs?: number;
  ipAddress?: string;
  cloudTrailEventId: string;
}

export default function AuditPage() {
  const { currentUser } = useBusiness();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.email === "admin@gramstock.cloud";

  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAuditLogs = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const res = await fetch("/api/audit?limit=100");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAuditLogs();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <AppShell
        title="AWS CloudTrail & Activity Monitor"
        breadcrumbs={[{ label: "Governance" }, { label: "CloudTrail & RUM" }]}
      >
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-xl">
            <Lock size={32} />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
            403 Forbidden — Super Admin Privilege Required
          </span>
          <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight mb-2">
            CloudTrail &amp; RUM Telemetry Restricted
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
            AWS CloudTrail and Real User Monitoring (RUM) stream raw telemetric events, tenant access logs, and KMS encryption metadata. To preserve strict tenant privacy, this dashboard is reserved exclusively for the platform overseer (<span className="text-[var(--text-primary)] font-bold">admin@gramstock.cloud</span>).
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-2xl bg-[#1868ff] hover:bg-[#0052e0] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Return to Store Dashboard</span>
            </Link>
            <Link
              href="/reports"
              className="px-5 py-2.5 rounded-2xl bg-[var(--surface-muted)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold transition-all"
            >
              <span>View Store Ledger</span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (filterUser !== "all" && log.userEmail.toLowerCase() !== filterUser.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.userEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.businessName && log.businessName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <AppShell
      title="AWS CloudTrail & Activity Monitor"
      breadcrumbs={[{ label: "Governance" }, { label: "CloudTrail & RUM" }]}
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchAuditLogs}
          disabled={loading}
          className="rounded-2xl gap-2 font-bold text-xs"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh Telemetry</span>
        </Button>
      }
    >
      <div className="space-y-6 pb-24">
        {/* Cloud Architecture Hero Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1830] via-[#091428] to-[#040b18] border border-white/15 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1868ff]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold backdrop-blur-md">
                <Activity size={14} className="text-emerald-400" />
                <span>
                  {isSuperAdmin
                    ? "AWS Multi-Tenant Governance & CloudTrail Event Stream"
                    : "AWS CloudTrail Store Partition & Real-Time Audit"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isSuperAdmin
                  ? "Enterprise Master Activity Governance"
                  : "My Store Activity & Audit Trail"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isSuperAdmin
                  ? "Platform Overseer View: Track all merchant operations across all store tenants, dataset uploads, stock changes, and authentication attempts in real time."
                  : `Strict Tenant Isolation Active: Every restock, dataset import, and login for your store (${currentUser?.email}) is cryptographically recorded. Other merchants cannot view your operations, and you cannot view theirs.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Region</p>
                <p className="font-extrabold text-white font-mono mt-0.5">ap-south-1 (Mumbai)</p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Access Scope</p>
                <p className="font-extrabold text-emerald-400 font-mono mt-0.5">
                  {isSuperAdmin ? "SUPER_ADMIN (ALL)" : "TENANT_SILO (ISOLATED)"}
                </p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Storage Encryption</p>
                <p className="font-extrabold text-cyan-400 font-mono mt-0.5">AWS KMS AES-256</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search audit actions, resources, logs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
            </div>

            {isSuperAdmin ? (
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)]"
              >
                <option value="all">All Users &amp; Merchants</option>
                <option value="gupta@kirana.cloud">Gupta Ji (Kirana)</option>
                <option value="apollo@pharmacy.cloud">Dr. Apollo (Pharmacy)</option>
                <option value="urban@threads.cloud">Vikram Threads (Garments)</option>
                <option value="bistro@cafe.cloud">Chef Marco (Cafe)</option>
                <option value="admin@gramstock.cloud">Cloud Architect Admin</option>
              </select>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Lock size={12} />
                <span>Isolated Store Silo: {currentUser?.email}</span>
              </div>
            )}
          </div>

          <Badge variant="outline" size="md">
            Showing {filteredLogs.length} Events
          </Badge>
        </div>

        {/* Audit Log Stream Table */}
        <Card className="overflow-hidden border border-[var(--border)] rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--surface-muted)]/70 border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Timestamp (UTC)</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Actor (Merchant)</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Action Event</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Action Details & Target Resource</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider">Latency</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider font-mono">CloudTrail Event ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-muted)]/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString("en-IN", {
                          hour12: true,
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{item.userName}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">{item.userEmail}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                            item.action === "USER_LOGIN"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : item.action === "IMPORT_DATASET"
                              ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                              : item.action === "ADJUST_STOCK"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}
                        >
                          {item.action}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <p className="text-[var(--text-primary)] font-medium leading-snug">{item.details}</p>
                          {item.resource && (
                            <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 truncate mt-0.5">
                              {item.resource}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[var(--text-secondary)] whitespace-nowrap">
                        {item.latencyMs ? `${item.latencyMs} ms` : "—"}
                      </td>

                      <td className="py-3 px-3">
                        <Badge variant="success" size="sm">
                          {item.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[140px]" title={item.cloudTrailEventId}>
                        {item.cloudTrailEventId.split("/").pop() || item.cloudTrailEventId}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-[var(--text-muted)]">
                      No audit events found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
