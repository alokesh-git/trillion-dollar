import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = {
  default:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
  link: "text-foreground underline-offset-4 hover:underline",
} as const;

export const buttonSizes = {
  default: "h-10 px-5 text-sm",
  sm: "h-8 rounded-full px-3.5 text-xs",
  lg: "h-11 rounded-full px-6 text-sm",
  icon: "size-10",
  "icon-sm": "size-8",
} as const;

export function buttonClasses({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );
}

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
