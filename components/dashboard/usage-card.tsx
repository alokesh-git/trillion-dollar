import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { UsageMeter } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const planUsage: UsageMeter[] = [
  { label: "Seats", percent: 67, display: "8 of 12" },
  { label: "API calls", percent: 68, display: "6.8M of 10M" },
  { label: "Storage", percent: 57, display: "142 of 250 GB" },
  { label: "Bandwidth", percent: 60, display: "1.2 of 2 TB" },
];

export function UsageCard() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Plan usage</CardTitle>
          <CardDescription>Pro plan · renews Nov 1, 2026</CardDescription>
        </div>
        <Badge variant="violet">Pro</Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {planUsage.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium tabular">{item.display}</span>
            </div>
            <Progress value={item.percent} className="mt-2 h-1.5" />
          </div>
        ))}

        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-violet-500 dark:text-violet-400" />
            <p className="text-xs font-medium">Need more headroom?</p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Scale includes 50M API calls, unlimited seats and priority support.
          </p>
          <Link
            href="/settings"
            className={cn(buttonClasses({ size: "sm" }), "mt-3 w-full")}
          >
            Upgrade to Scale
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
