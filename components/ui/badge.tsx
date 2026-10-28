import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-transparent bg-primary/10 text-primary",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border text-muted-foreground",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  destructive:
    "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  info: "border-border bg-white/[0.05] text-foreground/70",
  violet: "border-border bg-white/[0.06] text-foreground/85",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: keyof typeof variants }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function StatusDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full bg-current",
        className,
      )}
    />
  );
}
