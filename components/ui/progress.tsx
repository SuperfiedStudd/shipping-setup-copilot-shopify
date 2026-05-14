"use client";

import type { ComponentPropsWithoutRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

type ProgressProps = ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>;

export function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[#ece6de]", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-ink transition-transform duration-500"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
