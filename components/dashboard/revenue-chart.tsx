"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/lib/data";

const revenueSeries: ChartPoint[] = [
  { label: "Nov", revenue: 25_800, previous: 17_400 },
  { label: "Dec", revenue: 27_400, previous: 18_200 },
  { label: "Jan", revenue: 28_900, previous: 19_100 },
  { label: "Feb", revenue: 30_200, previous: 20_300 },
  { label: "Mar", revenue: 31_800, previous: 21_600 },
  { label: "Apr", revenue: 33_100, previous: 22_900 },
  { label: "May", revenue: 34_900, previous: 24_100 },
  { label: "Jun", revenue: 36_800, previous: 25_600 },
  { label: "Jul", revenue: 38_900, previous: 26_800 },
  { label: "Aug", revenue: 40_600, previous: 28_200 },
  { label: "Sep", revenue: 42_900, previous: 29_600 },
  { label: "Oct", revenue: 48_210, previous: 31_400 },
];

const MIN = 20_000;
const MAX = 52_000;
const Y_TOP = 6;
const Y_BOTTOM = 94;

function yPercent(value: number) {
  const ratio = (value - MIN) / (MAX - MIN);
  return Y_TOP + (1 - ratio) * (Y_BOTTOM - Y_TOP);
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

const gridValues = [20_000, 28_000, 36_000, 44_000, 52_000];

export function RevenueChart() {
  const [period, setPeriod] = useState<"6M" | "12M">("12M");
  const [active, setActive] = useState<number | null>(null);

  const data = period === "12M" ? revenueSeries : revenueSeries.slice(-6);
  const points = data.map((point, index) => ({
    ...point,
    x: (index / (data.length - 1)) * 100,
    y: yPercent(point.revenue),
  }));

  const currentPath = smoothPath(points);
  const previousPath = smoothPath(
    data.map((point, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: yPercent(point.previous),
    })),
  );
  const areaPath = `${currentPath} L 100 100 L 0 100 Z`;

  const activePoint = active !== null ? points[active] : null;
  const tooltipLeft = activePoint
    ? Math.min(88, Math.max(12, activePoint.x))
    : 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Monthly recurring revenue</CardDescription>
        </div>
        <CardAction>
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
            {(["6M", "12M"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setPeriod(option);
                  setActive(null);
                }}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  period === option
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular">
            $48,210
          </span>
          <Badge variant="success">+12.4%</Badge>
          <span className="pb-1 text-[11px] text-muted-foreground">
            vs. previous month
          </span>
        </div>

        <div className="relative mt-5">
          <div className="relative h-52 w-full pl-9">
            <div className="absolute inset-y-0 left-0 w-8">
              {gridValues.map((value) => (
                <span
                  key={value}
                  className="absolute right-0 -translate-y-1/2 text-[10px] text-muted-foreground/70 tabular"
                  style={{ top: `${yPercent(value)}%` }}
                >
                  ${value / 1000}k
                </span>
              ))}
            </div>

            <div className="relative h-full w-full">
              <svg
                viewBox="-1 0 102 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--chart-1)"
                      stopOpacity="0.26"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--chart-1)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {gridValues.map((value) => (
                  <line
                    key={value}
                    x1="0"
                    x2="100"
                    y1={yPercent(value)}
                    y2={yPercent(value)}
                    stroke="currentColor"
                    strokeOpacity="0.09"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    className="text-foreground"
                  />
                ))}

                <path d={areaPath} fill="url(#revenueGradient)" />

                <path
                  d={previousPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="text-muted-foreground"
                />

                <path
                  d={currentPath}
                  fill="none"
                  stroke="var(--chart-1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />

                {activePoint ? (
                  <line
                    x1={activePoint.x}
                    x2={activePoint.x}
                    y1="0"
                    y2="100"
                    stroke="var(--chart-1)"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
              </svg>

              <div className="absolute inset-0 flex">
                {points.map((point, index) => (
                  <button
                    key={point.label}
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    aria-label={`${point.label} revenue ${formatCurrency(point.revenue)}`}
                    className="h-full flex-1 cursor-default outline-none"
                  />
                ))}
              </div>

              {activePoint ? (
                <>
                  <div
                    className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-violet-500 shadow-[0_0_0_3px] shadow-violet-500/20"
                    style={{
                      left: `${activePoint.x}%`,
                      top: `${activePoint.y}%`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-3"
                    style={{ left: `${tooltipLeft}%`, top: `${activePoint.y}%` }}
                  >
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl shadow-black/30">
                      <p className="text-[10px] text-muted-foreground">
                        {activePoint.label} 2026
                      </p>
                      <p className="mt-0.5 text-xs font-semibold tabular">
                        {formatCurrency(activePoint.revenue)}
                      </p>
                      <p className="text-[10px] text-muted-foreground tabular">
                        Prev. {formatCurrency(activePoint.previous)}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex pl-9 text-[10px] text-muted-foreground">
            {data.map((point) => (
              <span key={point.label} className="flex-1 text-center">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-2 border-t border-border py-3">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-violet-500" />
            This year
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-muted-foreground/60" />
            Previous year
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/70">
          Updated 2 min ago
        </span>
      </CardFooter>
    </Card>
  );
}
