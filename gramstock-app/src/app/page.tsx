"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import {
  Upload,
  BarChart3,
  Package,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Store,
  Pill,
  Coffee,
  Shirt,
  Wrench,
  CheckCircle2,
  Layers,
  Sun,
  Moon,
  Clock,
  Database,
  Cloud,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  Activity,
  Server,
  Plus,
  Minus,
  Check,
  Search,
  ExternalLink,
  Laptop,
  Users,
} from "lucide-react";

// ============================================================================
// STORE VERTICAL DATA FOR INTERACTIVE SIMULATOR
// ============================================================================
interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  specialField: string;
  specialValue: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Optimal";
}

interface VerticalCategory {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  shortLabel: string;
  subtitle: string;
  badge: string;
  color: string;
  accentGradient: string;
  description: string;
  schemaFields: string[];
  sampleItems: CatalogItem[];
  defaultRoleEmail: string;
}

const CATEGORIES: VerticalCategory[] = [
  {
    id: "grocery",
    icon: Store,
    label: "Kirana / Grocery",
    shortLabel: "Kirana • FMCG",
    subtitle: "Fast-Moving FMCG, Grains & Staples",
    badge: "FMCG Fast-Turn",
    color: "#10b981",
    accentGradient: "from-[#10b981] to-[#059669]",
    description: "Daily food essentials, edible oils, pulses, packaged goods with fast barcode lookups, packaged dates, and expiry date monitoring.",
    schemaFields: ["Barcode (EAN-13)", "Weight / Volume", "MRP vs Retail Price", "Expiry Month", "Fast-Moving Tag"],
    defaultRoleEmail: "gupta@kirana.cloud",
    sampleItems: [
      { id: "k1", name: "Fortune Sunlite Sunflower Oil 1L", sku: "FMCG-OIL-01", specialField: "Expiry", specialValue: "18 Nov 2026", price: 145, stock: 48, status: "In Stock" },
      { id: "k2", name: "Aashirvaad Shudh Chakki Atta 10kg", sku: "FMCG-ATT-10", specialField: "Weight", specialValue: "10.0 kg", price: 420, stock: 26, status: "In Stock" },
      { id: "k3", name: "Tata Salt Vacuum Evaporated 1kg", sku: "FMCG-SLT-01", specialField: "Batch", specialValue: "TAT-B99", price: 28, stock: 8, status: "Low Stock" },
    ],
  },
  {
    id: "medical",
    icon: Pill,
    label: "Medical / Pharmacy",
    shortLabel: "Pharmacy • Batch & Rx",
    subtitle: "Batch Numbers, Expiry Dates & Schedule H",
    badge: "Batch & Expiry Safe",
    color: "#00d2ff",
    accentGradient: "from-[#00d2ff] to-[#0284c7]",
    description: "Prescription drugs, blister strips, regulatory compliance warnings, manufacturer lot codes, and near-expiry stock quarantine.",
    schemaFields: ["Batch / Lot Number", "Expiry Date (MM/YY)", "Schedule H Rx Alert", "Dosage Form", "Manufacturer"],
    defaultRoleEmail: "apollo@medico.cloud",
    sampleItems: [
      { id: "m1", name: "Dolo 650mg Paracetamol Tablets", sku: "MED-DOL-650", specialField: "Batch / Expiry", specialValue: "BT-9921 • Apr 2027", price: 34, stock: 120, status: "Optimal" },
      { id: "m2", name: "Augmentin 625 Duo Antibiotic", sku: "MED-AUG-625", specialField: "Schedule H", specialValue: "Rx Required", price: 215, stock: 14, status: "Low Stock" },
      { id: "m3", name: "Volini Pain Relief Gel 75g", sku: "MED-VOL-075", specialField: "Batch / Expiry", specialValue: "VL-3012 • Dec 2026", price: 165, stock: 52, status: "In Stock" },
    ],
  },
  {
    id: "restaurant",
    icon: Coffee,
    label: "Restaurant / Cafe",
    shortLabel: "Cafe • Perishables",
    subtitle: "Kitchen Stations, Prep Units & Shelf Life",
    badge: "Kitchen Par-Level",
    color: "#ffb800",
    accentGradient: "from-[#ffb800] to-[#ea580c]",
    description: "Perishable pantry stocks, dairy crates, kitchen prep par levels, shelf life in days, and portion measurement units.",
    schemaFields: ["Kitchen Station", "Shelf Life (Days)", "Par-Level Threshold", "Storage Temp (°C)", "Perishable Alert"],
    defaultRoleEmail: "bistro@green.cloud",
    sampleItems: [
      { id: "r1", name: "Amul Fresh Cream 1L Tetrapack", sku: "CAF-CRM-01", specialField: "Shelf Life", specialValue: "3 Days Left", price: 210, stock: 18, status: "In Stock" },
      { id: "r2", name: "Arabica Coffee Roasted Beans 1kg", sku: "CAF-ARB-01", specialField: "Station", specialValue: "Barista Counter", price: 850, stock: 6, status: "Low Stock" },
      { id: "r3", name: "Diced Mozzarella Pizza Cheese 2kg", sku: "CAF-CHS-02", specialField: "Storage", specialValue: "Chill 4°C", price: 740, stock: 24, status: "Optimal" },
    ],
  },
  {
    id: "garments",
    icon: Shirt,
    label: "Garments / Fashion",
    shortLabel: "Fashion • Matrix SKU",
    subtitle: "Size Matrices, Colorways & Fabric Compositions",
    badge: "Variants Matrix",
    color: "#a855f7",
    accentGradient: "from-[#a855f7] to-[#7c3aed]",
    description: "Apparel matrices with S/M/L/XL sizing, seasonal color collections, fabric blends, gender tags, and fast SKU variant tracking.",
    schemaFields: ["Size Grid (S/M/L/XL)", "Colorway Code", "Fabric Material", "Gender / Fit", "Seasonal Drop"],
    defaultRoleEmail: "urban@threads.cloud",
    sampleItems: [
      { id: "g1", name: "Slim Fit Stretch Denim Jeans", sku: "GAR-DNM-32", specialField: "Size / Color", specialValue: "32 • Dark Indigo", price: 1499, stock: 35, status: "In Stock" },
      { id: "g2", name: "Pure Linen Casual Shirt Full Sleeve", sku: "GAR-SHR-04", specialField: "Size / Color", specialValue: "L • Olive Green", price: 1850, stock: 9, status: "Low Stock" },
      { id: "g3", name: "Organic Cotton Crewneck T-Shirt", sku: "GAR-TEE-01", specialField: "Size / Color", specialValue: "M • Jet Black", price: 699, stock: 64, status: "Optimal" },
    ],
  },
  {
    id: "retail",
    icon: Wrench,
    label: "Hardware & Tools",
    shortLabel: "Hardware • Warranty",
    subtitle: "Serial Numbers, Warranty Tracking & Aisle Bins",
    badge: "Warranty & Racks",
    color: "#ff4b4b",
    accentGradient: "from-[#ff4b4b] to-[#dc2626]",
    description: "Industrial machine tools, hardware spares, manufacturer warranty registrations, bin/aisle locations, and dynamic restock triggers.",
    schemaFields: ["Serial Number", "Warranty Period", "Aisle / Bin Rack", "Supplier Code", "Minimum Safety Stock"],
    defaultRoleEmail: "hardware@retail.cloud",
    sampleItems: [
      { id: "h1", name: "Bosch GSB 550W Impact Drill Machine", sku: "HRD-DRL-55", specialField: "Warranty", specialValue: "12 Months OEM", price: 2899, stock: 15, status: "In Stock" },
      { id: "h2", name: "Taparia Chrome Socket Wrench Set 24pc", sku: "HRD-TAP-24", specialField: "Bin Location", specialValue: "Aisle 3 • Rack B", price: 1650, stock: 4, status: "Low Stock" },
      { id: "h3", name: "Stanley Heavy Duty Steel Tape 5m", sku: "HRD-STN-05", specialField: "Stock Unit", specialValue: "Pack of 1", price: 290, stock: 38, status: "Optimal" },
    ],
  },
];

