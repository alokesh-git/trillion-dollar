import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { softTone } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icon";
import type { Tone } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions: {
  title: string;
  description: string;
  href: string;
  icon: IconName;
  tone: Tone;
}[] = [
  {
    title: "Create an app",
    description: "Ship a new service from a template",
    href: "/apps",
    icon: "rocket",
    tone: "violet",
  },
  {
    title: "Connect a tool",
    description: "Add an integration to your stack",
    href: "/tools",
    icon: "wrench",
    tone: "sky",
  },
  {
    title: "Build a workflow",
    description: "Automate a repeatable process",
    href: "/automation",
    icon: "workflow",
    tone: "fuchsia",
  },
  {
    title: "Invite a teammate",
    description: "Bring someone into the workspace",
    href: "/settings",
    icon: "users",
    tone: "emerald",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Jump back into the work</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-1 pt-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/40"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                softTone[action.tone],
              )}
            >
              <Icon name={action.icon} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium">{action.title}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {action.description}
              </p>
            </div>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
