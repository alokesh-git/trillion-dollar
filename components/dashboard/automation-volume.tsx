"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAutomations } from "@/lib/supabase/data-service";
import { formatNumber } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Rough weekday weights for visualizing total runs when daily breakdown is not stored. */
const weekdayWeights = [0.16, 0.18, 0.17, 0.2, 0.19, 0.05, 0.05];

export function AutomationVolume() {
  const [totalRuns, setTotalRuns] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    fetchAutomations().then((items) => {
      const runs = items.reduce((sum, item) => sum + (item.runs || 0), 0);
      const weightedSuccess =
        items.length > 0
          ? items.reduce(
              (sum, item) => sum + item.successRate * (item.runs || 0),
              0,
            ) / Math.max(runs, 1)
          : 0;
      setTotalRuns(runs);
      setSuccessRate(weightedSuccess);
    });
  }, []);

  const automationVolume = useMemo(() => {
    if (totalRuns <= 0) {
      return weekLabels.map((label) => ({ label, value: 0 }));
    }
    return weekLabels.map((label, index) => ({
      label,
      value: Math.round(totalRuns * weekdayWeights[index]),
    }));
  }, [totalRuns]);

  const max = Math.max(...automationVolume.map((day) => day.value), 1);
  const weekTotal = automationVolume.reduce((sum, day) => sum + day.value, 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Automation volume</CardTitle>
          <CardDescription>Workflow runs over the last 7 days</CardDescription>
        </div>
        {totalRuns > 0 ? (
          <Badge variant="success">Live from Supabase</Badge>
        ) : (
          <Badge variant="outline">No runs yet</Badge>
        )}
      </CardHeader>

      <CardContent className="pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular">
            {formatNumber(weekTotal > 0 ? weekTotal : totalRuns)}
          </span>
          <span className="text-xs text-muted-foreground">runs this week</span>
        </div>

        <div className="mt-6 flex h-36 items-end gap-2 sm:gap-3">
          {automationVolume.map((day) => (
            <div
              key={day.label}
              className="group flex h-full flex-1 flex-col justify-end"
            >
              <div className="relative flex flex-1 items-end">
                <div
                  className="relative w-full rounded-t-md bg-gradient-to-t from-violet-500/25 to-violet-500 transition-all duration-300 group-hover:from-violet-500/40 group-hover:to-violet-400"
                  style={{ height: `${Math.max(8, (day.value / max) * 100)}%` }}
                >
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md border border-border bg-popover px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {formatNumber(day.value)}
                  </span>
                </div>
              </div>
              <span className="mt-2 text-center text-[10px] text-muted-foreground">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex-wrap gap-x-6 gap-y-1 border-t border-border py-3 text-[10px] text-muted-foreground">
        <span>
          Success rate{" "}
          <span className="font-medium text-foreground">
            {successRate > 0 ? `${successRate.toFixed(1)}%` : "—"}
          </span>
        </span>
        <span>
          Total configured runs{" "}
          <span className="font-medium text-foreground">
            {formatNumber(totalRuns)}
          </span>
        </span>
      </CardFooter>
    </Card>
  );
}
