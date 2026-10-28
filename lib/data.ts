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
}

export const apps: AppItem[] = [
  {
    id: "app_billing",
    name: "Billing API",
    description: "Subscriptions, invoices & payment webhooks",
    status: "live",
    environment: "Production",
    framework: "Next.js",
    region: "iad1",
    requests: 8_420_000,
    lastDeploy: "12m ago",
    version: "v2.8.1",
    icon: "credit-card",
    tone: "violet",
  },
  {
    id: "app_portal",
    name: "Customer Portal",
    description: "Self-serve account and subscription management",
    status: "live",
    environment: "Production",
    framework: "Next.js",
    region: "fra1",
    requests: 3_180_000,
    lastDeploy: "2h ago",
    version: "v1.14.0",
    icon: "layout-dashboard",
    tone: "sky",
  },
  {
    id: "app_growth",
    name: "Growth Engine",
    description: "Lifecycle campaigns and in-app experiments",
    status: "degraded",
    environment: "Production",
    framework: "Node.js",
    region: "sfo1",
    requests: 1_940_000,
    lastDeploy: "46m ago",
    version: "v0.9.4",
    icon: "rocket",
    tone: "amber",
  },
  {
    id: "app_docs",
    name: "Docs Site",
    description: "Developer documentation and API reference",
    status: "building",
    environment: "Staging",
    framework: "Astro",
    region: "iad1",
    requests: 642_000,
    lastDeploy: "4d ago",
    version: "v3.2.0",
    icon: "book-open",
    tone: "emerald",
  },
  {
    id: "app_webhooks",
    name: "Webhook Relay",
    description: "Durable event delivery with automatic retries",
    status: "live",
    environment: "Production",
    framework: "Go",
    region: "sin1",
    requests: 12_740_000,
    lastDeploy: "1d ago",
    version: "v4.0.2",
    icon: "webhook",
    tone: "fuchsia",
  },
  {
    id: "app_admin",
    name: "Admin Console",
    description: "Internal support and incident tooling",
    status: "paused",
    environment: "Preview",
    framework: "Next.js",
    region: "iad1",
    requests: 128_000,
    lastDeploy: "2w ago",
    version: "v0.4.1",
    icon: "shield",
    tone: "rose",
  },
];

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

export const tools: ToolItem[] = [
  {
    id: "tool_vercel",
    name: "Vercel",
    description: "Deployments, previews and custom domains for every app.",
    category: "Infrastructure",
    status: "connected",
    icon: "triangle",
    tone: "violet",
    meta: "6 projects",
  },
  {
    id: "tool_stripe",
    name: "Stripe",
    description: "Subscriptions, usage billing and revenue reporting.",
    category: "Revenue",
    status: "connected",
    icon: "credit-card",
    tone: "indigo",
    meta: "Live mode",
  },
  {
    id: "tool_resend",
    name: "Resend",
    description: "Transactional email and lifecycle campaigns.",
    category: "Growth",
    status: "connected",
    icon: "mail",
    tone: "emerald",
    meta: "24.8k sent",
  },
  {
    id: "tool_supabase",
    name: "Supabase",
    description: "Postgres database, storage and row-level security.",
    category: "Infrastructure",
    status: "connected",
    icon: "database",
    tone: "emerald",
    meta: "142 GB",
  },
  {
    id: "tool_posthog",
    name: "PostHog",
    description: "Product analytics, funnels and session replays.",
    category: "Observability",
    status: "connected",
    icon: "bar-chart",
    tone: "amber",
    meta: "1.2M events",
  },
  {
    id: "tool_sentry",
    name: "Sentry",
    description: "Error tracking and performance monitoring.",
    category: "Observability",
    status: "connected",
    icon: "bug",
    tone: "rose",
    meta: "0 open issues",
  },
  {
    id: "tool_clerk",
    name: "Clerk",
    description: "Drop-in authentication, SSO and user management.",
    category: "Developer",
    status: "available",
    icon: "key-round",
    tone: "sky",
    meta: "Not connected",
  },
  {
    id: "tool_github",
    name: "GitHub",
    description: "Repositories, pull requests and CI checks.",
    category: "Developer",
    status: "connected",
    icon: "github",
    tone: "cyan",
    meta: "12 repositories",
  },
  {
    id: "tool_openai",
    name: "OpenAI",
    description: "Power summaries, support replies and search.",
    category: "Developer",
    status: "beta",
    icon: "sparkles",
    tone: "violet",
    meta: "Beta access",
  },
  {
    id: "tool_slack",
    name: "Slack",
    description: "Deployment alerts and automation notifications.",
    category: "Growth",
    status: "available",
    icon: "message-square",
    tone: "fuchsia",
    meta: "Not connected",
  },
  {
    id: "tool_cloudflare",
    name: "Cloudflare",
    description: "CDN, DNS and edge caching for global traffic.",
    category: "Infrastructure",
    status: "available",
    icon: "cloud",
    tone: "amber",
    meta: "Not connected",
  },
  {
    id: "tool_linear",
    name: "Linear",
    description: "Issues, project cycles and product roadmap.",
    category: "Developer",
    status: "available",
    icon: "kanban",
    tone: "indigo",
    meta: "Not connected",
  },
];

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

export const automations: AutomationItem[] = [
  {
    id: "auto_dunning",
    name: "Failed payment recovery",
    description: "Retry the charge and send a branded dunning email.",
    trigger: "invoice.payment_failed",
    action: "Retry + email",
    status: "active",
    runs: 1_284,
    successRate: 98.2,
    lastRun: "4m ago",
    icon: "credit-card",
    tone: "violet",
  },
  {
    id: "auto_onboarding",
    name: "New signup onboarding",
    description: "Create a workspace, seed data and send the welcome email.",
    trigger: "user.created",
    action: "Workspace setup",
    status: "active",
    runs: 842,
    successRate: 99.6,
    lastRun: "18m ago",
    icon: "user-plus",
    tone: "emerald",
  },
  {
    id: "auto_digest",
    name: "Weekly usage digest",
    description: "Compile product metrics into a Monday morning summary.",
    trigger: "Monday · 09:00",
    action: "Email digest",
    status: "active",
    runs: 52,
    successRate: 100,
    lastRun: "2d ago",
    icon: "calendar",
    tone: "sky",
  },
  {
    id: "auto_churn",
    name: "Churn risk alert",
    description: "Notify the success team when weekly usage drops sharply.",
    trigger: "usage.drop > 40%",
    action: "Slack alert",
    status: "active",
    runs: 136,
    successRate: 96.3,
    lastRun: "1h ago",
    icon: "trending-down",
    tone: "amber",
  },
  {
    id: "auto_invoice",
    name: "Invoice sync",
    description: "Append every paid invoice to the finance spreadsheet.",
    trigger: "invoice.paid",
    action: "Append row",
    status: "paused",
    runs: 318,
    successRate: 99.1,
    lastRun: "6d ago",
    icon: "file-spreadsheet",
    tone: "fuchsia",
  },
  {
    id: "auto_trial",
    name: "Trial ending reminder",
    description: "Send a reminder and show an in-app upgrade banner.",
    trigger: "trial.ending",
    action: "Email + banner",
    status: "active",
    runs: 467,
    successRate: 97.8,
    lastRun: "3h ago",
    icon: "bell",
    tone: "rose",
  },
];

export interface AutomationRun {
  id: string;
  workflow: string;
  status: "success" | "failed" | "running" | "skipped";
  duration: string;
  started: string;
  reference: string;
}

export const automationRuns: AutomationRun[] = [
  {
    id: "run_9f2",
    workflow: "Failed payment recovery",
    status: "success",
    duration: "1.2s",
    started: "4m ago",
    reference: "cus_N4f…9x",
  },
  {
    id: "run_8ka",
    workflow: "Churn risk alert",
    status: "success",
    duration: "0.4s",
    started: "1h ago",
    reference: "team_82…k1",
  },
  {
    id: "run_7bc",
    workflow: "New signup onboarding",
    status: "failed",
    duration: "8.2s",
    started: "1h ago",
    reference: "usr_7d…2m",
  },
  {
    id: "run_6dd",
    workflow: "Invoice sync",
    status: "skipped",
    duration: "0.1s",
    started: "2h ago",
    reference: "in_3k…88",
  },
  {
    id: "run_5ee",
    workflow: "Trial ending reminder",
    status: "success",
    duration: "0.9s",
    started: "3h ago",
    reference: "trial_9…aa",
  },
  {
    id: "run_4ff",
    workflow: "Weekly usage digest",
    status: "success",
    duration: "12.4s",
    started: "2d ago",
    reference: "digest_22",
  },
];

export interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  icon: IconName;
  tone: Tone;
}

