import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/icon";
import type { Tone } from "@/lib/data";

const iconTones: Record<Tone, string> = {
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

const strokeTones: Record<Tone, string> = {
  violet: "text-violet-500",
  sky: "text-sky-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  rose: "text-rose-500",
  fuchsia: "text-fuchsia-500",
  indigo: "text-indigo-500",
  cyan: "text-cyan-500",
};

function Sparkline({
  data,
  tone,
}: {
  data: number[];
  tone: Tone;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 30 - ((value - min) / range) * 24;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className={cn("h-9 w-20", strokeTones[tone])}
      aria-hidden="true"
    >
      <polygon
        points={`0,32 ${points.join(" ")} 100,32`}
        fill="currentColor"
        className="opacity-[0.08]"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  change,
  trend = "up",
  icon,
  tone = "violet",
  spark,
  footnote,
  suffix,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: IconName;
  tone?: Tone;
  spark?: number[];
  footnote?: string;
  suffix?: string;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="group relative overflow-hidden p-5 transition-colors hover:border-border/80">
      <div
        className={cn(
          "pointer-events-none absolute -top-16 -right-12 size-36 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-70",
          {
            violet: "bg-violet-500/20",
            sky: "bg-sky-500/20",
            emerald: "bg-emerald-500/20",
            amber: "bg-amber-500/20",
            rose: "bg-rose-500/20",
            fuchsia: "bg-fuchsia-500/20",
            indigo: "bg-indigo-500/20",
            cyan: "bg-cyan-500/20",
          }[tone],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight tabular">
              {value}
            </span>
            {suffix ? (
              <span className="text-xs text-muted-foreground">{suffix}</span>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            iconTones[tone],
          )}
        >
          <Icon name={icon} className="size-4" />
        </span>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div className="space-y-1">
          {change ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                trend === "up"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              )}
            >
              <TrendIcon className="size-3" />
              {change}
            </span>
          ) : null}
          {footnote ? (
            <p className="text-[10px] text-muted-foreground">{footnote}</p>
          ) : null}
        </div>
        {spark ? <Sparkline data={spark} tone={tone} /> : null}
      </div>
    </Card>
  );
}
