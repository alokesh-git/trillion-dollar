-- ==============================================================================
-- trillion-DOLLAR-SHEET: Supabase Schema & Initial Seed
-- Follows supabase-postgres-best-practices:
-- - Lowercase snake_case identifiers
-- - timestamptz for date & time
-- - RLS enabled on all tables with explicit policies
-- - B-tree indexes on filtered columns & foreign keys
-- - Trigger for updated_at timestamps
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------------------------
-- 2. APPS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.apps (
  id text primary key,
  name text not null,
  description text not null default '',
  status text not null check (status in ('live', 'degraded', 'building', 'paused')),
  environment text not null check (environment in ('Production', 'Staging', 'Preview')),
  framework text not null default 'Next.js',
  region text not null default 'iad1',
  requests bigint not null default 0,
  last_deploy text not null default 'just now',
  version text not null default 'v1.0.0',
  icon text not null default 'app-window',
  tone text not null default 'violet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_apps_status on public.apps (status);
create index if not exists idx_apps_environment on public.apps (environment);
create index if not exists idx_apps_created_at on public.apps (created_at desc);

alter table public.apps enable row level security;

create policy "Public full access to apps"
  on public.apps
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop trigger if exists trg_apps_updated_at on public.apps;
create trigger trg_apps_updated_at
  before update on public.apps
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. TOOLS / INTEGRATIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.tools (
  id text primary key,
  name text not null,
  description text not null default '',
  category text not null check (category in ('Infrastructure', 'Developer', 'Revenue', 'Growth', 'Observability')),
  status text not null check (status in ('connected', 'available', 'beta')),
  icon text not null default 'wrench',
  tone text not null default 'violet',
  meta text not null default '',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tools_category on public.tools (category);
create index if not exists idx_tools_status on public.tools (status);

alter table public.tools enable row level security;

create policy "Public full access to tools"
  on public.tools
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop trigger if exists trg_tools_updated_at on public.tools;
create trigger trg_tools_updated_at
  before update on public.tools
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. AUTOMATIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.automations (
  id text primary key,
  name text not null,
  description text not null default '',
  trigger text not null,
  action text not null,
  status text not null check (status in ('active', 'paused')),
  runs bigint not null default 0,
  success_rate numeric(5,2) not null default 100.0,
  last_run text not null default 'Never',
  icon text not null default 'workflow',
  tone text not null default 'violet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_automations_status on public.automations (status);

alter table public.automations enable row level security;

create policy "Public full access to automations"
  on public.automations
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop trigger if exists trg_automations_updated_at on public.automations;
create trigger trg_automations_updated_at
  before update on public.automations
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. AUTOMATION RUNS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.automation_runs (
  id text primary key,
  automation_id text references public.automations(id) on delete cascade,
  workflow text not null,
  status text not null check (status in ('success', 'failed', 'running', 'skipped')),
  duration text not null default '0.5s',
  started text not null default 'just now',
  reference text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_automation_runs_auto_id on public.automation_runs (automation_id);
create index if not exists idx_automation_runs_created on public.automation_runs (created_at desc);

alter table public.automation_runs enable row level security;

create policy "Public full access to automation runs"
  on public.automation_runs
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------------------------
-- 6. ACTIVITIES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.activities (
  id text primary key,
  actor text not null,
  action text not null,
  target text not null,
  time text not null default 'just now',
  icon text not null default 'activity',
  tone text not null default 'violet',
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_created on public.activities (created_at desc);

alter table public.activities enable row level security;

create policy "Public full access to activities"
  on public.activities
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------------------------
-- 7. WORKSPACE SETTINGS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.workspace_settings (
  id text primary key default 'default',
  name text not null default 'trillion Dollar Labs',
  slug text not null default 'trillion-dollar-labs',
  domain text not null default 'trilliondollar.sh',
  plan text not null default 'Pro',
  billing_email text not null default 'billing@trilliondollar.sh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspace_settings enable row level security;

create policy "Public full access to workspace settings"
  on public.workspace_settings
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop trigger if exists trg_workspace_settings_updated_at on public.workspace_settings;
create trigger trg_workspace_settings_updated_at
  before update on public.workspace_settings
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 8. TEAM MEMBERS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.team_members (
  id text primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('Owner', 'Admin', 'Member', 'Viewer')),
  tone text not null default 'violet',
  joined_at text not null default 'Recently',
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

create policy "Public full access to team members"
  on public.team_members
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------------------------
-- 9. API KEYS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.api_keys (
  id text primary key,
  name text not null,
  prefix text not null,
  token_preview text not null,
  last_used text not null default 'Never',
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

create policy "Public full access to api keys"
  on public.api_keys
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Apps
insert into public.apps (id, name, description, status, environment, framework, region, requests, last_deploy, version, icon, tone)
values
  ('app_billing', 'Billing API', 'Subscriptions, invoices & payment webhooks', 'live', 'Production', 'Next.js', 'iad1', 8420000, '12m ago', 'v2.8.1', 'credit-card', 'violet'),
  ('app_portal', 'Customer Portal', 'Self-serve account and subscription management', 'live', 'Production', 'Next.js', 'fra1', 3180000, '2h ago', 'v1.14.0', 'layout-dashboard', 'sky'),
  ('app_growth', 'Growth Engine', 'Lifecycle campaigns and in-app experiments', 'degraded', 'Production', 'Node.js', 'sfo1', 1940000, '46m ago', 'v0.9.4', 'rocket', 'amber'),
  ('app_docs', 'Docs Site', 'Developer documentation and API reference', 'building', 'Staging', 'Astro', 'iad1', 642000, '4d ago', 'v3.2.0', 'book-open', 'emerald'),
  ('app_webhooks', 'Webhook Relay', 'Durable event delivery with automatic retries', 'live', 'Production', 'Go', 'sin1', 12740000, '1d ago', 'v4.0.2', 'webhook', 'fuchsia'),
  ('app_admin', 'Admin Console', 'Internal support and incident tooling', 'paused', 'Preview', 'Next.js', 'iad1', 128000, '2w ago', 'v0.4.1', 'shield', 'rose')
on conflict (id) do nothing;

-- Seed Tools
insert into public.tools (id, name, description, category, status, icon, tone, meta)
values
  ('tool_vercel', 'Vercel', 'Deployments, previews and custom domains for every app.', 'Infrastructure', 'connected', 'triangle', 'violet', '6 projects'),
  ('tool_stripe', 'Stripe', 'Subscriptions, usage billing and revenue reporting.', 'Revenue', 'connected', 'credit-card', 'indigo', 'Live mode'),
  ('tool_resend', 'Resend', 'Transactional email and lifecycle campaigns.', 'Growth', 'connected', 'mail', 'emerald', '24.8k sent'),
  ('tool_supabase', 'Supabase', 'Postgres database, storage and row-level security.', 'Infrastructure', 'connected', 'database', 'emerald', '142 GB'),
  ('tool_posthog', 'PostHog', 'Product analytics, funnels and session replays.', 'Observability', 'connected', 'bar-chart', 'amber', '1.2M events'),
  ('tool_sentry', 'Sentry', 'Error tracking and performance monitoring.', 'Observability', 'connected', 'bug', 'rose', '0 open issues'),
  ('tool_clerk', 'Clerk', 'Drop-in authentication, SSO and user management.', 'Developer', 'available', 'key-round', 'sky', 'Not connected'),
  ('tool_github', 'GitHub', 'Repositories, pull requests and CI checks.', 'Developer', 'connected', 'github', 'cyan', '12 repositories'),
  ('tool_openai', 'OpenAI', 'Power summaries, support replies and search.', 'Developer', 'beta', 'sparkles', 'violet', 'Beta access'),
  ('tool_slack', 'Slack', 'Deployment alerts and automation notifications.', 'Growth', 'available', 'message-square', 'fuchsia', 'Not connected'),
  ('tool_cloudflare', 'Cloudflare', 'CDN, DNS and edge caching for global traffic.', 'Infrastructure', 'available', 'cloud', 'amber', 'Not connected'),
  ('tool_linear', 'Linear', 'Issues, project cycles and product roadmap.', 'Developer', 'available', 'kanban', 'indigo', 'Not connected')
on conflict (id) do nothing;

-- Seed Automations
insert into public.automations (id, name, description, trigger, action, status, runs, success_rate, last_run, icon, tone)
values
  ('auto_dunning', 'Failed payment recovery', 'Retry the charge and send a branded dunning email.', 'invoice.payment_failed', 'Retry + email', 'active', 1284, 98.2, '4m ago', 'credit-card', 'violet'),
  ('auto_onboarding', 'New signup onboarding', 'Create a workspace, seed data and send the welcome email.', 'user.created', 'Workspace setup', 'active', 842, 99.6, '18m ago', 'user-plus', 'emerald'),
  ('auto_digest', 'Weekly usage digest', 'Compile product metrics into a Monday morning summary.', 'Monday · 09:00', 'Email digest', 'active', 52, 100.0, '2d ago', 'calendar', 'sky'),
  ('auto_churn', 'Churn risk alert', 'Notify the success team when weekly usage drops sharply.', 'usage.drop > 40%', 'Slack alert', 'active', 136, 96.3, '1h ago', 'trending-down', 'amber'),
  ('auto_invoice', 'Invoice sync', 'Append every paid invoice to the finance spreadsheet.', 'invoice.paid', 'Append row', 'paused', 318, 99.1, '6d ago', 'file-spreadsheet', 'fuchsia'),
  ('auto_trial', 'Trial ending reminder', 'Send a reminder and show an in-app upgrade banner.', 'trial.ending', 'Email + banner', 'active', 467, 97.8, '3h ago', 'bell', 'rose')
on conflict (id) do nothing;

-- Seed Automation Runs
insert into public.automation_runs (id, automation_id, workflow, status, duration, started, reference)
values
  ('run_9f2', 'auto_dunning', 'Failed payment recovery', 'success', '1.2s', '4m ago', 'cus_N4f…9x'),
  ('run_8ka', 'auto_churn', 'Churn risk alert', 'success', '0.4s', '1h ago', 'team_82…k1'),
  ('run_7bc', 'auto_onboarding', 'New signup onboarding', 'failed', '8.2s', '1h ago', 'usr_7d…2m'),
  ('run_6dd', 'auto_invoice', 'Invoice sync', 'skipped', '0.1s', '2h ago', 'in_3k…88'),
  ('run_5ee', 'auto_trial', 'Trial ending reminder', 'success', '0.9s', '3h ago', 'trial_9…aa'),
  ('run_4ff', 'auto_digest', 'Weekly usage digest', 'success', '12.4s', '2d ago', 'digest_22')
on conflict (id) do nothing;

-- Seed Activities
insert into public.activities (id, actor, action, target, time, icon, tone)
values
  ('act_1', 'Maya Chen', 'deployed', 'Billing API v2.8.1 to production', '12m ago', 'rocket', 'violet'),
  ('act_2', 'Stripe webhook', 'failed and retried successfully', 'invoice.payment_failed', '28m ago', 'webhook', 'amber'),
  ('act_3', 'Daniel Okafor', 'invited 2 members to', 'Growth Engine', '1h ago', 'user-plus', 'sky'),
  ('act_4', 'Sentry alert', 'resolved 14 issues across', 'Webhook Relay', '3h ago', 'bug', 'emerald'),
  ('act_5', 'System automated', 'weekly database backup completed', 'Postgres db-prod-01', '6h ago', 'database', 'fuchsia'),
  ('act_6', 'Billing system', 'processed monthly enterprise charge', 'Acme Corp ($4,800)', '1d ago', 'credit-card', 'indigo')
on conflict (id) do nothing;

-- Seed Workspace Settings
insert into public.workspace_settings (id, name, slug, domain, plan, billing_email)
values
  ('default', 'trillion Dollar Labs', 'trillion-dollar-labs', 'trilliondollar.sh', 'Pro', 'billing@trilliondollar.sh')
on conflict (id) do nothing;

-- Seed Team Members
insert into public.team_members (id, name, email, role, tone, joined_at)
values
  ('mbr_1', 'Alex Rivera', 'alex@trilliondollar.sh', 'Owner', 'violet', 'Founding member'),
  ('mbr_2', 'Maya Chen', 'maya@trilliondollar.sh', 'Admin', 'sky', 'Joined 4 mo ago'),
  ('mbr_3', 'Daniel Okafor', 'daniel@trilliondollar.sh', 'Admin', 'emerald', 'Joined 7 mo ago'),
  ('mbr_4', 'Lucas Meyer', 'lucas@trilliondollar.sh', 'Member', 'amber', 'Joined 2 wk ago')
on conflict (id) do nothing;

-- Seed API Keys
insert into public.api_keys (id, name, prefix, token_preview, last_used, status)
values
  ('key_prod', 'Production API Key', 'md_live_', 'md_live_49f8…39a1', '12m ago', 'active'),
  ('key_ci', 'CI / GitHub Actions', 'md_test_', 'md_test_99bc…44e2', '4h ago', 'active'),
  ('key_legacy', 'Legacy Webhook Secret', 'md_wh_', 'md_wh_12ae…91bc', '3mo ago', 'revoked')
on conflict (id) do nothing;
