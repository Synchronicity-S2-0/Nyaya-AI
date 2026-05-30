"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2.5 text-base text-primary placeholder:text-secondary-fixed-dim transition-colors duration-300 focus:border-primary focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
