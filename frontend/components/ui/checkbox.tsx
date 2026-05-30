"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "peer h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-outline-variant bg-transparent transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute h-3 w-3 text-on-primary opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
    );
  }
);

Checkbox.displayName = "Checkbox";
