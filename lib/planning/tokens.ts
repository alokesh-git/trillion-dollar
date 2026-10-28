import type { FeaturePriority, StageTone, VersionStatus } from "@/lib/planning/types";

export const stageToneClass: Record<StageTone, string> = {
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  fuchsia: "bg-fuchsia-500",
  rose: "bg-rose-500",
};

export const priorityLabel: Record<FeaturePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const priorityVariant: Record<
  FeaturePriority,
  "secondary" | "outline" | "violet"
> = {
  low: "secondary",
  medium: "outline",
  high: "violet",
};

export const versionStatusLabel: Record<VersionStatus, string> = {
  draft: "Draft",
  staging: "Staging",
  production: "Production",
  archived: "Archived",
};

export const versionStatusVariant: Record<
  VersionStatus,
  "outline" | "violet" | "success" | "secondary"
> = {
  draft: "outline",
  staging: "violet",
  production: "success",
  archived: "secondary",
};

export const panelLayoutOptions = [
  { value: "full", label: "Full width" },
  { value: "half", label: "Half width" },
  { value: "third", label: "One third" },
] as const;
