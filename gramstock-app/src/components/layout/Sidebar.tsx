"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  Store,
  Layers,
  Activity,
  X,
  ShieldCheck,
  LogOut,
  Lock,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useBusiness } from "@/lib/business-context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/imports", label: "Dataset Wizard", icon: Upload },
  { href: "/reports", label: "Store Ledger", icon: FileText },
  { href: "/sla", label: "Cloud SLA & TTR", icon: Activity, badge: "AWS", adminOnly: true },
  { href: "/audit", label: "CloudTrail & RUM", icon: ShieldCheck, badge: "Admin", adminOnly: true },
];

interface SidebarProps {
  businessName?: string;
  businessCategory?: string;
  userName?: string;
  userEmail?: string;
  isMobileDrawer?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  businessName = "My Business",
  businessCategory = "RETAIL",
  isMobileDrawer = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { businesses, activeBusiness, setActiveBusinessId, currentUser, logout } = useBusiness();
  const [collapsed, setCollapsed] = useState(false);
  const [bizMenuOpen, setBizMenuOpen] = useState(false);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.email === "admin@gramstock.cloud";

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const currentCategory = activeBusiness?.category || businessCategory;

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <aside
      className={cn(
        "flex flex-col z-40 bg-[var(--sidebar-bg)] text-white backdrop-blur-2xl transition-all duration-300",
        isMobileDrawer
          ? "h-full w-full rounded-r-[28px] border-r border-white/10 shadow-2xl"
          : "h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 rounded-[30px] border border-white/10 shadow-2xl",
        !isMobileDrawer && (collapsed ? "w-20" : "w-72")
      )}
      aria-label="Main navigation"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: "var(--cat-gradient)" }}
          >
            <Layers size={20} className="text-white" />
          </div>
          {(!collapsed || isMobileDrawer) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">GramStock</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#ff4b4b] text-white">PRO</span>
              </div>
              <p className="text-[11px] text-slate-300/70 truncate">Adaptive SaaS Platform</p>
            </div>
          )}
        </div>
        {isMobileDrawer ? (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close navigation drawer"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Business Switcher Pill */}
      {(!collapsed || isMobileDrawer) && (
        <div className="relative px-4 py-3 border-b border-white/10">
          {(() => {
            const isSuperAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.email === "admin@gramstock.cloud";
            const canSwitchStores = isSuperAdmin && businesses.length > 1;

            if (!activeBusiness || businesses.length === 0) {
              return (
                <Link
                  href="/imports"
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1868ff]/10 to-transparent border border-amber-500/40 hover:border-amber-400 transition-all text-left group shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-amber-300 truncate leading-tight flex items-center gap-1.5">
                      <span>Setup Your Store</span>
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      <span className="text-[9px] text-amber-200/90 font-bold tracking-wider">
                        Upload CSV to Categorize
                      </span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-black text-white bg-gradient-to-r from-amber-500 to-[#ea580c] px-2 py-0.5 rounded-full shadow-sm">
                    Upload
                  </span>
                </Link>
              );
            }

            return (
              <>
                <button
                  type="button"
                  onClick={() => canSwitchStores && setBizMenuOpen(!bizMenuOpen)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 transition-all text-left group",
                    canSwitchStores ? "hover:bg-white/10 cursor-pointer" : "cursor-default"
                  )}
                >
                  <div
                    className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0"
                    style={{ background: "var(--cat-gradient)" }}
                  >
                    <Store size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {activeBusiness?.name || businessName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] text-slate-300/80 uppercase tracking-wider font-semibold">
                        {currentCategory}
                      </span>
                    </div>
                  </div>
                  {canSwitchStores ? (
                    <ChevronDown
                      size={14}
                      className={cn("text-slate-300 transition-transform duration-200", bizMenuOpen && "rotate-180")}
                    />
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Lock size={10} />
                      Isolated
                    </span>
                  )}
                </button>

                {/* Dropdown Menu (Strictly for Super Admin when multiple stores exist) */}
                {bizMenuOpen && canSwitchStores && (
                  <div className="absolute left-4 right-4 top-full mt-2 bg-[#0c1830] border border-white/15 rounded-2xl shadow-2xl z-50 p-2 space-y-1 backdrop-blur-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
                      Super Admin Store Switcher
                    </p>
                    {businesses.map((biz) => (
                      <button
                        key={biz.id}
                        onClick={() => {
                          setActiveBusinessId(biz.id);
                          setBizMenuOpen(false);
                          if (isMobileDrawer && onClose) onClose();
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left",
                          activeBusiness?.id === biz.id
                            ? "text-white font-bold shadow-md"
                            : "text-slate-300 hover:bg-white/10"
                        )}
                        style={activeBusiness?.id === biz.id ? { background: "var(--cat-primary)" } : {}}
                      >
                        <span className="truncate">{biz.name}</span>
                        <span className="text-[10px] opacity-75 capitalize font-medium ml-1">
                          {biz.category.toLowerCase()}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-white/10 pt-1.5 mt-1">
                      <Link
                        href="/imports"
                        onClick={() => {
                          setBizMenuOpen(false);
                          if (isMobileDrawer && onClose) onClose();
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#00d2ff] hover:bg-white/10 font-bold transition-colors"
                      >
                        <Sparkles size={14} />
                        <span>+ Import New Business CSV</span>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Main Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isSuperAdmin).map((item, idx, arr) => {
          const active = isActive(item.href);
          const isFirstAdminItem = item.adminOnly && (idx === 0 || !arr[idx - 1]?.adminOnly);

          return (
            <div key={item.href} className="space-y-1.5">
              {isFirstAdminItem && (!collapsed || isMobileDrawer) && (
                <div className="pt-3 pb-1 px-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-amber-400/90">
                    <ShieldCheck size={12} className="text-amber-400" />
                    <span>AWS Root Governance</span>
                  </div>
                </div>
              )}
              {isFirstAdminItem && collapsed && !isMobileDrawer && (
                <div className="my-2 border-t border-white/10" />
              )}
              <Link
                href={item.href}
                onClick={() => {
                  if (isMobileDrawer && onClose) onClose();
                }}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group relative",
                  active
                    ? "text-white shadow-lg translate-x-1"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
                style={active ? { background: "var(--cat-primary)", boxShadow: "0 8px 24px var(--cat-glow)" } : {}}
              >
                <item.icon
                  size={18}
                  className={cn(
                    "transition-transform group-hover:scale-110 flex-shrink-0",
                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                />
                {(!collapsed || isMobileDrawer) && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {(!collapsed || isMobileDrawer) && item.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      item.adminOnly
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-white/10 text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer Theme Toggle Segmented Switch */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200",
              resolvedTheme === "light"
                ? "bg-white text-[#071c42] shadow-sm font-black"
                : "text-slate-400 hover:text-white"
            )}
            title="Light Mode"
          >
            <Sun size={14} className={resolvedTheme === "light" ? "text-[#ffb800]" : ""} />
            {!collapsed && <span>Light</span>}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200",
              resolvedTheme === "dark"
                ? "bg-[#1868ff] text-white shadow-md font-black"
                : "text-slate-400 hover:text-white"
            )}
            title="Dark Mode"
          >
            <Moon size={14} />
            {!collapsed && <span>Dark</span>}
          </button>
        </div>

        {/* Logged in User Profile & Logout */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1868ff] to-[#00d2ff] flex items-center justify-center text-white font-extrabold text-xs shadow-md flex-shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "M"}
            </div>
            {(!collapsed || isMobileDrawer) && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser?.name || "Store Merchant"}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {currentUser?.email || "gupta@kirana.cloud"}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => logout()}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 flex items-center justify-center transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
