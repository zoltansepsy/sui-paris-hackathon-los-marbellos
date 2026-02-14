import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        {
          "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500":
            variant === "primary",
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500":
            variant === "secondary",
          "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700":
            variant === "outline",
          "hover:bg-gray-100 text-gray-700": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
            variant === "danger",
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4 py-2": size === "md",
          "h-12 px-6 text-lg": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  className,
  variant = "neutral",
  children,
}: {
  className?: string;
  variant?: "neutral" | "success" | "warning" | "premium";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-gray-100 text-gray-800": variant === "neutral",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border border-yellow-300":
            variant === "premium",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
