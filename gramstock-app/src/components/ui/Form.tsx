import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// ============================================================
// INPUT
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center text-[var(--muted-foreground)] pointer-events-none">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 px-3 text-sm rounded-lg",
              "bg-[var(--surface)] text-[var(--foreground)]",
              "border border-[var(--border)]",
              "placeholder:text-[var(--muted-foreground)]",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-0 focus:border-[var(--primary)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-[var(--danger)] focus:ring-[var(--danger)]",
              leftElement && "pl-9",
              rightElement && "pr-9",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-[var(--muted-foreground)]">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[var(--danger)] flex items-center gap-1">
            <span>⚠</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--muted-foreground)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ============================================================
// TEXTAREA
// ============================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--foreground)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg min-h-[80px]",
            "bg-[var(--surface)] text-[var(--foreground)]",
            "border border-[var(--border)]",
            "placeholder:text-[var(--muted-foreground)]",
            "transition-colors duration-150 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-[var(--primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--danger)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ============================================================
// SELECT
// ============================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const inputId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--foreground)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-9 px-3 text-sm rounded-lg appearance-none",
            "bg-[var(--surface)] text-[var(--foreground)]",
            "border border-[var(--border)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-[var(--primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--danger)]",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// ============================================================
// CHECKBOX
// ============================================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const inputId = id ?? `cb-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={inputId}
        className={cn(
          "mt-0.5 h-4 w-4 rounded border-[var(--border-strong)]",
          "text-[var(--primary)] bg-[var(--surface)]",
          "focus:ring-[var(--focus-ring)] focus:ring-offset-0",
          "transition-colors cursor-pointer",
          className
        )}
        {...props}
      />
      {(label || description) && (
        <div>
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)] cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TOGGLE / SWITCH
// ============================================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  const inputId = id ?? `toggle-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div>
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)] cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>
          )}
        </div>
      )}
      <button
        role="switch"
        id={inputId}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2",
          checked ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
