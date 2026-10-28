"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type AppItem } from "@/lib/data";
import { fetchApps } from "@/lib/supabase/data-service";
import { formatCompact } from "@/lib/utils";
import { AppIcon } from "@/components/app-icon";
import { AppStatusBadge } from "@/components/app-status-badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AppsCard() {
  const [appsList, setAppsList] = useState<AppItem[]>([]);

  useEffect(() => {
    fetchApps().then(setAppsList);
  }, []);

  const visible = appsList.slice(0, 4);

  return (
    <Card className="min-w-0 overflow-hidden lg:col-span-2">
      <CardHeader>
        <div className="min-w-0 flex-1">
          <CardTitle>Apps</CardTitle>
          <CardDescription className="text-balance break-words">
            {appsList.length} apps across production, staging and preview
          </CardDescription>
        </div>
        <CardAction>
          <Link
            href="/apps"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="min-w-0 px-0 pt-4 pb-0">
        <div className="min-w-0 border-t border-border">
          {visible.map((app) => (
            <Link
              key={app.id}
              href="/apps"
              className="flex min-w-0 items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-muted/30 sm:px-5"
            >
              <AppIcon
                name={app.icon}
                tone={app.tone}
                className="size-9 shrink-0"
                iconClassName="size-4"
              />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs font-medium">
                    {app.name}
                  </p>
                  <AppStatusBadge
                    status={app.status}
                    className="shrink-0 sm:hidden"
                  />
                </div>
                <p className="truncate text-[10px] text-muted-foreground">
                  {app.description}
                </p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-xs font-medium tabular-nums">
                  {formatCompact(app.requests)}
                </p>
                <p className="text-[10px] text-muted-foreground">requests</p>
              </div>
              <div className="hidden shrink-0 text-right md:block">
                <p className="text-xs font-medium">{app.lastDeploy}</p>
                <p className="text-[10px] text-muted-foreground">last deploy</p>
              </div>
              <AppStatusBadge
                status={app.status}
                className="ml-1 hidden shrink-0 sm:inline-flex"
              />
            </Link>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="min-w-0 text-[10px] text-muted-foreground">
          {appsList.length} applications synced with Supabase
        </span>
        <Link
          href="/apps"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
        >
          Manage apps
          <ArrowRight className="size-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