export const activities: Activity[] = [
  {
    id: "act_1",
    actor: "Maya Chen",
    action: "deployed",
    target: "Billing API v2.8.1 to production",
    time: "12m ago",
    icon: "rocket",
    tone: "violet",
  },
  {
    id: "act_2",
    actor: "Stripe webhook",
    action: "failed and retried successfully",
    target: "invoice.payment_failed",
    time: "28m ago",
    icon: "webhook",
    tone: "amber",
  },
  {
    id: "act_3",
    actor: "Daniel Okafor",
    action: "invited 2 members to",
    target: "Growth Engine",
    time: "1h ago",
    icon: "users",
    tone: "sky",
  },
  {
    id: "act_4",
    actor: "Automation",
    action: "triggered 3 times",
    target: "Churn risk alert",
    time: "2h ago",
    icon: "workflow",
    tone: "fuchsia",
  },
  {
    id: "act_5",
    actor: "Priya Raman",
    action: "rotated the production API key",
    target: "Billing API",
    time: "4h ago",
    icon: "key-round",
    tone: "emerald",
  },
  {
    id: "act_6",
    actor: "Sentry",
    action: "resolved an issue in",
    target: "Customer Portal",
    time: "6h ago",
    icon: "shield-check",
    tone: "rose",
  },
];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Developer" | "Billing";
  status: "Active" | "Invited";
  lastActive: string;
  tone: Tone;
}

export const teamMembers: TeamMember[] = [
  {
    id: "usr_maya",
    name: "Maya Chen",
    email: "maya@trilliondollar.com",
    role: "Owner",
    status: "Active",
    lastActive: "2m ago",
    tone: "violet",
  },
  {
    id: "usr_daniel",
    name: "Daniel Okafor",
    email: "daniel@trilliondollar.com",
    role: "Admin",
    status: "Active",
    lastActive: "1h ago",
    tone: "sky",
  },
  {
    id: "usr_priya",
    name: "Priya Raman",
    email: "priya@trilliondollar.com",
    role: "Developer",
    status: "Active",
    lastActive: "3h ago",
    tone: "emerald",
  },
  {
    id: "usr_lucas",
    name: "Lucas Meyer",
    email: "lucas@trilliondollar.com",
    role: "Developer",
    status: "Invited",
    lastActive: "—",
    tone: "amber",
  },
  {
    id: "usr_sofia",
    name: "Sofia Alvarez",
    email: "sofia@trilliondollar.com",
    role: "Billing",
    status: "Active",
    lastActive: "1d ago",
    tone: "fuchsia",
  },
];

export interface ChartPoint {
  label: string;
  revenue: number;
  previous: number;
}

export const revenueSeries: ChartPoint[] = [
  { label: "Nov", revenue: 25_800, previous: 17_400 },
  { label: "Dec", revenue: 27_400, previous: 18_200 },
  { label: "Jan", revenue: 28_900, previous: 19_100 },
  { label: "Feb", revenue: 30_200, previous: 20_300 },
  { label: "Mar", revenue: 31_800, previous: 21_600 },
  { label: "Apr", revenue: 33_100, previous: 22_900 },
  { label: "May", revenue: 34_900, previous: 24_100 },
  { label: "Jun", revenue: 36_800, previous: 25_600 },
  { label: "Jul", revenue: 38_900, previous: 26_800 },
  { label: "Aug", revenue: 40_600, previous: 28_200 },
  { label: "Sep", revenue: 42_900, previous: 29_600 },
  { label: "Oct", revenue: 48_210, previous: 31_400 },
];

export const automationVolume = [
  { label: "Mon", value: 6_420 },
  { label: "Tue", value: 7_180 },
  { label: "Wed", value: 6_890 },
  { label: "Thu", value: 8_240 },
  { label: "Fri", value: 7_910 },
  { label: "Sat", value: 4_380 },
  { label: "Sun", value: 4_120 },
];

export const usage = [
  { label: "Seats", percent: 67, display: "8 of 12" },
  { label: "API calls", percent: 68, display: "6.8M of 10M" },
  { label: "Storage", percent: 57, display: "142 of 250 GB" },
  { label: "Bandwidth", percent: 60, display: "1.2 of 2 TB" },
];

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Open";
}

export const invoices: Invoice[] = [
  { id: "INV-2026-010", date: "Oct 1, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-2026-009", date: "Sep 1, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$199.00", status: "Paid" },
];

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  created: string;
  lastUsed: string;
  status?: "active" | "revoked";
}

export const apiKeys: ApiKey[] = [
  {
    id: "key_prod",
    name: "Production",
    prefix: "sk_live_••••••••9f2a",
    scope: "Full access",
    created: "Jan 12, 2026",
    lastUsed: "2m ago",
  },
  {
    id: "key_staging",
    name: "Staging",
    prefix: "sk_test_••••••••4b1c",
    scope: "Read & write",
    created: "Mar 4, 2026",
    lastUsed: "1h ago",
  },
  {
    id: "key_ci",
    name: "CI pipeline",
    prefix: "sk_live_••••••••7d8e",
    scope: "Deploy only",
    created: "Jun 18, 2026",
    lastUsed: "3h ago",
  },
];
