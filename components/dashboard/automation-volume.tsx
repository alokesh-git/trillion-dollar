import { automationVolume } from "@/lib/data";
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

export function AutomationVolume() {
  const max = Math.max(...automationVolume.map((day) => day.value));
  const total = automationVolume.reduce((sum, day) => sum + day.value, 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Automation volume</CardTitle>
          <CardDescription>Workflow runs over the last 7 days</CardDescription>
        </div>
        <Badge variant="success">+18.9%</Badge>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular">
            {formatNumber(total)}
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
          <span className="font-medium text-foreground">94.6%</span>
        </span>
        <span>
          Avg. duration{" "}
          <span className="font-medium text-foreground">1.4s</span>
        </span>
        <span>
          Failed runs <span className="font-medium text-foreground">312</span>
        </span>
      </CardFooter>
    </Card>
  );
}
