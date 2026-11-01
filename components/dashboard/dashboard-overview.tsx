"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { UsageCard } from "@/components/dashboard/usage-card";
import { AppsCard } from "@/components/dashboard/apps-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AutomationVolume } from "@/components/dashboard/automation-volume";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { fetchApps, fetchAutomations } from "@/lib/supabase/data-service";
import { type AppItem, type AutomationItem } from "@/lib/data";
import { formatCompact } from "@/lib/utils";

export function DashboardOverview() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [automations, setAutomations] = useState<AutomationItem[]>([]);

  useEffect(() => {
    fetchApps().then(setApps);
    fetchAutomations().then(setAutomations);
  }, []);

  const liveAppsCount = apps.filter((a) => a.status === "live").length;
  const degradedCount = apps.filter((a) => a.status === "degraded").length;
  const pausedCount = apps.filter((a) => a.status === "paused").length;
  const totalRuns = automations.reduce((sum, a) => sum + (a.runs || 0), 0);

  return (
    <div className="min-w-0 space-y-6">

      <PageHeader
        title="Overview"
        description="Here's how your SaaS is performing across every app, tool and workflow, backed dynamically by Supabase."
      >
        <Badge variant="success" className="h-9 gap-1.5 px-3 text-xs">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          All systems operational
        </Badge>
        <Link href="/apps" className={buttonClasses()}>
          <Plus className="size-4" />
          Add app
        </Link>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly revenue"
          value="$48,210"
          change="+12.4%"
          footnote="vs. $42,890 last month"
          icon="credit-card"
          tone="violet"
          spark={[25, 27, 26, 30, 31, 33, 35, 34, 38, 40, 43, 48]}
        />
        <StatCard
          label="Active users"
          value="12,847"
          change="+8.2%"
          footnote="1,024 new this month"
          icon="users"
          tone="sky"
          spark={[4, 5, 6, 5, 7, 8, 7, 9, 10, 11, 12, 13]}
        />
        <StatCard
          label="Total apps"
          value={String(apps.length)}
          change={apps.length > 0 ? `+${apps.length}` : "—"}
          footnote={`${liveAppsCount} live · ${degradedCount} degraded · ${pausedCount} paused`}
          icon="app-window"
          tone="emerald"
          spark={[2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, Math.max(apps.length, 1)]}
        />
        <StatCard
          label="Automation runs"
          value={totalRuns > 0 ? formatCompact(totalRuns) : "0"}
          change={totalRuns > 0 ? "+18.9%" : "—"}
          footnote="98.8% success rate"
          icon="workflow"
          tone="fuchsia"
          spark={[20, 24, 22, 28, 26, 31, 35, 33, 38, 41, 44, 48]}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <RevenueChart />
        <UsageCard />
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-3">
        <AppsCard />
        <ActivityFeed />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <AutomationVolume />
        <QuickActions />
      </section>
    </div>
  );
}
