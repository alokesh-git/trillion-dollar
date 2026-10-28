import type { AppItem } from "@/lib/data";
import type { PlanningFeature } from "@/lib/planning/types";

export function countFeaturesForApp(
  features: PlanningFeature[],
  appId: string,
) {
  return features.filter((feature) => feature.appId === appId).length;
}

export function appById(apps: AppItem[], appId?: string) {
  if (!appId) return null;
  return apps.find((app) => app.id === appId) ?? null;
}
