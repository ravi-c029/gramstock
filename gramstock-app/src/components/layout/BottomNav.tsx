"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Upload,
  FileText,
  Plus,
  Activity,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/inventory", label: "Stock", icon: Package },
    { href: "/imports", label: "Import", icon: Upload, isCenter: true },
    { href: "/sla", label: "SLA", icon: Activity },
    { href: "/reports", label: "Audit", icon: FileText },
  ];

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 lg:hidden flex justify-center pointer-events-none">
      <nav
        className={cn(
          "pointer-events-auto flex items-center justify-around px-2 py-1.5",
          "bg-[var(--dock-bg)] backdrop-blur-2xl border border-[var(--border)] rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
          "w-full max-w-sm"
        )}
        aria-label="Mobile Bottom Navigation"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 flex flex-col items-center group"
                aria-label="Import New Dataset"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1868ff] to-[#00d2ff] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(24,104,255,0.6)] border-3 border-[var(--background)] transition-transform active:scale-90 group-hover:scale-105">
                  <Plus size={22} className="stroke-[2.5]" />
                </div>
                <span className="text-[9px] font-bold text-[var(--foreground)] mt-0.5">Import</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-2 rounded-2xl transition-all",
                isActive ? "text-[#1868ff]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive && "bg-[#1868ff]/15 text-[#1868ff]"
                )}
              >
                <item.icon size={18} className={isActive ? "stroke-[2.5]" : "stroke-[1.75]"} />
              </div>
              <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
