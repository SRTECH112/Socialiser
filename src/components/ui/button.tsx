import * as React from "react";

import { cn } from "@/lib/utils";

const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<string, string> = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-400",
  outline: "border border-white/30 text-white hover:bg-white/10 focus-visible:ring-white/30",
  ghost: "text-white hover:bg-white/10 focus-visible:ring-white/30",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], className)} {...props} />
    );
  },
);

Button.displayName = "Button";
