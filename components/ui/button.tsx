import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500": variant === "default" || variant === "primary",
            "bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500": variant === "secondary",
            "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500": variant === "success",
            "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500": variant === "danger",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };


