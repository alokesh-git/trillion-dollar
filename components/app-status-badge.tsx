import { Badge, StatusDot } from "@/components/ui/badge";
import type { AppStatus } from "@/lib/data";

const config: Record<
  AppStatus,
  {
    label: string;
    variant: "success" | "warning" | "info" | "secondary";
  }
> = {
  live: { label: "Live", variant: "success" },
  degraded: { label: "Degraded", variant: "warning" },
  building: { label: "Building", variant: "info" },
  paused: { label: "Paused", variant: "secondary" },
};

export function AppStatusBadge({
  status,
  className,
}: {
  status: AppStatus;
  className?: string;
}) {
  const { label, variant } = config[status];

  return (
    <Badge variant={variant} className={className}>
      <StatusDot />
      {label}
    </Badge>
  );
}