// ============================================================================
// CLOUD ARCHITECTURE NODES (For Examiner Demonstration)
// ============================================================================
const CLOUD_PIPELINE = [
  {
    step: "01",
    name: "Dataset Ingestion",
    tech: "Amazon S3 ap-south-1",
    desc: "Raw CSV/Excel files are encrypted in flight with TLS 1.3 and stored in immutable AWS S3 buckets in Mumbai.",
    metric: "SSE-KMS 256-bit",
  },
  {
    step: "02",
    name: "Cognitive Parser",
    tech: "Heuristic AI Engine",
    desc: "Infers column types, classifies store category, detects date formats, and validates pricing math.",
    metric: "P99 < 450ms",
  },
  {
    step: "03",
    name: "Tenant Isolation",
    tech: "Aurora PostgreSQL RLS",
    desc: "Row-Level Security enforces zero cross-talk. Kirana merchants can never view Pharmacy or Garments data.",
    metric: "100% Cryptographic Silo",
  },
  {
    step: "04",
    name: "Audit & Telemetry",
    tech: "CloudWatch & Trail",
    desc: "Every inventory adjustment, restock, checkout, and login attempt is logged permanently in an immutable ledger.",
    metric: "Zero-Trust Trail",
  },
];

export default function LandingPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState("grocery");
  
  // Interactive stock tracker inside simulator preview
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategoryId) || CATEGORIES[0];

  const handleAdjustStock = (itemId: string, delta: number) => {
    setStockOverrides((prev) => {
      const current = prev[itemId] !== undefined 
        ? prev[itemId] 
        : (activeCategory.sampleItems.find((i) => i.id === itemId)?.stock || 10);
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#1868ff] selection:text-white transition-colors duration-250 font-sans overflow-x-hidden">
      
      {/* ========================================================================
          TOP NAVIGATION BAR (Inspired by Reference Images 1 & 2)
          ======================================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--topbar-bg)] border-b border-[var(--border)] transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1868ff] via-[#0284c7] to-[#00d2ff] flex items-center justify-center shadow-[0_4px_18px_rgba(24,104,255,0.4)] group-hover:scale-105 transition-transform">
              <Layers size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[var(--foreground)]">GramStock</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1868ff] text-white tracking-widest shadow-sm">
                  CLOUD
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">
                Multi-Tenant Inventory ERP
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-8 ml-8 text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase">
            <a href="#hero" className="hover:text-[#1868ff] transition-colors">Home</a>
            <a href="#verticals" className="hover:text-[#1868ff] transition-colors">Store Simulator</a>
            <a href="#cloud-architecture" className="hover:text-[#1868ff] transition-colors">Cloud Architecture</a>
            <a href="#how-it-works" className="hover:text-[#1868ff] transition-colors">Onboarding</a>
            <Link href="/reports" className="hover:text-[#1868ff] transition-colors">Audit Ledger</Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Segmented Light/Dark Switch */}
            <div className="flex items-center p-1 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] shadow-inner">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all",
                  resolvedTheme === "light"
                    ? "bg-white text-[#1868ff] shadow-md font-extrabold scale-100"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="Switch to Light Mode"
              >
                <Sun size={13} className={resolvedTheme === "light" ? "text-[#f59e0b]" : "text-[var(--text-muted)]"} />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all",
                  resolvedTheme === "dark"
                    ? "bg-[#1868ff] text-white shadow-md font-extrabold scale-100"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="Switch to Dark Mode"
              >
                <Moon size={13} className={resolvedTheme === "dark" ? "text-white" : "text-[var(--text-muted)]"} />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>

            {/* Pill "SIGN IN" Button */}
            <Link href="/login">
              <button className="px-5 sm:px-7 py-2.5 rounded-full bg-[#1868ff] hover:bg-[#0d54df] text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(24,104,255,0.45)] hover:shadow-[0_6px_22px_rgba(24,104,255,0.6)] active:scale-95 transition-all">
                Sign In
              </button>
            </Link>

            {/* Direct Launch App */}
            <Link href="/dashboard" className="hidden sm:block">
              <button className="px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)] font-bold text-xs hover:bg-[var(--surface-elevated)] transition-all">
                Live Store →
              </button>
            </Link>
          </div>
        </div>

        {/* Fluid Blue Accent Bubble on Top-Right Header */}
        <div 
          className="absolute top-0 right-0 w-48 sm:w-72 h-20 pointer-events-none opacity-20 dark:opacity-10 bg-gradient-to-l from-[#00d2ff] to-transparent" 
          style={{ borderBottomLeftRadius: "60px" }}
        />
      </header>

      {/* ========================================================================
          HERO SECTION (High-Fidelity Replica of Reference Images 1 & 2)
          ======================================================================== */}
      <section id="hero" className="relative pt-6 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-tr from-[#1868ff]/12 via-[#00d2ff]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Hero Container Card */}
          <div className="relative rounded-[36px] sm:rounded-[48px] bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-6 sm:p-10 lg:p-14 overflow-hidden">
            
            {/* Top-Right Decorative Fluid Organic Shape */}
            <div 
              className="absolute -top-10 -right-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-[#1868ff] to-[#00d2ff] opacity-80 rounded-full blur-xl pointer-events-none -z-0"
            />
            <div 
              className="absolute top-0 right-0 w-40 sm:w-60 h-40 sm:h-60 bg-gradient-to-b from-[#0284c7] to-[#1868ff] rounded-bl-[120px] pointer-events-none opacity-20"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
              
              {/* LEFT COLUMN: Organic Fluid Blob with 3D Isometric Warehouse Scene */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-full max-w-lg">
                  
                  {/* Organic Fluid Blob Shape */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-tr from-[#1868ff] via-[#0284c7] to-[#00d2ff] opacity-95 shadow-[0_24px_70px_rgba(24,104,255,0.45)]"
                    style={{
                      borderRadius: "44% 56% 62% 38% / 48% 46% 54% 52%",
                      transform: "scale(1.06)",
                    }}
                  />

                  {/* Secondary Fluid Wave Ring */}
                  <div 
                    className="absolute inset-0 border-2 border-white/30"
                    style={{
                      borderRadius: "50% 50% 40% 60% / 60% 40% 60% 40%",
                      transform: "scale(1.12) rotate(-6deg)",
                    }}
                  />

                  {/* Foreground 3D Isometric Illustration */}
                  <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/20 bg-white dark:bg-[#071329]">
                    <img
                      src="/hero-warehouse.jpg"
                      alt="Smart Warehouse Fulfillment & Logistics Cloud"
                      className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                    />

                    {/* Floating 24h Clock Badge (Screenshot 1) */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/30 text-xs font-black">
                      <Clock size={14} className="animate-spin-slow" />
                      <span>24/7 Cloud Sync</span>
                    </div>

                    {/* Floating Weight / Scale Metric Badge */}
                    <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl text-xs font-mono font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>AWS S3 Ingest: ACTIVE</span>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-[var(--surface-elevated)] border border-[var(--border)] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 z-20">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      🔒
                    </div>
                    <div>
                      <div className="text-[11px] font-extrabold text-[var(--foreground)]">Tenant Isolation</div>
                      <div className="text-[9px] text-[var(--text-muted)] font-medium">Row-Level Database Security</div>
                    </div>
                  </div>

                  <div className="absolute -top-4 -right-4 sm:-right-6 bg-[var(--surface-elevated)] border border-[var(--border)] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 z-20">
                    <div className="w-8 h-8 rounded-xl bg-[#1868ff]/20 text-[#38bdf8] flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="text-[11px] font-extrabold text-[var(--foreground)]">99.98% SLA</div>
                      <div className="text-[9px] text-[var(--text-muted)] font-medium">Amazon CloudWatch Monitored</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Bold Typography & Action Callouts */}
              <div className="lg:col-span-6 flex flex-col items-start space-y-6">
                
                {/* Category Pill Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1868ff]/10 border border-[#1868ff]/25 text-xs font-extrabold text-[#1868ff] dark:text-[#38bdf8]">
                  <Sparkles size={14} className="text-[#ff9900]" />
                  <span>INTELLIGENT ADAPTIVE SAAS PLATFORM</span>
                </div>

                {/* Big Headline in Two Harmonious Tones */}
                <div className="space-y-1">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#ff7a00] uppercase leading-none">
                    WHOLESALE & RETAIL
                  </h1>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0284c7] dark:text-[#38bdf8] tracking-tight leading-tight">
                    Inventory Cloud
                  </h2>
                </div>

                {/* Description with Vertical Amber Pipe */}
                <div className="border-l-4 border-[#ff9900] pl-4 py-1 text-sm sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed max-w-xl">
                  One cloud system tailored for every shopkeeper. Drop your raw spreadsheet or CSV file — our AI Ingestion Engine maps columns, automatically provisions schema fields, and isolates your tenant catalog with zero setup hassle.
                </div>

                {/* Key Value Proposition Bullets */}
                <div className="grid grid-cols-2 gap-3 w-full pt-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Kirana, Pharma, Fashion, Cafe</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Zero Schema Migration Effort</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Amazon S3 Mumbai Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>Immutable Audit Log Trail</span>
                  </div>
                </div>

                {/* Prominent Golden Amber CTA Pill Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 w-full sm:w-auto">
                  <Link href="/imports">
                    <button className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-[#ff9900] via-[#ff7a00] to-[#ff5500] hover:from-[#ffaa00] hover:to-[#ff6600] text-white font-black text-sm tracking-wider uppercase shadow-[0_12px_28px_rgba(255,122,0,0.45)] hover:shadow-[0_16px_36px_rgba(255,122,0,0.6)] active:scale-95 transition-all flex items-center justify-center gap-3">
                      <Upload size={18} />
                      <span>Import Dataset Now</span>
                      <ArrowRight size={18} />
                    </button>
                  </Link>

                  <Link href="/dashboard">
                    <button className="w-full sm:w-auto px-7 py-4 rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--foreground)] font-extrabold text-sm tracking-wide transition-all flex items-center justify-center gap-2">
                      <span>Explore Live Demo</span>
                      <ChevronRight size={16} />
                    </button>
                  </Link>
                </div>

                {/* Preloaded Tenants Note */}
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pt-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Preloaded with Gupta Kirana, Apollo Pharmacy & Urban Threads demo stores.</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================
          SWEEPING ORGANIC FLUID WAVE TRANSITION (Inspired by Reference Image 2)
          ======================================================================== */}
      <div className="relative -mt-10 mb-[-1px] text-[var(--surface-muted)]/40 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-14 sm:h-24">
          <path
            d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,58.7C672,43,768,21,864,21.3C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* ========================================================================
          SECTION: INTERACTIVE 5-STORE POS SIMULATOR (Redesigned Ultra-Modern)
          Elevates the previous boxy cards into an interactive live ERP console!
          ======================================================================== */}
      <section id="verticals" className="py-16 sm:py-24 bg-[var(--surface-muted)]/40 border-b border-[var(--border)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1868ff]/10 text-xs font-extrabold text-[#1868ff] uppercase tracking-wider border border-[#1868ff]/20">
              <Sparkles size={14} className="text-[#ff9900]" />
              <span>SCHEMA-FREE ADAPTIVE ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
              One Cloud Engine. Five Tailored Experiences.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
              Kirana needs fast barcode lookups. Pharmacy mandates lot numbers and expiry warnings. GramStock adapts schema fields automatically based on your dataset headers.
            </p>
          </div>

          {/* SLEEK FLOATING CAPSULE SEGMENTED SELECTOR DOCK */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 sm:p-2 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-x-auto max-w-full scrollbar-none gap-1 sm:gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer",
                      isSelected
                        ? "bg-gradient-to-r text-white shadow-lg scale-102"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
                    )}
                    style={{
                      backgroundImage: isSelected ? `linear-gradient(135deg, ${cat.color}, #0d54df)` : undefined,
                    }}
                  >
                    <Icon size={18} className={isSelected ? "text-white" : ""} />
                    <span>{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ====================================================================
              MODERN INTERACTIVE ERP SIMULATOR CANVAS (Mac-Style App Window)
              ==================================================================== */}
          <div className="rounded-[36px] bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden">
            
            {/* Window Title Bar */}
            <div className="px-6 py-4 bg-[var(--surface-muted)]/70 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* 3 Mac Dots */}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                </div>
                <div className="h-4 w-px bg-[var(--border)] mx-1" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                    GramStock Cloud Terminal:
                  </span>
                  <span 
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${activeCategory.color}20`, color: activeCategory.color }}
                  >
                    {activeCategory.label}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AWS ap-south-1 Live Ingest
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:inline">
                  Conf: 99.8% Match
                </span>
              </div>
            </div>

            {/* Split Content: Schema Spec (Left) + Interactive POS Table (Right) */}
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Dynamic Schema DNA */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                      style={{ backgroundColor: `${activeCategory.color}20`, color: activeCategory.color }}
                    >
                      <activeCategory.icon size={26} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[var(--foreground)]">
                        {activeCategory.label}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-bold">
                        {activeCategory.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium pt-2">
                    {activeCategory.description}
                  </p>
                </div>

                {/* Auto-Mapped Schema Attributes */}
                <div className="space-y-2.5 pt-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Dynamic Schema Columns Inferred:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeCategory.schemaFields.map((field, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition-all"
                        style={{
                          backgroundColor: `${activeCategory.color}10`,
                          borderColor: `${activeCategory.color}35`,
                          color: activeCategory.color,
                        }}
                      >
                        <Check size={12} />
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Isolation & Security Spec */}
                <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[var(--text-muted)]">Tenant Database Isolation:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Lock size={12} /> Row-Level Security
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[var(--text-muted)]">Encrypted Storage:</span>
                    <span className="font-mono text-[#38bdf8]">AWS KMS SSE-256</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[var(--text-muted)]">Audit Logging:</span>
                    <span className="text-emerald-400">CloudTrail Immutable</span>
                  </div>
                </div>

                {/* Launch Demo Button */}
                <div className="pt-2">
                  <Link href="/dashboard">
                    <button 
                      className="w-full py-4 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${activeCategory.color}, #1868ff)`,
                      }}
                    >
                      <Sparkles size={16} />
                      <span>Launch {activeCategory.label} Live Demo →</span>
                    </button>
                  </Link>
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive Live POS Simulator Table */}
              <div className="lg:col-span-7 bg-[var(--surface-muted)]/60 rounded-3xl border border-[var(--border)] p-5 sm:p-6 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                      Live Catalog POS Simulator
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Click <strong className="text-[var(--foreground)]">[+]</strong> or <strong className="text-[var(--foreground)]">[-]</strong> to test instant stock quantity adjustments
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Live Reactive State
                  </span>
                </div>

                {/* Simulator Rows */}
                <div className="space-y-3">
                  {activeCategory.sampleItems.map((item) => {
                    const currentStock = stockOverrides[item.id] !== undefined ? stockOverrides[item.id] : item.stock;
                    const isLow = currentStock <= 10;
                    return (
                      <div 
                        key={item.id}
                        className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1868ff]/40 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[var(--foreground)]">
                              {item.name}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                            <span className="font-mono bg-[var(--surface-muted)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                              {item.sku}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-[#1868ff] dark:text-[#38bdf8]">
                              {item.specialField}: {item.specialValue}
                            </span>
                          </div>
                        </div>

                        {/* Price & Interactive Quantity Counter */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <div className="text-right">
                            <div className="font-mono font-black text-sm text-[var(--foreground)]">
                              ₹{item.price}
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5",
                              isLow ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            )}>
                              {isLow ? "Low Stock" : "In Stock"}
                            </span>
                          </div>

                          {/* +/- Stepper Buttons */}
                          <div className="flex items-center gap-2 bg-[var(--surface-muted)] p-1 rounded-xl border border-[var(--border)]">
                            <button
                              onClick={() => handleAdjustStock(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-[var(--surface)] hover:bg-red-500/20 hover:text-red-400 text-[var(--text-muted)] flex items-center justify-center transition-all cursor-pointer"
                              title="Decrease stock"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center font-mono font-black text-xs text-[var(--foreground)]">
                              {currentStock}
                            </span>
                            <button
                              onClick={() => handleAdjustStock(item.id, +1)}
                              className="w-7 h-7 rounded-lg bg-[var(--surface)] hover:bg-emerald-500/20 hover:text-emerald-400 text-[var(--text-muted)] flex items-center justify-center transition-all cursor-pointer"
                              title="Restock quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Footer Insight */}
                <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
                  <span className="flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-400" />
                    <span>Real-time adjustments stream to AWS CloudTrail ledger</span>
                  </span>
                  <Link href="/inventory" className="text-[#1868ff] font-bold hover:underline flex items-center gap-1">
                    <span>Full Catalog</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================
          CLOUD ARCHITECTURE & AWS TOPOLOGY (Examiner Viva Answers!)
          ======================================================================== */}
      <section id="cloud-architecture" className="py-16 sm:py-24 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-[#1868ff]/10 via-[#00d2ff]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-xs font-extrabold text-emerald-500 uppercase tracking-wider border border-emerald-500/20">
              <Cloud size={14} />
              <span>CLOUD INFRASTRUCTURE BLUEPRINT</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
              Enterprise Cloud Backbone
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
              Engineered with AWS architectural principles for sub-second ingestion, fault tolerance, and zero cross-tenant data leakage.
            </p>
          </div>

          {/* Connected Topology Pipeline Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {CLOUD_PIPELINE.map((node, idx) => (
              <div 
                key={node.step}
                className="p-7 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] shadow-xl hover:border-[#1868ff]/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 relative group"
              >
                {/* Step Pill */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-[#1868ff]/10 text-[#1868ff] font-mono font-black text-xs flex items-center justify-center border border-[#1868ff]/20">
                      {node.step}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {node.metric}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-[var(--foreground)] group-hover:text-[#1868ff] transition-colors">
                      {node.name}
                    </h3>
                    <div className="text-xs font-mono font-bold text-[#1868ff] dark:text-[#38bdf8] mt-0.5">
                      {node.tech}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    {node.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                  <span>AWS Architecture</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Metrics Bar */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#0a1835] via-[#0d224d] to-[#0a1835] border border-white/10 shadow-2xl text-white grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#ff9900]">99.98%</div>
              <div className="text-xs font-semibold text-slate-300">AWS Availability SLA</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#00d2ff]">&lt; 450ms</div>
              <div className="text-xs font-semibold text-slate-300">P99 Ingest Latency</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
              <div className="text-xs font-semibold text-slate-300">Tenant Data Isolation</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">0 ms</div>
              <div className="text-xs font-semibold text-slate-300">Schema Migration Lock</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================
          ONBOARDING WORKFLOW (4-Step Pipeline from CSV to Live Production ERP)
          ======================================================================== */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[var(--surface-muted)]/30 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff9900]/10 text-xs font-extrabold text-[#ff9900] uppercase tracking-wider border border-[#ff9900]/25">
              <Zap size={14} />
              <span>RAPID ONBOARDING PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
              From Raw Spreadsheet to Production ERP in 60s
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
              Zero manual database writing, zero coding, and zero schema migrations required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Drop Spreadsheet",
                subtitle: "CSV, XLSX, or Google Sheets",
                desc: "Upload inventory export directly from your existing billing register, Tally, or supplier invoice.",
                icon: FileSpreadsheet,
              },
              {
                step: "02",
                title: "Heuristic Match",
                subtitle: "Automated Category Detection",
                desc: "Parser analyzes column names, values, barcodes, and categorizes your shop type with 99.8% precision.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Schema Adaptation",
                subtitle: "Dynamic Custom Fields",
                desc: "Special attributes like batch numbers, expiry dates, or size matrices are mapped without altering standard tables.",
                icon: Database,
              },
              {
                step: "04",
                title: "Live Operations",
                subtitle: "Isolated Store Workspace",
                desc: "Stock ledger, real-time reorder thresholds, and immutable CloudTrail audit logging are activated instantly.",
                icon: BarChart3,
              },
            ].map((st) => {
              const StepIcon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-8 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] shadow-lg hover:shadow-2xl hover:border-[#1868ff]/40 transition-all space-y-4 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-[#1868ff]/25 font-mono group-hover:text-[#1868ff]/50 transition-colors">
                      {st.step}
                    </span>
                    <div className="w-11 h-11 rounded-2xl bg-[#1868ff]/10 text-[#1868ff] flex items-center justify-center">
                      <StepIcon size={22} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-[var(--foreground)]">
                      {st.title}
                    </h3>
                    <div className="text-[11px] font-bold text-[#1868ff] dark:text-[#38bdf8]">
                      {st.subtitle}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ====================================================================
              EXAMINER DEMO QUICK LAUNCHER DOCK (Viva Special)
              ==================================================================== */}
          <div className="p-8 sm:p-10 rounded-[36px] bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#ff9900] uppercase tracking-wider">
                  ⚡ 1-Click Examiner Demo Sandbox
                </span>
                <h4 className="text-xl font-extrabold text-[var(--foreground)] mt-0.5">
                  Instant Viva Store Roles
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Launch any store role directly to demonstrate tenant isolation to the examiner in 2 seconds.
                </p>
              </div>

              <Link href="/login">
                <button className="px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-xs font-bold hover:bg-[var(--surface-elevated)] transition-all">
                  Open Login Portal →
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Gupta Kirana", cat: "Grocery / FMCG", role: "gupta@kirana.cloud", color: "#10b981", icon: Store },
                { title: "Apollo Medico", cat: "Pharmacy / Meds", role: "apollo@medico.cloud", color: "#00d2ff", icon: Pill },
                { title: "Urban Threads", cat: "Garments / Fashion", role: "urban@threads.cloud", color: "#a855f7", icon: Shirt },
                { title: "Super Admin", cat: "Platform-Wide Audit", role: "admin@gramstock.cloud", color: "#ff9900", icon: Shield },
              ].map((roleItem, idx) => (
                <Link key={idx} href="/login">
                  <div className="p-4 rounded-2xl bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[#1868ff]/40 transition-all cursor-pointer space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${roleItem.color}20`, color: roleItem.color }}
                      >
                        <roleItem.icon size={16} />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[#1868ff] transition-colors">
                        Test Role →
                      </span>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[var(--foreground)]">
                        {roleItem.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium">
                        {roleItem.cat}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ====================================================================
              BIG CTA BANNER (Warm Sunset Amber / Royal Navy inspired by Reference Image 2)
              ==================================================================== */}
          <div className="p-8 sm:p-14 rounded-[40px] bg-gradient-to-r from-[#091b42] via-[#0d2a6b] to-[#081533] border border-white/15 shadow-2xl text-center space-y-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff9900]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00d2ff]/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to modernize your store inventory?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
              Drop your raw spreadsheet or test with preloaded Kirana, Pharmacy, and Fashion datasets.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2 relative z-10">
              <Link href="/imports">
                <button className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-[#ff9900] via-[#ff7a00] to-[#ff5500] hover:from-[#ffaa00] hover:to-[#ff6600] text-white font-black text-sm uppercase tracking-wider shadow-[0_12px_28px_rgba(255,122,0,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={18} />
                  <span>Upload Store Dataset</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
              
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/30 hover:bg-white/10 text-white font-extrabold text-sm tracking-wide transition-all cursor-pointer">
                  Merchant Sign In →
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================
          FOOTER
          ======================================================================== */}
      <footer className="border-t border-[var(--border)] py-12 bg-[var(--surface)] text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1868ff] to-[#00d2ff] flex items-center justify-center text-white">
              <Layers size={16} />
            </div>
            <span className="font-extrabold text-sm text-[var(--foreground)]">GramStock Cloud ERP</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
              AWS ap-south-1 Live
            </span>
          </div>

          <div className="flex items-center gap-6 font-bold">
            <Link href="/dashboard" className="hover:text-[var(--foreground)] transition-colors">Demo Dashboard</Link>
            <Link href="/imports" className="hover:text-[var(--foreground)] transition-colors">Import Engine</Link>
            <Link href="/reports" className="hover:text-[var(--foreground)] transition-colors">Store Ledger</Link>
            <Link href="/login" className="hover:text-[#1868ff] transition-colors">Merchant Sign In</Link>
          </div>

          <p>© 2026 GramStock Cloud. Adaptive SaaS Architecture for Wholesale & Retail.</p>

        </div>
      </footer>

    </div>
  );
}
