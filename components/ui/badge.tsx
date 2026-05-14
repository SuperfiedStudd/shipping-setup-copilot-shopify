import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        neutral: "bg-[#edf2ee] text-ink",
        info: "bg-paleBlue text-paleBlueInk",
        success: "bg-paleGreen text-paleGreenInk",
        warn: "bg-paleYellow text-paleYellowInk",
        danger: "bg-paleRed text-paleRedInk",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
