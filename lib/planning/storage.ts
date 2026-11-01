import { createDefaultPlanningWorkspace } from "@/lib/planning/defaults";
import type { PlanningFeature, PlanningWorkspace } from "@/lib/planning/types";

const STORAGE_KEY = "trillion-dollar-planning-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function loadPlanningWorkspace(): PlanningWorkspace {
  if (typeof window === "undefined") {
    return createDefaultPlanningWorkspace();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPlanningWorkspace();

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.panels)) {
      return createDefaultPlanningWorkspace();
    }

    return parsed as unknown as PlanningWorkspace;
  } catch {
    return createDefaultPlanningWorkspace();
  }
}

export function savePlanningWorkspace(workspace: PlanningWorkspace) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...workspace, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

export function resetPlanningWorkspace(): PlanningWorkspace {
  const fresh = createDefaultPlanningWorkspace();
  savePlanningWorkspace(fresh);
  return fresh;
}

export function addPlanningFeature(
  feature: Omit<PlanningFeature, "id"> & { id?: string },
): PlanningFeature {
  const workspace = loadPlanningWorkspace();
  const created: PlanningFeature = {
    ...feature,
    id: feature.id ?? `feat-${crypto.randomUUID()}`,
  };
  savePlanningWorkspace({
    ...workspace,
    features: [...workspace.features, created],
  });
  return created;
}
