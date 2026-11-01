import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  type AppItem,
  type ToolItem,
  type AutomationItem,
  type AutomationRun,
  type Activity,
  type TeamMember,
  type ApiKey,
  type AppStatus,
  type ToolStatus,
  type AutomationStatus,
} from "@/lib/data";

const defaultWorkspace: WorkspaceSettings = {
  id: "default",
  name: "trillion Dollar Labs",
  slug: "trillion-dollar-labs",
  domain: "trilliondollar.sh",
  plan: "Pro",
  billing_email: "billing@trilliondollar.sh",
};

export interface WorkspaceSettings {
  id: string;
  name: string;
  slug: string;
  domain: string;
  plan: string;
  billing_email: string;
}

export interface SupabaseHealth {
  connected: boolean;
  schemaReady: boolean;
  error?: string;
}

// Global cache to keep local mutations instant and synced in memory
let cachedApps: AppItem[] | null = null;
let cachedTools: ToolItem[] | null = null;
let cachedAutomations: AutomationItem[] | null = null;
let cachedRuns: AutomationRun[] | null = null;
let cachedActivities: Activity[] | null = null;
let cachedWorkspace: WorkspaceSettings | null = null;
let cachedTeamMembers: TeamMember[] | null = null;
let cachedApiKeys: ApiKey[] | null = null;

function getSupabase() {
  return createBrowserSupabaseClient();
}

