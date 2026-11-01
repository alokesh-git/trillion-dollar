"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  LayoutGrid,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { usePlanningWorkspace } from "@/components/planning/use-planning-workspace";
import type { AppItem } from "@/lib/data";
import { appById, countFeaturesForApp } from "@/lib/planning/apps-link";
import { fetchApps } from "@/lib/supabase/data-service";
import {
  panelLayoutOptions,
  priorityLabel,
  priorityVariant,
  stageToneClass,
  versionStatusLabel,
  versionStatusVariant,
} from "@/lib/planning/tokens";
import type {
  FeaturePriority,
  PanelKind,
  PanelLayout,
  PlanningFeature,
  PlanningPanel,
  PlanningVersion,
  PlanningWorkspace,
  VersionStatus,
} from "@/lib/planning/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function layoutClass(layout: PanelLayout) {
  if (layout === "full") return "lg:col-span-12";
  if (layout === "half") return "lg:col-span-6";
  return "lg:col-span-4";
}

function emptyFeature(stageId: string, appId?: string): PlanningFeature {
  return {
    id: `feat-${crypto.randomUUID()}`,
    title: "",
    description: "",
    stageId,
    targetVersion: "v0.1.0",
    priority: "medium",
    tags: [],
    appId: appId || undefined,
  };
}

function emptyVersion(): PlanningVersion {
  return {
    id: `ver-${crypto.randomUUID()}`,
    version: "v0.1.0",
    codename: "",
    status: "draft",
    targetDate: "",
    highlights: "",
  };
}

