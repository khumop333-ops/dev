import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[#23452F] text-white border border-[#23452F] hover:bg-[#1A3523] disabled:opacity-50",
      secondary:
        "bg-[#B85C38] text-white border border-[#B85C38] hover:bg-[#9C4A2A] disabled:opacity-50",
      outline:
        "bg-white text-[#1C1C19] border border-[#D6CBB9] hover:border-[#23452F] hover:bg-[#F7F3EA] disabled:opacity-50",
      ghost:
        "bg-transparent text-[#1C1C19] border border-transparent hover:bg-[#E7DECF]/60 disabled:opacity-50",
      danger:
        "bg-[#9E3A32] text-white border border-[#9E3A32] hover:bg-[#822E27] disabled:opacity-50",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "px-3 py-1.5 text-xs font-medium rounded-[4px]",
      md: "px-4 py-2.5 text-sm font-medium rounded-[6px]",
      lg: "px-6 py-3 text-sm font-medium rounded-[6px]",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23452F] disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
