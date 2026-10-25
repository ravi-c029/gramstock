"use client";

import { Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  onMobileMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

export function TopBar({
  title,
  breadcrumbs,
  actions,
  onMobileMenuToggle,
  showMobileMenu = false,
}: TopBarProps) {
  const { activeBusiness } = useBusiness();
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 backdrop-blur-xl bg-[var(--topbar-bg)] border-b border-[var(--border)] transition-colors duration-250">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:opacity-80 transition-colors flex-shrink-0"
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
          >
            {showMobileMenu ? <X size={17} /> : <Menu size={17} />}
          </button>

          <div className="min-w-0 flex-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="hidden xs:flex sm:flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] mb-0.5 truncate">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span>/</span>}
                    <span className="truncate">{crumb.label}</span>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm sm:text-xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight truncate">
                {title}
              </h1>
              {activeBusiness?.category && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: "var(--cat-badge-bg)",
                    color: "var(--cat-badge-text)",
                    borderColor: "var(--cat-border)",
                  }}
                >
                  <Sparkles size={11} />
                  <span>{activeBusiness.category}</span>
                </span>
              )}
            </div>
            {activeBusiness?.category && (
              <p className="sm:hidden text-[9px] font-bold text-[var(--cat-badge-text)] uppercase tracking-wider flex items-center gap-1 truncate mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse flex-shrink-0" />
                <span className="truncate">{activeBusiness.category} STORE</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions & Theme Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 ml-auto">
          {/* Mobile Single Theme Icon (< sm) */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="sm:hidden w-8 h-8 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] transition-all shadow-sm active:scale-95"
            title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle Theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={15} className="text-[#ffb800]" />
            ) : (
              <Moon size={15} className="text-[#1868ff]" />
            )}
          </button>

          {/* Desktop/Tablet Segmented Dual Switch (>= sm) */}
          <div
            id="theme-toggle-btn"
            className="hidden sm:flex items-center p-1 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] shadow-sm"
          >
            <button
              onClick={() => setTheme("light")}
              id="theme-switch-light"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200",
                resolvedTheme === "light"
                  ? "bg-white text-[#1868ff] shadow-md font-extrabold scale-100"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
              title="Switch to White / Light Mode"
              aria-label="Switch to White / Light Mode"
            >
              <Sun size={14} className={resolvedTheme === "light" ? "text-[#ffb800]" : "text-[var(--text-muted)]"} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              id="theme-switch-dark"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200",
                resolvedTheme === "dark"
                  ? "bg-[#1868ff] text-white shadow-[0_2px_12px_rgba(24,104,255,0.4)] font-extrabold scale-100"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
              title="Switch to Dark / Midnight Mode"
              aria-label="Switch to Dark / Midnight Mode"
            >
              <Moon size={14} className={resolvedTheme === "dark" ? "text-white" : "text-[var(--text-muted)]"} />
              <span>Dark</span>
            </button>
          </div>

          {actions}
        </div>
      </div>
    </header>
  );
}
