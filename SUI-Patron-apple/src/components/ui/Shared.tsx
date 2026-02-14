import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

// --- Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          // Variants
          variant === "default" &&
            "bg-[var(--brand-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-hover)] shadow-[0_0_20px_rgba(0,122,255,0.25)]",
          variant === "secondary" &&
            "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]",
          variant === "outline" &&
            "border border-[var(--border-default)] bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]",
          variant === "ghost" &&
            "hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
          variant === "destructive" &&
            "bg-[var(--error)] text-white hover:bg-red-600",
          // Sizes
          size === "sm" && "h-8 px-3 text-[13px]",
          size === "default" && "h-10 px-4 py-2 text-[14px]",
          size === "lg" && "h-12 px-6 text-[16px]",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

// --- Card ---
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--text-secondary)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// --- Badge ---
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "image"
    | "text"
    | "pdf";
}

export const Badge = ({
  className,
  variant = "default",
  ...props
}: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent",
        variant === "default" &&
          "bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
        variant === "primary" &&
          "bg-[var(--brand-primary-muted)] text-[var(--brand-primary)]",
        variant === "success" &&
          "bg-[var(--success-subtle)] text-[var(--success)]",
        variant === "warning" &&
          "bg-[var(--warning-subtle)] text-[var(--warning)]",
        variant === "error" && "bg-[var(--error-subtle)] text-[var(--error)]",
        variant === "image" && "bg-[rgba(59,130,246,0.15)] text-[#3B82F6]",
        variant === "text" && "bg-[rgba(16,185,129,0.15)] text-[#10B981]",
        variant === "pdf" && "bg-[rgba(239,68,68,0.15)] text-[#EF4444]",
        className,
      )}
      {...props}
    />
  );
};

// --- Avatar ---
export const Avatar = ({
  src,
  fallback,
  size = "md",
  className,
}: {
  src?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-[12px]",
    md: "h-12 w-12 text-[16px]",
    lg: "h-16 w-16 text-[20px]",
    xl: "h-24 w-24 text-[28px]",
    "2xl": "h-32 w-32 text-[36px]",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={fallback}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white font-bold">
          {fallback.substring(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
};
