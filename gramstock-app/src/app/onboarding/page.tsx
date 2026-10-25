"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#16a34a] to-[#00d2ff] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 text-white">
          <UploadCloud size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Zero-Config Business Provisioning
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Welcome to GramStock Cloud!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Your merchant account is ready. You don&apos;t need to configure categories manually — simply upload your stock spreadsheet, and our AI Cloud Engine will automatically classify and provision your ERP store!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-left space-y-2.5 text-xs">
          <p className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" /> How Automatic Provisioning Works:
          </p>
          <ul className="space-y-1.5 text-[var(--text-secondary)] pl-5 list-disc">
            <li>Drop any CSV or Excel file (Kirana, Medical, Garments, or Restaurant).</li>
            <li>Cloud engine inspects column names, data types, and keywords.</li>
            <li>Zero manual template selection — store theme and fields adapt instantly.</li>
            <li>Your catalog is securely archived into Amazon S3 Mumbai.</li>
          </ul>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => router.push("/imports?onboarding=true")}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 bg-[#1868ff] hover:bg-[#155be5] text-white"
        >
          <span>Continue to CSV Ingestion & Auto-Detect</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
