import type { IconName } from "@/components/icon";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  description: string;
  badge?: string;
}

export const platformNav: NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: "layout-dashboard",
    description: "Revenue, usage and recent activity",
  },
  {
    label: "Apps",
    href: "/apps",
    icon: "app-window",
    description: "Manage every app in your workspace",
    badge: "6",
  },
  {
    label: "Tools",
    href: "/tools",
    icon: "wrench",
    description: "Integrations connected to your stack",
  },
  {
    label: "Automation",
    href: "/automation",
    icon: "workflow",
    description: "Workflows, runs and triggers",
    badge: "4",
  },
  {
    label: "Planning",
    href: "/planning",
    icon: "kanban",
    description: "Roadmap, staging lanes, and release versions",
  },
];

export const workspaceNav: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: "shield",
    description: "Workspace, team, billing and API keys",
  },
];

export const allNav = [...platformNav, ...workspaceNav];
