import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// ============================================================
// CARD
// ============================================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = "md", children, ...props }, ref) => {
    const paddings = {
      none: "",
      sm: "p-4 sm:p-5",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[28px] bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] shadow-xl transition-all duration-200",
          paddings[padding],
          hover && "hover:border-[var(--border-strong)] hover:scale-[1.01] cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4 mb-5", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-bold text-[var(--text-primary)] tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// ============================================================
// STAT CARD (PLUSH ADAPTIVE THEMED DESIGN)
// ============================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  color?: string;
  variant?: "default" | "warning" | "danger" | "success" | "coral" | "gold" | "cyan";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  variant = "default",
  className,
}: StatCardProps) {
  const trendPositive = (trend?.value ?? 0) >= 0;

  const variantBorders = {
    default: "border-[var(--border)]",
    warning: "border-amber-500/40 bg-amber-500/5",
    danger: "border-red-500/40 bg-red-500/5",
    success: "border-emerald-500/40 bg-emerald-500/5",
    coral: "border-[#ff4b4b]/40 bg-[#ff4b4b]/5",
    gold: "border-[#ffb800]/40 bg-[#ffb800]/5",
    cyan: "border-[#00d2ff]/40 bg-[#00d2ff]/5",
  };

  return (
    <div
      className={cn(
        "rounded-[26px] p-6 bg-[var(--card)] text-[var(--text-primary)] border shadow-xl hover:scale-[1.02] transition-all duration-200",
        variantBorders[variant] || variantBorders.default,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-none tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-2 font-medium truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                  trendPositive
                    ? "bg-emerald-500/20 text-emerald-500 dark:text-emerald-400"
                    : "bg-red-500/20 text-red-500 dark:text-red-400"
                )}
              >
                {trendPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-[11px] text-[var(--text-muted)] font-medium">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{
              backgroundColor: color ? `${color}18` : "rgba(24, 104, 255, 0.15)",
              color: color || "#1868ff",
              border: `1px solid ${color ? `${color}40` : "rgba(24, 104, 255, 0.25)"}`,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// BADGE
// ============================================================

type BadgeVariant =
  | "default"
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "secondary"
  | "outline"
  | "gold"
  | "coral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
}

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)]",
    primary: "bg-[#1868ff] text-white shadow-[0_2px_10px_rgba(24,104,255,0.4)]",
    neutral: "bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30",
    danger: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
    info: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30",
    secondary: "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
    outline: "border border-[var(--border-strong)] text-[var(--text-secondary)]",
    gold: "bg-[#ffb800]/15 text-amber-600 dark:text-[#ffb800] border border-[#ffb800]/40 shadow-[0_0_12px_rgba(255,184,0,0.2)]",
    coral: "bg-[#ff4b4b]/15 text-[#ff4b4b] border border-[#ff4b4b]/40",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span
      className={cn("gs-badge font-bold", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================================
// SKELETON LOADERS
// ============================================================

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-[var(--surface-muted)]",
        className
      )}
    />
  );
}
