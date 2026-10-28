"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { type Activity } from "@/lib/data";
import { fetchActivities } from "@/lib/supabase/data-service";
import { softTone } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ActivityFeed() {
  const [items, setItems] = useState<Activity[]>([]);

  useEffect(() => {
    fetchActivities().then(setItems);
  }, []);

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden">
      <CardHeader>
        <div className="min-w-0 flex-1">
          <CardTitle>Recent activity</CardTitle>
          <CardDescription className="text-balance break-words">
            Live audit log synchronized with Supabase
          </CardDescription>
        </div>
        <CardAction>
          <button
            type="button"
            aria-label="Activity options"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </CardAction>
      </CardHeader>

      <CardContent className="min-w-0 flex-1 pt-4">
        <ol className="relative min-w-0 space-y-4">
          <span className="absolute top-2 bottom-2 left-[13px] w-px bg-border" />
          {items.slice(0, 5).map((activity) => (
            <li key={activity.id} className="relative flex min-w-0 gap-3">
              <span
                className={cn(
                  "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                  softTone[activity.tone] || softTone.violet,
                )}
              >
                <Icon name={activity.icon} className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] leading-relaxed break-words">
                  <span className="font-medium">{activity.actor}</span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  {activity.time}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>

      <CardFooter className="border-t border-border py-3">
        <Link
          href="/automation"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all activity
          <ArrowRight className="size-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