export function PlanningView() {
  const {
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
    reset,
  } = usePlanningWorkspace();

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [featureDialog, setFeatureDialog] = useState<PlanningFeature | null>(null);
  const [versionDialog, setVersionDialog] = useState<PlanningVersion | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const appFilter = searchParams.get("app");

  useEffect(() => {
    fetchApps().then(setApps);
  }, []);

  const filteredFeatures = useMemo(() => {
    if (!workspace || !appFilter) return workspace?.features ?? [];
    return workspace.features.filter((feature) => feature.appId === appFilter);
  }, [workspace, appFilter]);

  const filterApp = appFilter ? appById(apps, appFilter) : null;

  const visiblePanels = useMemo(
    () => workspace?.panels.filter((panel) => panel.visible) ?? [],
    [workspace],
  );

  if (!hydrated || !workspace) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const planning = workspace;

  function openNewFeature(stageId?: string) {
    const stage = stageId ?? planning.stages[0]?.id ?? "stage-backlog";
    setFeatureDialog(emptyFeature(stage, appFilter ?? undefined));
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Planning"
        description="Capture high-level direction, link roadmap items to workspace apps, and track release versions in a layout you control."
      >
        <Link href="/apps" className={buttonClasses({ variant: "outline" })}>
          View apps
          <ArrowRight className="size-4" />
        </Link>
        <Button variant="outline" onClick={() => setCustomizeOpen(true)}>
          <LayoutGrid className="size-4" />
          Customize layout
        </Button>
        <button
          type="button"
          className={buttonClasses({ variant: "outline" })}
          onClick={() => openNewFeature()}
        >
          <Plus className="size-4" />
          Add feature
        </button>
        <button
          type="button"
          className={buttonClasses()}
          onClick={() => setVersionDialog(emptyVersion())}
        >
          <Plus className="size-4" />
          Add version
        </button>
      </PageHeader>

      {appFilter ? (
        <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              Filtered by app
              {filterApp ? `: ${filterApp.name}` : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Showing {filteredFeatures.length} planned feature
              {filteredFeatures.length === 1 ? "" : "s"} for this application.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => router.push("/planning")}
          >
            <X className="size-3.5" />
            Clear filter
          </Button>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-12">
        {visiblePanels.map((panel) => (
          <PlanningPanelCard
            key={panel.id}
            panel={panel}
            workspace={planning}
            apps={apps}
            boardFeatures={appFilter ? filteredFeatures : planning.features}
            appFilter={appFilter}
            className={layoutClass(panel.layout)}
            onToggleCollapse={() =>
              updatePanel(panel.id, { collapsed: !panel.collapsed })
            }
            onBodyChange={(body) => updatePanel(panel.id, { body })}
            onEditFeature={setFeatureDialog}
            onEditVersion={setVersionDialog}
            onAddFeatureInStage={openNewFeature}
          />
        ))}
      </div>

      <CustomizeLayoutDialog
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        panels={planning.panels}
        onUpdatePanel={updatePanel}
        onMovePanel={movePanel}
        onRemovePanel={removePanel}
        onAddPanel={addPanel}
        onSetLayout={setPanelLayout}
        onReset={reset}
      />

      <FeatureDialog
        open={Boolean(featureDialog)}
        feature={featureDialog}
        canDelete={
          featureDialog
            ? planning.features.some((item) => item.id === featureDialog.id)
            : false
        }
        stages={planning.stages}
        apps={apps}
        onClose={() => setFeatureDialog(null)}
        onSave={(feature) => {
          upsertFeature(feature);
          setFeatureDialog(null);
        }}
        onDelete={(id) => {
          deleteFeature(id);
          setFeatureDialog(null);
        }}
      />

      <VersionDialog
        open={Boolean(versionDialog)}
        version={versionDialog}
        canDelete={
          versionDialog
            ? planning.versions.some((item) => item.id === versionDialog.id)
            : false
        }
        onClose={() => setVersionDialog(null)}
        onSave={(version) => {
          upsertVersion(version);
          setVersionDialog(null);
        }}
        onDelete={(id) => {
          deleteVersion(id);
          setVersionDialog(null);
        }}
      />
    </div>
  );
}

function PlanningPanelCard({
  panel,
  workspace,
  apps,
  boardFeatures,
  appFilter,
  className,
  onToggleCollapse,
  onBodyChange,
  onEditFeature,
  onEditVersion,
  onAddFeatureInStage,
}: {
  panel: PlanningPanel;
  workspace: NonNullable<ReturnType<typeof usePlanningWorkspace>["workspace"]>;
  apps: AppItem[];
  boardFeatures: PlanningFeature[];
  appFilter: string | null;
  className?: string;
  onToggleCollapse: () => void;
  onBodyChange: (body: string) => void;
  onEditFeature: (feature: PlanningFeature) => void;
  onEditVersion: (version: PlanningVersion) => void;
  onAddFeatureInStage: (stageId: string) => void;
}) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)}>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 pb-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{panel.title}</CardTitle>
          <CardDescription className="text-balance break-words">
            {panel.kind === "vision" && "Strategy, milestones, and quarterly bets"}
            {panel.kind === "board" && "Drag-free staging lanes for feature work"}
            {panel.kind === "versions" && "Semver tracks with staging and production status"}
            {panel.kind === "notes" && "Free-form notes—duplicate panels as needed"}
            {panel.kind === "apps" &&
              "Workspace apps linked to planned features—open Apps or filter the board"}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onToggleCollapse}
          aria-label={panel.collapsed ? "Expand panel" : "Collapse panel"}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              panel.collapsed && "-rotate-90",
            )}
          />
        </Button>
      </CardHeader>

      {!panel.collapsed ? (
        <CardContent className="min-w-0 pt-0">
          {(panel.kind === "vision" || panel.kind === "notes") && (
            <Textarea
              value={panel.body}
              onChange={(event) => onBodyChange(event.target.value)}
              placeholder="Write in markdown-style sections, bullet lists, or plain text…"
              className="min-h-[220px] resize-y font-mono text-[13px] leading-relaxed"
            />
          )}

          {panel.kind === "board" && (
            <StageBoard
              stages={workspace.stages}
              features={boardFeatures}
              apps={apps}
              onEditFeature={onEditFeature}
              onAddFeatureInStage={onAddFeatureInStage}
            />
          )}

          {panel.kind === "apps" && (
            <AppsPlanningPanel
              apps={apps}
              features={workspace.features}
              activeAppId={appFilter}
            />
          )}

          {panel.kind === "versions" && (
            <VersionList
              versions={workspace.versions}
              onEdit={onEditVersion}
            />
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}

function AppsPlanningPanel({
  apps,
  features,
  activeAppId,
}: {
  apps: AppItem[];
  features: PlanningFeature[];
  activeAppId: string | null;
}) {
  if (apps.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
        No apps in the workspace yet.{" "}
        <Link href="/apps" className="font-medium text-violet-600 dark:text-violet-400">
          Add an app
        </Link>{" "}
        to track status and link roadmap items.
      </p>
    );
  }

  return (
    <ul className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {apps.map((app) => {
        const linked = countFeaturesForApp(features, app.id);
        const isActive = activeAppId === app.id;

        return (
          <li key={app.id}>
            <div
              className={cn(
                "flex min-w-0 flex-col gap-3 rounded-xl border px-3 py-3 sm:flex-row sm:items-center",
                isActive
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-border/80 bg-muted/15",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <AppIcon
                  name={app.icon}
                  tone={app.tone}
                  imageUrl={app.iconUrl}
                  className="size-9 shrink-0"
                  iconClassName="size-4"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{app.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {app.version} · {app.environment}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {linked} planned feature{linked === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <Link
                  href={`/planning?app=${encodeURIComponent(app.id)}`}
                  className={buttonClasses({ variant: "outline", size: "sm" })}
                >
                  Roadmap
                </Link>
                <Link
                  href="/apps"
                  className={buttonClasses({ variant: "ghost", size: "sm" })}
                >
                  Open app
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StageBoard({
  stages,
  features,
  apps,
  onEditFeature,
  onAddFeatureInStage,
}: {
  stages: PlanningWorkspace["stages"];
  features: PlanningFeature[];
  apps: AppItem[];
  onEditFeature: (feature: PlanningFeature) => void;
  onAddFeatureInStage: (stageId: string) => void;
}) {
  return (
    <div className="-mx-1 flex min-w-0 gap-3 overflow-x-auto pb-1 [scrollbar-width:thin] sm:mx-0">
      {stages.map((stage) => {
        const items = features.filter((feature) => feature.stageId === stage.id);

        return (
          <div
            key={stage.id}
            className="flex w-[min(100%,17rem)] shrink-0 flex-col rounded-xl border border-border/80 bg-muted/20 sm:w-64"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    stageToneClass[stage.tone],
                  )}
                />
                <p className="truncate text-xs font-semibold">{stage.name}</p>
                <Badge variant="secondary" className="px-1.5 text-[10px]">
                  {items.length}
                </Badge>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={`Add feature to ${stage.name}`}
                onClick={() => onAddFeatureInStage(stage.id)}
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <ul className="flex min-h-28 flex-1 flex-col gap-2 p-2">
              {items.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/70 px-3 py-6 text-center text-[11px] text-muted-foreground">
                  No features yet
                </li>
              ) : (
                items.map((feature) => {
                  const linkedApp = appById(apps, feature.appId);

                  return (
                  <li key={feature.id}>
                    <button
                      type="button"
                      onClick={() => onEditFeature(feature)}
                      className="w-full rounded-lg border border-border/70 bg-card px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <p className="truncate text-xs font-medium">
                          {feature.title}
                        </p>
                        <Badge
                          variant={priorityVariant[feature.priority]}
                          className="shrink-0 px-1.5 text-[10px]"
                        >
                          {priorityLabel[feature.priority]}
                        </Badge>
                      </div>
                      {linkedApp ? (
                        <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                          <AppIcon
                            name={linkedApp.icon}
                            tone={linkedApp.tone}
                            imageUrl={linkedApp.iconUrl}
                            className="size-5 shrink-0"
                            iconClassName="size-2.5"
                          />
                          <span className="truncate text-[10px] font-medium text-muted-foreground">
                            {linkedApp.name}
                          </span>
                        </div>
                      ) : null}
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="px-1.5 text-[10px]">
                          {feature.targetVersion}
                        </Badge>
                        {feature.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="px-1.5 text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  </li>
                  );
                })
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function VersionList({
  versions,
  onEdit,
}: {
  versions: PlanningVersion[];
  onEdit: (version: PlanningVersion) => void;
}) {
  const sorted = [...versions].sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true }),
  );

  return (
    <ul className="space-y-2">
      {sorted.map((version) => (
        <li key={version.id}>
          <button
            type="button"
            onClick={() => onEdit(version)}
            className="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-border/80 bg-muted/15 px-3 py-3 text-left transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{version.version}</p>
                {version.codename ? (
                  <span className="text-xs text-muted-foreground">
                    {version.codename}
                  </span>
                ) : null}
                <Badge variant={versionStatusVariant[version.status]}>
                  {versionStatusLabel[version.status]}
                </Badge>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground break-words">
                {version.highlights || "Add release highlights…"}
              </p>
            </div>
            {version.targetDate ? (
              <p className="shrink-0 text-[11px] text-muted-foreground">
                Target {version.targetDate}
              </p>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

function CustomizeLayoutDialog({
  open,
  onClose,
  panels,
  onUpdatePanel,
  onMovePanel,
  onRemovePanel,
  onAddPanel,
  onSetLayout,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  panels: PlanningPanel[];
  onUpdatePanel: (id: string, updates: Partial<PlanningPanel>) => void;
  onMovePanel: (id: string, direction: "up" | "down") => void;
  onRemovePanel: (id: string) => void;
  onAddPanel: (kind?: PanelKind, title?: string) => void;
  onSetLayout: (id: string, layout: PanelLayout) => void;
  onReset: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Customize planning layout"
      className="max-w-xl"
    >
      <div>
        <DialogHeader onClose={onClose}>
          <DialogTitle>Customize planning layout</DialogTitle>
          <DialogDescription>
            Show or hide panels, change width, reorder sections, and add extra note
            blocks. Changes save automatically in this browser.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(28rem,60vh)] space-y-3 overflow-y-auto px-5 py-4">
        {panels.map((panel, index) => (
          <div
            key={panel.id}
            className="rounded-xl border border-border/80 bg-muted/20 p-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={panel.title}
                    onChange={(event) =>
                      onUpdatePanel(panel.id, { title: event.target.value })
                    }
                    aria-label="Panel title"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="inline-flex items-center gap-2">
                    <Switch
                      checked={panel.visible}
                      onCheckedChange={(checked) =>
                        onUpdatePanel(panel.id, { visible: checked })
                      }
                      aria-label={`Show ${panel.title}`}
                    />
                    Visible
                  </label>
                  <Select
                    value={panel.layout}
                    onChange={(event) =>
                      onSetLayout(panel.id, event.target.value as PanelLayout)
                    }
                    className="h-9 min-w-[9rem] text-xs"
                  >
                    {panelLayoutOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={index === 0}
                  onClick={() => onMovePanel(panel.id, "up")}
                  aria-label="Move panel up"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={index === panels.length - 1}
                  onClick={() => onMovePanel(panel.id, "down")}
                  aria-label="Move panel down"
                >
                  <ChevronDown className="size-4" />
                </Button>
                {panel.kind === "notes" && panels.filter((p) => p.kind === "notes").length > 1 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => onRemovePanel(panel.id)}
                    aria-label="Remove panel"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onAddPanel("notes", "Custom notes")}>
              <Plus className="size-4" />
              Add notes panel
            </Button>
            <Button variant="outline" onClick={() => onAddPanel("vision", "Focus area")}>
              <Plus className="size-4" />
              Add plan panel
            </Button>
          </div>
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="size-4" />
            Reset defaults
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}

function FeatureDialog({
  open,
  feature,
  canDelete,
  stages,
  apps,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  feature: PlanningFeature | null;
  canDelete: boolean;
  stages: PlanningWorkspace["stages"];
  apps: AppItem[];
  onClose: () => void;
  onSave: (feature: PlanningFeature) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<PlanningFeature | null>(null);

  useEffect(() => {
    if (open && feature) setDraft(feature);
    if (!open) setDraft(null);
  }, [open, feature]);

  if (!open || !draft) return null;

  const tagString = draft.tags.join(", ");

  return (
    <Dialog open={open} onClose={onClose} label="Feature planning">
      <div>
        <DialogHeader onClose={onClose}>
          <DialogTitle>{canDelete ? "Edit feature" : "New feature"}</DialogTitle>
          <DialogDescription>
            Assign a stage, linked app, target version, and priority for roadmap
            alignment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="feature-app">Linked app</Label>
          <Select
            id="feature-app"
            value={draft.appId ?? ""}
            onChange={(event) => {
              const appId = event.target.value || undefined;
              const linked = appById(apps, appId);
              setDraft({
                ...draft,
                appId,
                targetVersion: linked?.version ?? draft.targetVersion,
              });
            }}
          >
            <option value="">No app linked</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.version})
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="feature-title">Title</Label>
          <Input
            id="feature-title"
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
            placeholder="Feature name"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="feature-description">Description</Label>
          <Textarea
            id="feature-description"
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            placeholder="What ships, who it helps, and how we measure success"
            className="min-h-24"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="feature-stage">Stage</Label>
          <Select
            id="feature-stage"
            value={draft.stageId}
            onChange={(event) =>
              setDraft({ ...draft, stageId: event.target.value })
            }
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="feature-version">Target version</Label>
          <Input
            id="feature-version"
            value={draft.targetVersion}
            onChange={(event) =>
              setDraft({ ...draft, targetVersion: event.target.value })
            }
            placeholder="v0.5.0"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="feature-priority">Priority</Label>
          <Select
            id="feature-priority"
            value={draft.priority}
            onChange={(event) =>
              setDraft({
                ...draft,
                priority: event.target.value as FeaturePriority,
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="feature-tags">Tags</Label>
          <Input
            id="feature-tags"
            value={tagString}
            onChange={(event) =>
              setDraft({
                ...draft,
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
            placeholder="UX, Billing, API"
          />
        </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {canDelete ? (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(draft.id)}
            >
              Delete feature
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(draft)} disabled={!draft.title.trim()}>
              Save feature
            </Button>
          </div>
        </DialogFooter>
      </div>
    </Dialog>
  );
}

function VersionDialog({
  open,
  version,
  canDelete,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  version: PlanningVersion | null;
  canDelete: boolean;
  onClose: () => void;
  onSave: (version: PlanningVersion) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<PlanningVersion | null>(null);

  useEffect(() => {
    if (open && version) setDraft(version);
    if (!open) setDraft(null);
  }, [open, version]);

  if (!open || !draft) return null;

  return (
    <Dialog open={open} onClose={onClose} label="Release version">
      <div>
        <DialogHeader onClose={onClose}>
          <DialogTitle>{canDelete ? "Edit version" : "New version"}</DialogTitle>
          <DialogDescription>
            Track semver, staging status, target dates, and release notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="version-name">Version</Label>
          <Input
            id="version-name"
            value={draft.version}
            onChange={(event) =>
              setDraft({ ...draft, version: event.target.value })
            }
            placeholder="v0.5.0"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="version-codename">Codename</Label>
          <Input
            id="version-codename"
            value={draft.codename}
            onChange={(event) =>
              setDraft({ ...draft, codename: event.target.value })
            }
            placeholder="Horizon"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="version-status">Status</Label>
          <Select
            id="version-status"
            value={draft.status}
            onChange={(event) =>
              setDraft({
                ...draft,
                status: event.target.value as VersionStatus,
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="version-date">Target date</Label>
          <Input
            id="version-date"
            type="date"
            value={draft.targetDate}
            onChange={(event) =>
              setDraft({ ...draft, targetDate: event.target.value })
            }
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="version-highlights">Highlights</Label>
          <Textarea
            id="version-highlights"
            value={draft.highlights}
            onChange={(event) =>
              setDraft({ ...draft, highlights: event.target.value })
            }
            placeholder="What's included in this release?"
            className="min-h-24"
          />
        </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {canDelete ? (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(draft.id)}
            >
              Delete version
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(draft)} disabled={!draft.version.trim()}>
              Save version
            </Button>
          </div>
        </DialogFooter>
      </div>
    </Dialog>
  );
}