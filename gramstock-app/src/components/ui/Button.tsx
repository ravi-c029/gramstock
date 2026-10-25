import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-bold rounded-2xl text-xs sm:text-sm tracking-wide",
    "transition-all duration-200 cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091326]",
    "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed",
    "select-none active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-[#1868ff] to-[#00a8ff] text-white",
          "hover:from-[#0b54e0] hover:to-[#0090db]",
          "shadow-[0_4px_16px_rgba(24,104,255,0.4)] hover:shadow-[0_6px_22px_rgba(24,104,255,0.55)]",
          "border border-white/20",
        ],
        coral: [
          "bg-gradient-to-r from-[#ff5c5c] to-[#ff3333] text-white",
          "hover:from-[#e64747] hover:to-[#e62222]",
          "shadow-[0_4px_16px_rgba(255,75,75,0.4)] hover:shadow-[0_6px_22px_rgba(255,75,75,0.55)]",
          "border border-white/20",
        ],
        gold: [
          "bg-gradient-to-r from-[#ffc837] to-[#ff8008] text-slate-950 font-extrabold",
          "shadow-[0_4px_16px_rgba(255,184,0,0.4)]",
          "border border-white/25",
        ],
        secondary: [
          "bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]",
          "border border-[var(--border)]",
        ],
        outline: [
          "border border-[var(--border)] text-[var(--text-primary)]",
          "hover:bg-[var(--surface-muted)]",
        ],
        ghost: [
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
        ],
        danger: [
          "bg-red-500/20 text-red-400 hover:bg-red-500/30",
          "border border-red-500/30",
        ],
        "danger-ghost": [
          "text-red-400 hover:bg-red-500/10",
        ],
        success: [
          "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
          "border border-emerald-500/30",
        ],
        link: ["text-[#38bdf8] underline-offset-4 hover:underline"],
      },
      size: {
        xs: "h-8 px-3 text-[11px] rounded-xl",
        sm: "h-9 px-4 text-xs rounded-xl",
        md: "h-11 px-5 text-xs sm:text-sm rounded-2xl",
        lg: "h-13 px-6 text-sm rounded-2xl",
        xl: "h-14 px-8 text-base rounded-full",
        icon: "w-10 h-10 rounded-2xl p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
