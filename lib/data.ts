import type { IconName } from "@/components/icon";

export type AppStatus = "live" | "degraded" | "building" | "paused";
export type Environment = "Production" | "Staging" | "Preview";
export type Tone =
  | "violet"
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "fuchsia"
  | "indigo"
  | "cyan";

export interface AppItem {
  id: string;
  name: string;
  description: string;
  status: AppStatus;
  environment: Environment;
  framework: string;
  region: string;
  requests: number;
  lastDeploy: string;
  version: string;
  icon: IconName;
  tone: Tone;
  /** Optional custom favicon or logo URL; overrides glyph when set. */
  iconUrl?: string;
}

export type ToolCategory =
  | "Infrastructure"
  | "Developer"
  | "Revenue"
  | "Growth"
  | "Observability";

export type ToolStatus = "connected" | "available" | "beta";

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  icon: IconName;
  tone: Tone;
  meta: string;
}

export type AutomationStatus = "active" | "paused";

export interface AutomationItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: AutomationStatus;
  runs: number;
  successRate: number;
  lastRun: string;
  icon: IconName;
  tone: Tone;
}

export interface AutomationRun {
  id: string;
  workflow: string;
  status: "success" | "failed" | "running" | "skipped";
  duration: string;
  started: string;
  reference: string;
}

export interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  icon: IconName;
  tone: Tone;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Developer" | "Billing" | "Member" | "Viewer";
  status: "Active" | "Invited";
  lastActive: string;
  tone: Tone;
}

export interface ChartPoint {
  label: string;
  revenue: number;
  previous: number;
}

export interface UsageMeter {
  label: string;
  percent: number;
  display: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Open";
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  created: string;
  lastUsed: string;
  status?: "active" | "revoked";
}
