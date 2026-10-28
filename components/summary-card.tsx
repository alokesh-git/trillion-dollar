import { cn } from "@/lib/utils";
import { softTone } from "@/lib/tones";
import { Card } from "@/components/ui/card";
import type { Tone } from "@/lib/data";

export function SummaryCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: Tone;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            softTone[tone],
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tracking-tight tabular">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">{hint}</p>
    </Card>
  );
}
