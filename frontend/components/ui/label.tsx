"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-2 block text-[0.68rem] font-semibold uppercase leading-4 tracking-[0.14em] text-secondary",
        className
      )}
      {...props}
    />
  );
}
