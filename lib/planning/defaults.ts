import type { PlanningWorkspace } from "@/lib/planning/types";

const now = () => new Date().toISOString();

export function createDefaultPlanningWorkspace(): PlanningWorkspace {
  const stages = [
    { id: "stage-backlog", name: "Backlog", tone: "violet" as const },
    { id: "stage-planning", name: "Planning", tone: "sky" as const },
    { id: "stage-build", name: "In development", tone: "amber" as const },
    { id: "stage-staging", name: "Staging", tone: "fuchsia" as const },
    { id: "stage-shipped", name: "Shipped", tone: "emerald" as const },
  ];

  return {
    updatedAt: now(),
    stages,
    panels: [
      {
        id: "panel-vision",
        kind: "vision",
        title: "High-level plan",
        visible: true,
        collapsed: false,
        layout: "full",
        body:
          "## North star\nShip a modular SaaS console that teams can extend with apps, tools, and automation.\n\n## This quarter\n- Harden Supabase-backed workflows\n- Polish mobile responsiveness across the dashboard\n- Launch planning workspace for roadmap alignment",
      },
      {
        id: "panel-apps",
        kind: "apps",
        title: "Apps ↔ planning",
        visible: true,
        collapsed: false,
        layout: "full",
        body: "",
      },
      {
        id: "panel-board",
        kind: "board",
        title: "Features by stage",
        visible: true,
        collapsed: false,
        layout: "full",
        body: "",
      },
      {
        id: "panel-versions",
        kind: "versions",
        title: "Release versions",
        visible: true,
        collapsed: false,
        layout: "half",
        body: "",
      },
      {
        id: "panel-notes",
        kind: "notes",
        title: "Planning notes",
        visible: true,
        collapsed: false,
        layout: "half",
        body:
          "Capture decisions, open questions, and links to specs. Duplicate this panel from Customize layout when you need another scratch space.",
      },
    ],
    features: [
      {
        id: "feat-mobile",
        title: "Mobile header polish",
        description: "Responsive top bar, nav tabs, and overflow-safe cards.",
        stageId: "stage-shipped",
        targetVersion: "v0.4.0",
        priority: "high",
        tags: ["UX", "Responsive"],
        appId: "app_portal",
      },
      {
        id: "feat-planning",
        title: "Planning workspace",
        description: "Custom panels for roadmap, staging lanes, and semver tracking.",
        stageId: "stage-build",
        targetVersion: "v0.5.0",
        priority: "high",
        tags: ["Product", "Roadmap"],
        appId: "app_billing",
      },
      {
        id: "feat-automation",
        title: "Automation run insights",
        description: "Surface failure rates and retry controls on the overview.",
        stageId: "stage-planning",
        targetVersion: "v0.5.0",
        priority: "medium",
        tags: ["Automation"],
        appId: "app_growth",
      },
    ],
    versions: [
      {
        id: "ver-040",
        version: "v0.4.0",
        codename: "Responsive",
        status: "production",
        targetDate: "2026-10-29",
        highlights: "Mobile layout fixes across dashboard shells and cards.",
      },
      {
        id: "ver-050",
        version: "v0.5.0",
        codename: "Horizon",
        status: "staging",
        targetDate: "2026-11-15",
        highlights: "Planning workspace, automation insights, settings cleanup.",
      },
      {
        id: "ver-060",
        version: "v0.6.0",
        codename: "Scale",
        status: "draft",
        targetDate: "2026-12-01",
        highlights: "Team permissions, billing hooks, public status page.",
      },
    ],
  };
}
