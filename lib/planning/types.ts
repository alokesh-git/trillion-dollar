export type PanelLayout = "full" | "half" | "third";

export type PanelKind = "vision" | "board" | "versions" | "notes" | "apps";

export type FeaturePriority = "low" | "medium" | "high";

export type VersionStatus = "draft" | "staging" | "production" | "archived";

export type StageTone = "violet" | "sky" | "amber" | "emerald" | "fuchsia" | "rose";

export interface PlanningPanel {
  id: string;
  kind: PanelKind;
  title: string;
  visible: boolean;
  collapsed: boolean;
  layout: PanelLayout;
  body: string;
}

export interface PlanningStage {
  id: string;
  name: string;
  tone: StageTone;
}

export interface PlanningFeature {
  id: string;
  title: string;
  description: string;
  stageId: string;
  targetVersion: string;
  priority: FeaturePriority;
  tags: string[];
  /** Workspace app id from Apps (Supabase) */
  appId?: string;
}

export interface PlanningVersion {
  id: string;
  version: string;
  codename: string;
  status: VersionStatus;
  targetDate: string;
  highlights: string;
}

export interface PlanningWorkspace {
  panels: PlanningPanel[];
  stages: PlanningStage[];
  features: PlanningFeature[];
  versions: PlanningVersion[];
  updatedAt: string;
}
