"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadPlanningWorkspace,
  resetPlanningWorkspace,
  savePlanningWorkspace,
} from "@/lib/planning/storage";
import type {
  PanelKind,
  PanelLayout,
  PlanningFeature,
  PlanningPanel,
  PlanningStage,
  PlanningVersion,
  PlanningWorkspace,
} from "@/lib/planning/types";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function usePlanningWorkspace() {
  const [workspace, setWorkspace] = useState<PlanningWorkspace | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWorkspace(loadPlanningWorkspace());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !workspace) return;
    savePlanningWorkspace(workspace);
  }, [workspace, hydrated]);

  const patch = useCallback((updater: (current: PlanningWorkspace) => PlanningWorkspace) => {
    setWorkspace((current) => (current ? updater(current) : current));
  }, []);

  const updatePanel = useCallback(
    (panelId: string, updates: Partial<PlanningPanel>) => {
      patch((current) => ({
        ...current,
        panels: current.panels.map((panel) =>
          panel.id === panelId ? { ...panel, ...updates } : panel,
        ),
      }));
    },
    [patch],
  );

  const addPanel = useCallback(
    (kind: PanelKind = "notes", title = "Custom notes") => {
      patch((current) => ({
        ...current,
        panels: [
          ...current.panels,
          {
            id: newId("panel"),
            kind,
            title,
            visible: true,
            collapsed: false,
            layout: "half",
            body: "",
          },
        ],
      }));
    },
    [patch],
  );

  const removePanel = useCallback(
    (panelId: string) => {
      patch((current) => ({
        ...current,
        panels: current.panels.filter((panel) => panel.id !== panelId),
      }));
    },
    [patch],
  );

  const movePanel = useCallback(
    (panelId: string, direction: "up" | "down") => {
      patch((current) => {
        const index = current.panels.findIndex((panel) => panel.id === panelId);
        if (index < 0) return current;

        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= current.panels.length) return current;

        const panels = [...current.panels];
        [panels[index], panels[target]] = [panels[target], panels[index]];
        return { ...current, panels };
      });
    },
    [patch],
  );

  const setPanelLayout = useCallback(
    (panelId: string, layout: PanelLayout) => {
      updatePanel(panelId, { layout });
    },
    [updatePanel],
  );

  const upsertFeature = useCallback(
    (feature: PlanningFeature) => {
      patch((current) => {
        const exists = current.features.some((item) => item.id === feature.id);
        return {
          ...current,
          features: exists
            ? current.features.map((item) =>
                item.id === feature.id ? feature : item,
              )
            : [...current.features, feature],
        };
      });
    },
    [patch],
  );

  const deleteFeature = useCallback(
    (featureId: string) => {
      patch((current) => ({
        ...current,
        features: current.features.filter((feature) => feature.id !== featureId),
      }));
    },
    [patch],
  );

  const upsertVersion = useCallback(
    (version: PlanningVersion) => {
      patch((current) => {
        const exists = current.versions.some((item) => item.id === version.id);
        return {
          ...current,
          versions: exists
            ? current.versions.map((item) =>
                item.id === version.id ? version : item,
              )
            : [...current.versions, version],
        };
      });
    },
    [patch],
  );

  const deleteVersion = useCallback(
    (versionId: string) => {
      patch((current) => ({
        ...current,
        versions: current.versions.filter((version) => version.id !== versionId),
      }));
    },
    [patch],
  );

  const upsertStage = useCallback(
    (stage: PlanningStage) => {
      patch((current) => {
        const exists = current.stages.some((item) => item.id === stage.id);
        return {
          ...current,
          stages: exists
            ? current.stages.map((item) => (item.id === stage.id ? stage : item))
            : [...current.stages, stage],
        };
      });
    },
    [patch],
  );

  const reset = useCallback(() => {
    setWorkspace(resetPlanningWorkspace());
  }, []);

  return {
    workspace,
    hydrated,
    updatePanel,
    addPanel,
    removePanel,
    movePanel,
    setPanelLayout,
    upsertFeature,
    deleteFeature,
    upsertVersion,
    deleteVersion,
    upsertStage,
    reset,
    patch,
  };
}
