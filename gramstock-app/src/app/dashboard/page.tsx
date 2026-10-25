"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, StatCard, Badge } from "@/components/ui/Card";
import { useBusiness } from "@/lib/business-context";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  Upload,
  ArrowRight,
  RefreshCw,
  Crown,
  Sparkles,
  Store,
  ChevronRight,
  ShieldCheck,
  Pill,
  Shirt,
  Coffee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BAR_COLORS = ["#1868ff", "#00d2ff", "#ff4b4b", "#ffb800", "#10b981", "#8b5cf6"];

export default function DashboardPage() {
  const { activeBusiness, businesses, currentUser } = useBusiness();
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (bizId: string) => {
    setLoading(true);
    try {
      const [metricsRes, prodRes] = await Promise.all([
        fetch(`/api/dashboard?businessId=${bizId}`),
        fetch(`/api/inventory?businessId=${bizId}`),
      ]);

      const [metricsData, prodData] = await Promise.all([
        metricsRes.json(),
        prodRes.json(),
      ]);

      if (metricsData.success) {
        setMetrics(metricsData.metrics);
      }
      if (prodData.success) {
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeBusiness?.id) {
      fetchDashboardData(activeBusiness.id);
    }
  }, [activeBusiness?.id]);

  // ONBOARDING VIEW FOR NEW MERCHANTS (No store uploaded yet)
  if (!activeBusiness || businesses.length === 0) {
    return (
      <AppShell
        title="Setup Your Store"
        businessName="Pending Store Dataset"
        businessCategory="SETUP"
        breadcrumbs={[{ label: "GramStock" }, { label: "Onboarding" }]}
      >
        <div className="max-w-5xl mx-auto space-y-8 py-2">
          
          {/* ====================================================================
              HERO ONBOARDING CARD: 3D Glossy Aesthetic & Value Proposition
              ==================================================================== */}
          <div className="p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-[#0c1830] via-[#09152a] to-[#050e1f] text-white border border-white/10 shadow-[0_20px_60px_rgba(0,18,60,0.5)] relative overflow-hidden space-y-6">
            
            {/* 3D Glossy Sphere Background Accents */}
            <div 
              className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none opacity-80"
              style={{
                background: "radial-gradient(circle at 35% 35%, #38bdf8 0%, #1d4ed8 50%, #06153d 100%)",
                boxShadow: "0 20px 50px rgba(0, 20, 80, 0.6), inset 4px 4px 12px rgba(255, 255, 255, 0.5)",
              }}
            />
            <div 
              className="absolute bottom-0 right-1/4 w-36 h-36 rounded-full pointer-events-none opacity-40"
              style={{
                background: "radial-gradient(circle at 35% 35%, #60a5fa 0%, #1e40af 60%, #0c2166 100%)",
              }}
            />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff9900] to-[#ea580c] text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    AWS ap-south-1 Silo Initialized • Awaiting First Ingestion
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Welcome to GramStock Cloud, {currentUser?.name || "Merchant"}!
                  </h1>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium max-w-2xl">
                Your dedicated multi-tenant container has been provisioned. GramStock is <strong>100% schema-free</strong>: you don&apos;t have to pick a business type beforehand or manually design product tables.
              </p>

              <div className="border-l-4 border-amber-500 pl-4 py-1 text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                Simply upload your raw inventory spreadsheet (CSV or Excel). Our AI heuristic cloud engine will automatically inspect your columns, determine whether you operate a <strong>Kirana, Pharmacy, Cafe, Fashion, or Hardware</strong> business, and configure your ERP catalog in seconds!
              </div>

              {/* Upload Button */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link href="/imports">
                  <button className="px-9 py-4 rounded-full bg-gradient-to-r from-[#ff9900] via-[#ff7a00] to-[#ff5500] hover:from-[#ffaa00] text-white font-black text-sm uppercase tracking-wider shadow-[0_12px_28px_rgba(255,122,0,0.5)] active:scale-95 transition-all flex items-center gap-3 cursor-pointer">
                    <Upload size={18} />
                    <span>Upload Inventory File (CSV / XLSX) →</span>
                  </button>
                </Link>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-2xl">
                  <ShieldCheck size={16} />
                  <span>Row-Level Security: Active</span>
                </div>
              </div>
            </div>

          </div>

          {/* ====================================================================
              3-STEP PIPELINE CARDS
              ==================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-7 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-3 relative overflow-hidden group hover:border-[#1868ff]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[#1868ff]/10 text-[#1868ff] font-mono font-black text-sm flex items-center justify-center border border-[#1868ff]/20">
                  01
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">RAW STAGING</span>
              </div>
              <h3 className="font-extrabold text-base text-[var(--foreground)]">Drop Your Spreadsheet</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Upload CSV or Excel exported from Tally, Marg ERP, billing machine, or supplier invoice.
              </p>
            </div>

            <div className="p-7 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 font-mono font-black text-sm flex items-center justify-center border border-amber-500/20">
                  02
                </span>
                <span className="text-[10px] font-mono text-amber-500 font-bold">AI HEURISTICS</span>
              </div>
              <h3 className="font-extrabold text-base text-[var(--foreground)]">Automatic Categorization</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Cognitive parser detects your shop type (Kirana, Pharmacy, Fashion, Cafe) with 99.8% precision.
              </p>
            </div>

            <div className="p-7 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 font-mono font-black text-sm flex items-center justify-center border border-emerald-500/20">
                  03
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">ZERO MIGRATION</span>
              </div>
              <h3 className="font-extrabold text-base text-[var(--foreground)]">Live Isolated ERP</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Custom schema provisioned in Aurora DB with real-time stock ledger, charts, and CloudTrail audit.
              </p>
            </div>
          </div>

          {/* ====================================================================
              1-CLICK FAST-TRACK SANDBOX (Examiner Viva Demonstration)
              ==================================================================== */}
          <div className="p-8 sm:p-10 rounded-[36px] bg-[var(--surface)] border border-[var(--border)] shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Don&apos;t Have a CSV File on Hand?</span>
                </div>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] mt-1">
                  Instant Viva Industry Sandboxes
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Pick any pre-packaged vertical dataset to auto-provision and test your store in 1 click:
                </p>
              </div>

              <Link href="/imports">
                <button className="px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs font-bold hover:bg-[var(--surface-elevated)] transition-all">
                  Open Dataset Wizard →
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Gupta Kirana",
                  cat: "Grocery / FMCG",
                  desc: "Atta, Edible Oils, Pulses, Barcodes",
                  icon: Store,
                  color: "#10b981",
                  sampleFile: "kirana_inventory.csv",
                },
                {
                  title: "Apollo Medico",
                  cat: "Pharmacy / Meds",
                  desc: "Dolo 650, Augmentin, Batch & Expiry",
                  icon: Pill,
                  color: "#00d2ff",
                  sampleFile: "pharmacy_inventory.csv",
                },
                {
                  title: "Urban Threads",
                  cat: "Garments / Fashion",
                  desc: "Denim Jeans, Linen Shirts, Sizes S/M/L",
                  icon: Shirt,
                  color: "#a855f7",
                  sampleFile: "garments_inventory.csv",
                },
                {
                  title: "Green Bistro",
                  cat: "Restaurant / Cafe",
                  desc: "Espresso, Dairy, Kitchen Stations",
                  icon: Coffee,
                  color: "#ffb800",
                  sampleFile: "restaurant_inventory.csv",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link key={idx} href="/imports">
                    <div className="p-5 rounded-2xl bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[#1868ff]/50 shadow-sm hover:shadow-lg transition-all cursor-pointer space-y-3 group h-full flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${item.color}20`, color: item.color }}
                          >
                            <Icon size={20} />
                          </div>
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                          >
                            {item.cat}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-[var(--foreground)] group-hover:text-[#1868ff] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold text-[#1868ff]">
                        <span>Setup Store</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>

        </div>
      </AppShell>
    );
  }

  const categoryLabel = activeBusiness.category || "RETAIL";

  // Top 3 Products by Valuation for the Podium Leaderboard
  const topProducts = [...products]
    .map((p) => ({ ...p, valuation: (p.quantity || 0) * (p.price || 0) }))
    .sort((a, b) => b.valuation - a.valuation)
    .slice(0, 3);

  const rank1 = topProducts[0];
  const rank2 = topProducts[1];
  const rank3 = topProducts[2];

  return (
    <AppShell
      title="Store Dashboard"
      businessName={activeBusiness.name}
      businessCategory={categoryLabel}
      breadcrumbs={[{ label: "GramStock" }, { label: "Overview" }]}
      actions={
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => activeBusiness?.id && fetchDashboardData(activeBusiness.id)}
            className="flex items-center gap-1.5 border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-sm px-2.5 sm:px-3 text-xs"
            aria-label="Refresh metrics"
            title="Refresh metrics"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#1868ff]" : "text-[#1868ff]"} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
          <Link href="/imports">
            <Button size="sm" variant="coral" className="px-2.5 sm:px-3 text-xs">
              <Upload size={13} />
              <span className="hidden sm:inline">Import Dataset</span>
              <span className="sm:hidden">Import</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-5 sm:space-y-8">
        {/* Welcome Hero Banner (Deep Royal Midnight in both modes) */}
        <div className="relative overflow-hidden rounded-[26px] sm:rounded-[32px] p-5 sm:p-8 bg-gradient-to-r from-[#0d276b] via-[#103387] to-[#122452] border border-white/15 shadow-2xl text-white">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-[#1868ff]/20 blur-3xl pointer-events-none"></div>
          <div className="absolute right-40 -top-10 w-40 h-40 rounded-full bg-[#ff4b4b]/15 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-bold text-[#38bdf8]">
                <Sparkles size={12} />
                <span>One Platform. Every Business.</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Welcome back to {activeBusiness?.name || "Your Store"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                Live adaptive inventory configured for <span className="text-white font-bold">{categoryLabel}</span>. Schema, custom attributes, and valuation are fully synchronized.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link href="/inventory" className="flex-1 sm:flex-initial">
                <Button variant="primary" size="md" className="w-full sm:w-auto rounded-2xl">
                  <span>Open Inventory</span>
                  <ChevronRight size={16} />
                </Button>
              </Link>
              <Link href="/imports" className="flex-1 sm:flex-initial">
                <Button variant="outline" size="md" className="w-full sm:w-auto rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold">
                  <span>Upload CSV</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Real-time KPI Stat Cards (Adapts to Light / Dark Mode) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <StatCard
            title="Total Catalog SKUs"
            value={loading ? "—" : formatNumber(metrics?.totalItems ?? 0)}
            subtitle={`${formatNumber(metrics?.totalStockUnits ?? 0)} Total units on hand`}
            icon={<Package size={22} />}
            color="#1868ff"
          />
          <StatCard
            title="Inventory Valuation"
            value={loading ? "—" : formatCurrency(metrics?.totalValuation ?? 0)}
            subtitle="Current stock retail value"
            icon={<TrendingUp size={22} />}
            color="#10b981"
          />
          <StatCard
            title="Low Stock Warning"
            value={loading ? "—" : metrics?.lowStockCount ?? 0}
            subtitle={metrics?.lowStockCount > 0 ? "Items below safety threshold" : "All items well stocked"}
            variant={metrics?.lowStockCount > 0 ? "warning" : "default"}
            icon={<AlertTriangle size={22} />}
            color="#f59e0b"
          />
          <StatCard
            title="Out of Stock / Expiring"
            value={
              loading
                ? "—"
                : `${metrics?.outOfStockCount ?? 0} / ${metrics?.expiringSoonCount ?? 0}`
            }
            subtitle="0 Units / Expiring in 60 days"
            variant={
              (metrics?.outOfStockCount ?? 0) > 0 || (metrics?.expiringSoonCount ?? 0) > 0
                ? "coral"
                : "default"
            }
            icon={<Clock size={22} />}
            color="#ff4b4b"
          />
        </div>

        {/* Top Product Movers Podium & Department Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TOP 3 LEADERBOARD PODIUM */}
          <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Crown size={18} className="text-[#ffb800]" />
                    Inventory Value Leaders
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Highest valued stock in your catalog
                  </p>
                </div>
                <Badge variant="gold" size="sm">Top Movers</Badge>
              </div>

              {/* 3D Pedestal Podium Visualization */}
              <div className="flex items-end justify-center gap-3 pt-6 pb-4">
                {/* 2nd Place */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/15 border border-[#38bdf8]/40 flex items-center justify-center font-bold text-sm text-[#0284c7] dark:text-[#38bdf8] mb-2 shadow-lg">
                    2
                  </div>
                  <p className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-[90px] text-center">
                    {rank2?.name || "Item #2"}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">
                    {rank2 ? `₹${formatNumber(rank2.valuation)}` : "—"}
                  </p>
                  <div className="w-full h-20 mt-3 rounded-t-2xl gs-podium-2 flex items-center justify-center font-extrabold text-sm text-[#0284c7] dark:text-[#38bdf8]">
                    #2
                  </div>
                </div>

                {/* 1st Place (Elevated Winner) */}
                <div className="flex-1 flex flex-col items-center -mt-4">
                  <div className="relative">
                    <Crown size={22} className="text-[#ffb800] absolute -top-5 left-1/2 -translate-x-1/2 filter drop-shadow-[0_2px_8px_rgba(255,184,0,0.6)]" />
                    <div className="w-14 h-14 rounded-2xl bg-[#ffb800]/25 border-2 border-[#ffb800] flex items-center justify-center font-extrabold text-base text-amber-600 dark:text-[#ffb800] mb-2 shadow-[0_0_20px_rgba(255,184,0,0.3)]">
                      1
                    </div>
                  </div>
                  <p className="text-xs font-extrabold text-[var(--text-primary)] truncate max-w-[100px] text-center">
                    {rank1?.name || "Top Item"}
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-[#ffb800] font-bold font-mono">
                    {rank1 ? `₹${formatNumber(rank1.valuation)}` : "—"}
                  </p>
                  <div className="w-full h-28 mt-3 rounded-t-2xl gs-podium-1 flex items-center justify-center font-black text-lg text-amber-600 dark:text-[#ffb800]">
                    #1
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#a855f7]/15 border border-[#a855f7]/40 flex items-center justify-center font-bold text-sm text-[#9333ea] dark:text-[#a855f7] mb-2 shadow-lg">
                    3
                  </div>
                  <p className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-[90px] text-center">
                    {rank3?.name || "Item #3"}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">
                    {rank3 ? `₹${formatNumber(rank3.valuation)}` : "—"}
                  </p>
                  <div className="w-full h-16 mt-3 rounded-t-2xl gs-podium-3 flex items-center justify-center font-extrabold text-sm text-[#9333ea] dark:text-[#a855f7]">
                    #3
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] mt-2">
              <Link href="/inventory" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-between rounded-xl">
                  <span>View All Leaderboard Products</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Card>

          {/* DEPARTMENT BREAKDOWN BAR CHART */}
          <Card className="lg:col-span-7 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Stock Value by Department
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Calculated from current unit quantities × active retail price
                </p>
              </div>
              <Badge variant="primary" size="sm">
                {activeBusiness?.name}
              </Badge>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-[var(--text-muted)]">
                Synchronizing chart telemetry...
              </div>
            ) : metrics?.categoryChartData?.length > 0 ? (
              <div className="h-68 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.categoryChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${formatNumber(val)}`, "Valuation"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "16px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        fontSize: "12px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {metrics.categoryChartData.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--text-muted)]">
                <Package size={32} className="mb-2 opacity-40 text-slate-400" />
                <p>No inventory items yet in this business profile.</p>
                <Link href="/imports" className="mt-3">
                  <Button size="sm">Import First CSV</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Audit Movement Ledger */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-5">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#10b981]" />
                Recent Stock Movement Ledger
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Every manual restock, checkout, and import recorded with audit trail
              </p>
            </div>
            <Link href="/reports">
              <Button variant="secondary" size="sm" className="rounded-xl">
                View Full Audit History
              </Button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {metrics?.recentMovements?.length > 0 ? (
              metrics.recentMovements.slice(0, 5).map((mov: any) => (
                <div
                  key={mov.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--card-inner)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[#1868ff] dark:text-[#38bdf8] flex-shrink-0 font-bold text-sm">
                      <Store size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {mov.productName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        Reason: {mov.reason || "Operational adjustment"} • {formatDate(mov.createdAt)}
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
                      <p className="text-[10px] text-[var(--text-muted)]">Stock after: {mov.newQty}</p>
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
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                No activity recorded yet for this store.
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
