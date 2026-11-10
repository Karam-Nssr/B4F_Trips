import { BusFront } from "lucide-react";

import { cn } from "@/lib/utils";

export const Brand = ({
  inverse = false,
  compact = false,
}: {
  inverse?: boolean;
  compact?: boolean;
}) => (
  <div className="inline-flex items-center gap-2.5">
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg",
        inverse ? "bg-white text-primary" : "bg-primary text-white",
      )}
      aria-hidden="true"
    >
      <BusFront className="h-5 w-5" />
    </span>
    {!compact && (
      <span className={cn("leading-none", inverse ? "text-white" : "text-slate-900")}>
        <span className="block text-lg font-bold tracking-tight">Nawa</span>
        <span
          className={cn(
            "mt-1 block text-[9px] font-medium uppercase tracking-[0.16em]",
            inverse ? "text-blue-100" : "text-slate-500",
          )}
        >
          Trips portal
        </span>
      </span>
    )}
  </div>
);