/**
 * Check if Supabase connection and tables are ready
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("apps").select("id").limit(1);

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        return {
          connected: true,
          schemaReady: false,
          error: "Tables not created yet. Run supabase/schema.sql in your Supabase SQL editor.",
        };
      }
      return { connected: false, schemaReady: false, error: error.message };
    }

    return { connected: true, schemaReady: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, schemaReady: false, error: message };
  }
}

// ============================================================================
// APPS SERVICE
// ============================================================================

export async function fetchApps(): Promise<AppItem[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: AppItem[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        environment: item.environment,
        framework: item.framework,
        region: item.region,
        requests: Number(item.requests || 0),
        lastDeploy: item.last_deploy || "just now",
        version: item.version || "v1.0.0",
        icon: item.icon as AppItem["icon"],
        tone: item.tone as AppItem["tone"],
        iconUrl: item.icon_url || undefined,
      }));
      cachedApps = mapped;
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!cachedApps) {
    cachedApps = [];
  }
  return cachedApps;
}

export async function createApp(newApp: AppItem): Promise<AppItem> {
  if (!cachedApps) cachedApps = [];
  cachedApps = [newApp, ...cachedApps];

  try {
    const supabase = getSupabase();
    await supabase.from("apps").insert({
      id: newApp.id,
      name: newApp.name,
      description: newApp.description,
      status: newApp.status,
      environment: newApp.environment,
      framework: newApp.framework,
      region: newApp.region,
      requests: newApp.requests,
      last_deploy: newApp.lastDeploy,
      version: newApp.version,
      icon: newApp.icon,
      tone: newApp.tone,
      icon_url: newApp.iconUrl || null,
    });
  } catch {
    // local fallback already applied
  }

  // Record dynamic activity
  await logActivity({
    actor: "You",
    action: "deployed",
    target: `${newApp.name} (${newApp.environment})`,
    icon: "rocket",
    tone: newApp.tone,
  });

  return newApp;
}

export async function updateAppStatus(id: string, status: AppStatus): Promise<void> {
  if (cachedApps) {
    cachedApps = cachedApps.map((a) => (a.id === id ? { ...a, status } : a));
  }

  try {
    const supabase = getSupabase();
    await supabase.from("apps").update({ status }).eq("id", id);
  } catch {
    // local fallback
  }

  const app = cachedApps?.find((a) => a.id === id);
  await logActivity({
    actor: "You",
    action: "changed status to " + status + " for",
    target: app?.name || id,
    icon: "app-window",
    tone: status === "live" ? "emerald" : status === "degraded" ? "amber" : "violet",
  });
}

export async function deleteApp(id: string): Promise<void> {
  const target = cachedApps?.find((a) => a.id === id);
  if (cachedApps) {
    cachedApps = cachedApps.filter((a) => a.id !== id);
  }

  try {
    const supabase = getSupabase();
    await supabase.from("apps").delete().eq("id", id);
  } catch {
    // local fallback
  }

  if (target) {
    await logActivity({
      actor: "You",
      action: "removed application",
      target: target.name,
      icon: "app-window",
      tone: "rose",
    });
  }
}

// ============================================================================
// TOOLS SERVICE
// ============================================================================

export async function fetchTools(): Promise<ToolItem[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      const mapped: ToolItem[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category as any,
        status: item.status as any,
        icon: item.icon as any,
        tone: item.tone as any,
        meta: item.meta,
      }));
      cachedTools = mapped;
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!cachedTools) {
    cachedTools = [];
  }
  return cachedTools;
}

export async function toggleToolStatus(id: string, nextStatus: ToolStatus): Promise<void> {
  const metaText = nextStatus === "connected" ? "Live mode" : "Not connected";
  if (cachedTools) {
    cachedTools = cachedTools.map((t) =>
      t.id === id ? { ...t, status: nextStatus, meta: metaText } : t,
    );
  }

  try {
    const supabase = getSupabase();
    await supabase
      .from("tools")
      .update({ status: nextStatus, meta: metaText })
      .eq("id", id);
  } catch {
    // fallback
  }

  const tool = cachedTools?.find((t) => t.id === id);
  await logActivity({
    actor: "You",
    action: nextStatus === "connected" ? "connected integration" : "disconnected",
    target: tool?.name || id,
    icon: tool?.icon || "wrench",
    tone: nextStatus === "connected" ? "emerald" : "rose",
  });
}

export async function createTool(newTool: ToolItem): Promise<ToolItem> {
  if (!cachedTools) cachedTools = [];
  cachedTools = [newTool, ...cachedTools];

  try {
    const supabase = getSupabase();
    await supabase.from("tools").insert({
      id: newTool.id,
      name: newTool.name,
      description: newTool.description,
      category: newTool.category,
      status: newTool.status,
      icon: newTool.icon,
      tone: newTool.tone,
      meta: newTool.meta,
    });
  } catch {
    // fallback
  }

  await logActivity({
    actor: "You",
    action: "added tool integration",
    target: newTool.name,
    icon: newTool.icon,
    tone: newTool.tone,
  });

  return newTool;
}

// ============================================================================
// AUTOMATIONS SERVICE
// ============================================================================

export async function fetchAutomations(): Promise<AutomationItem[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      const mapped: AutomationItem[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        trigger: item.trigger,
        action: item.action,
        status: item.status as AutomationStatus,
        runs: Number(item.runs || 0),
        successRate: Number(item.success_rate || 100),
        lastRun: item.last_run || "Never",
        icon: item.icon as any,
        tone: item.tone as any,
      }));
      cachedAutomations = mapped;
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!cachedAutomations) {
    cachedAutomations = [];
  }
  return cachedAutomations;
}

export async function toggleAutomationStatus(
  id: string,
  status: AutomationStatus,
): Promise<void> {
  if (cachedAutomations) {
    cachedAutomations = cachedAutomations.map((a) =>
      a.id === id ? { ...a, status } : a,
    );
  }

  try {
    const supabase = getSupabase();
    await supabase.from("automations").update({ status }).eq("id", id);
  } catch {
    // fallback
  }

  const workflow = cachedAutomations?.find((a) => a.id === id);
  await logActivity({
    actor: "You",
    action: status === "active" ? "resumed automation" : "paused automation",
    target: workflow?.name || id,
    icon: "workflow",
    tone: status === "active" ? "emerald" : "amber",
  });
}

export async function createAutomation(
  newAuto: AutomationItem,
): Promise<AutomationItem> {
  if (!cachedAutomations) cachedAutomations = [];
  cachedAutomations = [newAuto, ...cachedAutomations];

  try {
    const supabase = getSupabase();
    await supabase.from("automations").insert({
      id: newAuto.id,
      name: newAuto.name,
      description: newAuto.description,
      trigger: newAuto.trigger,
      action: newAuto.action,
      status: newAuto.status,
      runs: newAuto.runs,
      success_rate: newAuto.successRate,
      last_run: newAuto.lastRun,
      icon: newAuto.icon,
      tone: newAuto.tone,
    });
  } catch {
    // fallback
  }

  await logActivity({
    actor: "You",
    action: "configured new automation",
    target: newAuto.name,
    icon: "workflow",
    tone: newAuto.tone,
  });

  return newAuto;
}

export async function triggerAutomationRun(id: string): Promise<AutomationRun> {
  const workflow = cachedAutomations?.find((a) => a.id === id);
  const workflowName = workflow?.name || "Workflow";

  if (cachedAutomations) {
    cachedAutomations = cachedAutomations.map((a) =>
      a.id === id
        ? {
          ...a,
          runs: a.runs + 1,
          lastRun: "just now",
        }
        : a,
    );
  }

  const newRun: AutomationRun = {
    id: `run_${Math.random().toString(36).substring(2, 7)}`,
    workflow: workflowName,
    status: "success",
    duration: "0.8s",
    started: "just now",
    reference: `exec_${Math.random().toString(36).substring(2, 6)}`,
  };

  if (!cachedRuns) cachedRuns = [];
  cachedRuns = [newRun, ...cachedRuns];

  try {
    const supabase = getSupabase();
    await Promise.all([
      supabase.from("automation_runs").insert({
        id: newRun.id,
        automation_id: id.startsWith("auto_") ? id : null,
        workflow: newRun.workflow,
        status: newRun.status,
        duration: newRun.duration,
        started: newRun.started,
        reference: newRun.reference,
      }),
      supabase
        .from("automations")
        .update({
          runs: (workflow?.runs || 0) + 1,
          last_run: "just now",
        })
        .eq("id", id),
    ]);
  } catch {
    // fallback
  }

  await logActivity({
    actor: "Automation Runner",
    action: "successfully executed",
    target: workflowName,
    icon: "zap",
    tone: "violet",
  });

  return newRun;
}

export async function fetchAutomationRuns(): Promise<AutomationRun[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("automation_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      const mapped: AutomationRun[] = data.map((item) => ({
        id: item.id,
        workflow: item.workflow,
        status: item.status as any,
        duration: item.duration,
        started: item.started,
        reference: item.reference,
      }));
      cachedRuns = mapped;
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!cachedRuns) {
    cachedRuns = [];
  }
  return cachedRuns;
}

// ============================================================================
// ACTIVITIES SERVICE
// ============================================================================

export async function fetchActivities(): Promise<Activity[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      const mapped: Activity[] = data.map((item) => ({
        id: item.id,
        actor: item.actor,
        action: item.action,
        target: item.target,
        time: item.time,
        icon: item.icon as any,
        tone: item.tone as any,
      }));
      cachedActivities = mapped;
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!cachedActivities) {
    cachedActivities = [];
  }
  return cachedActivities;
}

export async function logActivity(act: {
  actor: string;
  action: string;
  target: string;
  icon: any;
  tone: any;
}): Promise<void> {
  const newActivity: Activity = {
    id: `act_${Date.now()}`,
    actor: act.actor,
    action: act.action,
    target: act.target,
    time: "just now",
    icon: act.icon,
    tone: act.tone,
  };

  if (!cachedActivities) cachedActivities = [];
  cachedActivities = [newActivity, ...cachedActivities.slice(0, 30)];

  try {
    const supabase = getSupabase();
    await supabase.from("activities").insert({
      id: newActivity.id,
      actor: newActivity.actor,
      action: newActivity.action,
      target: newActivity.target,
      time: "just now",
      icon: newActivity.icon,
      tone: newActivity.tone,
    });
  } catch {
    // fallback
  }
}

// ============================================================================
// WORKSPACE SETTINGS & TEAM SERVICE
// ============================================================================

export async function fetchWorkspaceSettings(): Promise<WorkspaceSettings> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("workspace_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data) {
      cachedWorkspace = data;
      return data;
    }
  } catch {
    // fallback
  }

  if (!cachedWorkspace) {
    cachedWorkspace = { ...defaultWorkspace };
  }
  return cachedWorkspace;
}

export async function updateWorkspaceSettings(
  updates: Partial<WorkspaceSettings>,
): Promise<WorkspaceSettings> {
  if (!cachedWorkspace) {
    cachedWorkspace = { ...defaultWorkspace };
  }
  cachedWorkspace = { ...cachedWorkspace, ...updates };

  try {
    const supabase = getSupabase();
    await supabase
      .from("workspace_settings")
      .upsert({ ...cachedWorkspace, id: "default" });
  } catch {
    // fallback
  }

  await logActivity({
    actor: "You",
    action: "updated workspace configuration",
    target: cachedWorkspace.name,
    icon: "settings",
    tone: "violet",
  });

  return cachedWorkspace;
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      const mapped: TeamMember[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role as any,
        status: "Active",
        lastActive: "just now",
        tone: item.tone as any,
      }));
      cachedTeamMembers = mapped;
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!cachedTeamMembers) {
    cachedTeamMembers = [];
  }
  return cachedTeamMembers;
}

export async function inviteTeamMember(
  member: Omit<TeamMember, "id">,
): Promise<TeamMember> {
  const newMember: TeamMember = {
    ...member,
    id: `mbr_${Date.now()}`,
  };

  if (!cachedTeamMembers) cachedTeamMembers = [];
  cachedTeamMembers = [...cachedTeamMembers, newMember];

  try {
    const supabase = getSupabase();
    await supabase.from("team_members").insert({
      id: newMember.id,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      tone: newMember.tone,
      joined_at: newMember.lastActive,
    });
  } catch {
    // fallback
  }

  await logActivity({
    actor: "You",
    action: "invited team member",
    target: `${newMember.name} (${newMember.role})`,
    icon: "user-plus",
    tone: newMember.tone,
  });

  return newMember;
}

export async function deleteTeamMember(id: string): Promise<void> {
  const target = cachedTeamMembers?.find((m) => m.id === id);
  if (cachedTeamMembers) {
    cachedTeamMembers = cachedTeamMembers.filter((m) => m.id !== id);
  }

  try {
    const supabase = getSupabase();
    await supabase.from("team_members").delete().eq("id", id);
  } catch {
    // fallback
  }

  if (target) {
    await logActivity({
      actor: "You",
      action: "removed team member",
      target: target.name,
      icon: "users",
      tone: "amber",
    });
  }
}

// ============================================================================
// API KEYS SERVICE
// ============================================================================

export async function fetchApiKeys(): Promise<ApiKey[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: ApiKey[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        prefix: item.prefix,
        scope: "Full access",
        created: item.created_at ? "recently" : "today",
        lastUsed: item.last_used || "Never",
        status: (item.status || "active") as any,
      }));
      cachedApiKeys = mapped;
      return mapped;
    }
  } catch {
    // fallback
  }

  if (!cachedApiKeys) {
    cachedApiKeys = [];
  }
  return cachedApiKeys;
}

export async function createApiKey(name: string): Promise<ApiKey> {
  const rand = Math.random().toString(36).substring(2, 8);
  const newKey: ApiKey = {
    id: `key_${Date.now()}`,
    name,
    prefix: `sk_live_••••••••${rand.slice(0, 4)}`,
    scope: "Full access",
    created: "just now",
    lastUsed: "Never",
    status: "active",
  };

  if (!cachedApiKeys) cachedApiKeys = [];
  cachedApiKeys = [newKey, ...cachedApiKeys];

  try {
    const supabase = getSupabase();
    await supabase.from("api_keys").insert({
      id: newKey.id,
      name: newKey.name,
      prefix: newKey.prefix,
      token_preview: newKey.prefix,
      last_used: newKey.lastUsed,
      status: newKey.status,
    });
  } catch {
    // fallback
  }

  await logActivity({
    actor: "You",
    action: "generated API key",
    target: name,
    icon: "key-round",
    tone: "violet",
  });

  return newKey;
}

export async function revokeApiKey(id: string): Promise<void> {
  if (cachedApiKeys) {
    cachedApiKeys = cachedApiKeys.map((k) =>
      k.id === id ? { ...k, status: "revoked" } : k,
    );
  }

  try {
    const supabase = getSupabase();
    await supabase.from("api_keys").update({ status: "revoked" }).eq("id", id);
  } catch {
    // fallback
  }

  const key = cachedApiKeys?.find((k) => k.id === id);
  await logActivity({
    actor: "You",
    action: "revoked API key",
    target: key?.name || id,
    icon: "key-round",
    tone: "rose",
  });
}
