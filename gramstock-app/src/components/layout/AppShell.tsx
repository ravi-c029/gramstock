"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { useBusiness } from "@/lib/business-context";
import { Layers } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  businessName?: string;
  businessCategory?: string;
}

export function AppShell({
  children,
  title,
  breadcrumbs,
  actions,
  businessName,
  businessCategory,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, isLoading } = useBusiness();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }, [isLoading, currentUser]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1868ff] via-[#0284c7] to-[#00d2ff] flex items-center justify-center shadow-[0_4px_24px_rgba(24,104,255,0.4)] animate-pulse">
          <Layers size={28} className="text-white" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-[#1868ff] animate-ping" />
          <span>Verifying AWS Cognito Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="gs-layout min-h-screen flex flex-row transition-colors duration-250">
      {/* Desktop Sidebar (Floating Dock) */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar businessName={businessName} businessCategory={businessCategory} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Slide Drawer */}
          <div className="fixed inset-y-0 left-0 w-[84%] max-w-xs h-full bg-[var(--sidebar-bg)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[101] border-r border-white/10 flex flex-col">
            <Sidebar
              businessName={businessName}
              businessCategory={businessCategory}
              isMobileDrawer={true}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        <TopBar
          title={title}
          breadcrumbs={breadcrumbs}
          actions={actions}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          showMobileMenu={mobileMenuOpen}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-36 lg:pb-12 space-y-6 sm:space-y-8 min-w-0">
          {children}
        </main>

        {/* Mobile Floating Bottom Dock (hidden while mobile drawer is open) */}
        {!mobileMenuOpen && <BottomNav />}
      </div>
    </div>
  );
}
