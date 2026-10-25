"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Store, Pill, Shirt, Shield, CheckCircle2, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface DemoAccount {
  name: string;
  role: string;
  category: string;
  email: string;
  pass: string;
  color: string;
  icon: any;
  desc: string;
}

const PRELOADED_ACCOUNTS: DemoAccount[] = [
  {
    name: "Gupta Super Kirana",
    role: "Kirana Merchant",
    category: "GROCERY",
    email: "gupta@kirana.cloud",
    pass: "Kirana@2026",
    color: "#10b981",
    icon: Store,
    desc: "Aashirvaad Atta, Oils, FMCG Barcodes",
  },
  {
    name: "Apollo Medico Pharmacy",
    role: "Pharmacy Owner",
    category: "MEDICAL",
    email: "apollo@medico.cloud",
    pass: "Pharmacy@2026",
    color: "#00d2ff",
    icon: Pill,
    desc: "Dolo 650mg, Augmentin, Batch No & Expiry",
  },
  {
    name: "Urban Threads Apparel",
    role: "Fashion Boutique",
    category: "GARMENTS",
    email: "urban@threads.cloud",
    pass: "Garments@2026",
    color: "#a855f7",
    icon: Shirt,
    desc: "Denim Jeans, Linen Shirts, Sizes S/M/L/XL",
  },
  {
    name: "Cloud Super Admin",
    role: "Platform Overseer",
    category: "SUPER_ADMIN",
    email: "admin@gramstock.cloud",
    pass: "Admin@2026",
    color: "#ff9900",
    icon: Shield,
    desc: "AWS CloudTrail Audit, SLA Metrics & All Tenants",
  },
  {
    name: "New Merchant (Fresh Account)",
    role: "Zero-Schema Onboarding",
    category: "NEW_USER",
    email: "new@merchant.cloud",
    pass: "New@2026",
    color: "#06b6d4",
    icon: Sparkles,
    desc: "Fresh account with 0 stores — test CSV upload & schema generation",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid email or password.");
        return;
      }

      if (loginEmail === "admin@gramstock.cloud") {
        router.push("/audit");
      } else {
        router.push(redirectPath);
      }
      router.refresh();
    } catch {
      setError("Authentication failed. Please check network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    await performLogin(email, password);
  };

  const handleQuickSelect = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setShowDemoModal(false);
    performLogin(acc.email, acc.pass);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0062f5] via-[#0152d5] to-[#003cb8] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#001f70]/40 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================
          CENTRAL AUTH CARD (Matching Attached Reference Image)
          - Rounded-[40px] Crisp White Container
          - Left: Deep Blue Organic Blob with 3D Glossy Spheres & WELCOME Headline
          - Right: Clean Sign In Form with rounded light-gray inputs & Navy Button
          ======================================================================== */}
      <div className="w-full max-w-4xl bg-white text-[#0c182e] rounded-[36px] sm:rounded-[44px] shadow-[0_24px_70px_rgba(0,18,60,0.4)] overflow-hidden relative flex flex-col md:flex-row min-h-[540px]">
        
        {/* ======================================================================
            LEFT PANEL: Organic Fluid Royal Blue with Floating 3D Glossy Spheres
            ====================================================================== */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0b54e0] via-[#0941b3] to-[#062c82] text-white p-7 sm:p-10 relative overflow-hidden flex flex-col justify-between shrink-0">
          
          {/* Organic Curved Wave Overlay Boundary on the right edge */}
          <div 
            className="absolute -top-12 -right-16 w-52 h-full bg-white/5 pointer-events-none"
            style={{ borderRadius: "50% 0 0 50%" }}
          />

          {/* Floating 3D Glossy Spheres (Styled with 3D radial highlights & shadows) */}
          {/* Sphere 1: Large sphere floating at middle-bottom */}
          <div 
            className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full pointer-events-none shadow-2xl transition-transform duration-700 hover:scale-105"
            style={{
              background: "radial-gradient(circle at 32% 28%, #60a5fa 0%, #1d4ed8 45%, #07194f 100%)",
              boxShadow: "0 25px 50px rgba(0, 10, 40, 0.6), inset -6px -6px 14px rgba(0, 0, 0, 0.6), inset 6px 6px 14px rgba(255, 255, 255, 0.6)",
            }}
          />

          {/* Sphere 2: Prominent sphere protruding towards center right (Exact replica of attached image) */}
          <div 
            className="absolute top-1/2 right-2 sm:-right-4 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none z-10"
            style={{
              background: "radial-gradient(circle at 32% 28%, #38bdf8 0%, #1e40af 50%, #06153d 100%)",
              boxShadow: "0 30px 60px rgba(0, 15, 60, 0.55), inset -8px -8px 16px rgba(0, 0, 0, 0.6), inset 6px 6px 16px rgba(255, 255, 255, 0.65)",
            }}
          />

          {/* Sphere 3: Subtle top-left sphere */}
          <div 
            className="absolute -top-10 -left-6 w-32 h-32 rounded-full pointer-events-none opacity-40"
            style={{
              background: "radial-gradient(circle at 35% 35%, #93c5fd 0%, #2563eb 55%, #081d58 100%)",
            }}
          />

          {/* Top Logo / Security Pill */}
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

          {/* Center WELCOME & Typography (Direct from Reference Image) */}
          <div className="relative z-20 my-auto py-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight uppercase">
              WELCOME
            </h1>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-200 tracking-wider uppercase">
              GRAMSTOCK CLOUD
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed font-medium max-w-xs">
              Adaptive multi-tenant inventory operating system. Drop your raw spreadsheet and let our AI classify and isolate your catalog automatically.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300 font-bold">
              <ShieldCheck size={16} />
              <span>AWS Cognito &amp; Row-Level Isolated</span>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-20 text-[11px] text-blue-200/60 font-medium">
            Protected by 256-bit AWS KMS Encryption
          </div>

        </div>

        {/* ======================================================================
            RIGHT PANEL: Minimalist Sign In Form (Matching Attached Reference Image)
            ====================================================================== */}
        <div className="w-full md:w-1/2 p-7 sm:p-10 flex flex-col justify-between bg-white relative">
          
          {/* Subtle Decorative Blue Orb in bottom right corner (from attached image) */}
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
                Sign in
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enter your credentials to access your isolated store
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold flex items-center gap-2 animate-shake">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email / User Name Field */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <User size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="User Name or Email"
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
                    placeholder="Password"
                    required
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1868ff] focus:ring-[#1868ff] border-slate-300 rounded-md cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset is managed via AWS Cognito Identity recovery. Please contact your administrator or re-register.");
                  }}
                  className="text-slate-500 hover:text-[#1868ff] transition-colors font-semibold"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Primary Navy Sign In Button (From Attached Image) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#091b40] hover:bg-[#061430] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

            </form>

            {/* Divider "Or" (From Attached Image) */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-xs text-slate-400 font-medium">
                Or
              </span>
            </div>

            {/* Secondary "Sign in with other" Button (From Attached Image) */}
            <button
              type="button"
              onClick={() => setShowDemoModal(!showDemoModal)}
              className="w-full py-3.5 rounded-2xl border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} className="text-[#ff9900]" />
              <span>Sign in with other (Viva Demo Roles)</span>
            </button>

            {/* 1-Click Viva Demo Roles Picker (Revealed when clicked) */}
            {showDemoModal && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Select 1-Click Examiner Demo Account:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRELOADED_ACCOUNTS.map((acc) => {
                    const Icon = acc.icon;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleQuickSelect(acc)}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#1868ff] transition-all text-left flex items-center gap-2 group cursor-pointer shadow-sm"
                      >
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                          style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-800 truncate group-hover:text-[#1868ff] transition-colors">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {acc.role}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer Link (From Attached Image) */}
          <div className="text-center pt-6 text-xs text-slate-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#1868ff] font-bold hover:underline">
              Sign Up
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0062f5] via-[#0152d5] to-[#003cb8] flex items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white font-bold text-sm">Loading GramStock Cloud...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
