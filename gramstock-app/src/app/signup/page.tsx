"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create account. Please try again.");
        return;
      }

      // Route directly to dashboard where the intuitive onboarding canvas awaits
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network or server failure. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0062f5] via-[#0152d5] to-[#003cb8] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#001f70]/40 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================
          CENTRAL AUTH CARD (Matching Attached Reference Image Aesthetic)
          ======================================================================== */}
      <div className="w-full max-w-4xl bg-white text-[#0c182e] rounded-[36px] sm:rounded-[44px] shadow-[0_24px_70px_rgba(0,18,60,0.4)] overflow-hidden relative flex flex-col md:flex-row min-h-[540px]">
        
        {/* ======================================================================
            LEFT PANEL: Organic Fluid Royal Blue with Floating 3D Glossy Spheres
            ====================================================================== */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0b54e0] via-[#0941b3] to-[#062c82] text-white p-7 sm:p-10 relative overflow-hidden flex flex-col justify-between shrink-0">
          
          {/* Floating 3D Glossy Spheres */}
          <div 
            className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full pointer-events-none shadow-2xl"
            style={{
              background: "radial-gradient(circle at 32% 28%, #60a5fa 0%, #1d4ed8 45%, #07194f 100%)",
              boxShadow: "0 25px 50px rgba(0, 10, 40, 0.6), inset -6px -6px 14px rgba(0, 0, 0, 0.6), inset 6px 6px 14px rgba(255, 255, 255, 0.6)",
            }}
          />

          <div 
            className="absolute top-1/2 right-2 sm:-right-4 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none z-10"
            style={{
              background: "radial-gradient(circle at 32% 28%, #38bdf8 0%, #1e40af 50%, #06153d 100%)",
              boxShadow: "0 30px 60px rgba(0, 15, 60, 0.55), inset -8px -8px 16px rgba(0, 0, 0, 0.6), inset 6px 6px 16px rgba(255, 255, 255, 0.65)",
            }}
          />

          <div 
            className="absolute -top-10 -left-6 w-32 h-32 rounded-full pointer-events-none opacity-40"
            style={{
              background: "radial-gradient(circle at 35% 35%, #93c5fd 0%, #2563eb 55%, #081d58 100%)",
            }}
          />

          {/* Top Logo */}
          <div className="relative z-20">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center font-black text-sm text-white shadow-sm">
                GS
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">GramStock</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                PRO
              </span>
            </Link>
          </div>

          {/* Center WELCOME & Value Proposition */}
          <div className="relative z-20 my-auto py-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight uppercase">
              REGISTER
            </h1>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-200 tracking-wider uppercase">
              ZERO-CONFIG ONBOARDING
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed font-medium max-w-xs">
              No store templates to pick. You don&apos;t need to tell us what kind of shop you run. Just upload your inventory dataset after registering, and we auto-categorize everything!
            </p>

            <div className="space-y-1.5 pt-2 text-xs text-blue-100 font-medium">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 size={15} />
                <span>Encrypted bcrypt Password Security</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 size={15} />
                <span>AWS Cognito ap-south-1 Identity Provider</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 size={15} />
                <span>Cryptographic Row-Level Isolation</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-20 text-[11px] text-blue-200/60 font-medium">
            Immutable AWS CloudTrail Audit Trails Enabled
          </div>

        </div>

        {/* ======================================================================
            RIGHT PANEL: Minimalist Sign Up Form (Matching Attached Reference Image)
            ====================================================================== */}
        <div className="w-full md:w-1/2 p-7 sm:p-10 flex flex-col justify-between bg-white relative">
          
          {/* Subtle Decorative Blue Orb in bottom right corner */}
          <div 
            className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full pointer-events-none opacity-90"
            style={{
              background: "radial-gradient(circle at 35% 35%, #38bdf8 0%, #1d4ed8 60%, #0c2166 100%)",
              boxShadow: "0 10px 30px rgba(0, 30, 100, 0.3)",
            }}
          />

          <div className="space-y-6 relative z-10">
            
            {/* Header: Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0c182e] tracking-tight">
                Sign up
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Create your merchant account to setup your store
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name (e.g. Ramesh Kumar)"
                    required
                    className="w-full bg-[#f4f7fb] text-[#0c182e] placeholder-slate-400 font-medium text-xs sm:text-sm pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200/80 focus:border-[#1868ff] focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full bg-[#f4f7fb] text-[#0c182e] placeholder-slate-400 font-medium text-xs sm:text-sm pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200/80 focus:border-[#1868ff] focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create Password (min 6 characters)"
                    required
                    minLength={6}
                    className="w-full bg-[#f4f7fb] text-[#0c182e] placeholder-slate-400 font-medium text-xs sm:text-sm pl-12 pr-20 py-3.5 rounded-2xl border border-slate-200/80 focus:border-[#1868ff] focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[11px] font-black uppercase text-[#1868ff] hover:text-[#0d54df] transition-colors cursor-pointer select-none tracking-wider"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#091b40] hover:bg-[#061430] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Merchant Identity...</span>
                  </>
                ) : (
                  <span>Create Account &amp; Proceed →</span>
                )}
              </button>

            </form>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By creating an account, your data is isolated in an Amazon Aurora PostgreSQL container with row-level security.
            </p>

          </div>

          {/* Footer Link */}
          <div className="text-center pt-6 text-xs text-slate-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1868ff] font-bold hover:underline">
              Sign In
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
