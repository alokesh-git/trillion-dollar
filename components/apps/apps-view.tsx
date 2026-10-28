"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Boxes,
  Check,
  KanbanSquare,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Timer,
  Trash2,
  Upload,
} from "lucide-react";
import { type AppItem, type Environment, type AppStatus } from "@/lib/data";
import {
  fetchApps,
  createApp as supabaseCreateApp,
  updateAppStatus as supabaseUpdateAppStatus,
  deleteApp as supabaseDeleteApp,
} from "@/lib/supabase/data-service";
import { formatCompact } from "@/lib/utils";
import { SummaryCard } from "@/components/summary-card";
import { AppIcon } from "@/components/app-icon";
import { AppStatusBadge } from "@/components/app-status-badge";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "live", label: "Live" },
  { value: "degraded", label: "Degraded" },
  { value: "building", label: "Building" },
  { value: "paused", label: "Paused" },
] as const;

type StatusFilter = (typeof statusOptions)[number]["value"];

export function AppsView() {
  const [appList, setAppList] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const data = await fetchApps();
    setAppList(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return appList.filter((app) => {
      const matchesQuery =
        !normalized ||
        `${app.name} ${app.description} ${app.framework} ${app.region}`
          .toLowerCase()
          .includes(normalized);
      const matchesStatus = status === "all" || app.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [appList, query, status]);

  const liveCount = appList.filter((app) => app.status === "live").length;
  const productionCount = appList.filter(
    (app) => app.environment === "Production",
  ).length;
  const totalRequests = appList.reduce((sum, app) => sum + app.requests, 0);

  async function handleCreateApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      setSaving(false);
      return;
    }

    const tones = ["violet", "sky", "emerald", "amber", "fuchsia", "indigo", "cyan"] as const;
    const icons = ["app-window", "credit-card", "layout-dashboard", "rocket", "book-open", "webhook", "shield"] as const;
    const randomTone = tones[Math.floor(Math.random() * tones.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newApp: AppItem = {
      id: `app_${Date.now()}`,
      name,
      description:
        String(formData.get("description") ?? "").trim() ||
        "Registered for workspace status tracking",
      status: (formData.get("status") as AppStatus) ?? "building",
      environment: (formData.get("environment") as Environment) ?? "Staging",
      framework: String(formData.get("framework") ?? "").trim() || "—",
      region: "iad1",
      requests: 0,
      lastDeploy: "just added",
      version: String(formData.get("version") ?? "").trim() || "v0.1.0",
      icon: randomIcon,
      tone: randomTone,
    };

    setAppList((current) => [newApp, ...current]);
    await supabaseCreateApp(newApp);

    setSaving(false);
    setDialogOpen(false);
    setQuery("");
    setStatus("all");
  }

  async function handleStatusChange(id: string, newStatus: AppStatus) {
    setAppList((current) =>
      current.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );
    setActiveMenuId(null);
    await supabaseUpdateAppStatus(id, newStatus);
  }

  async function handleDelete(id: string) {
    setAppList((current) => current.filter((app) => app.id !== id));
    setActiveMenuId(null);
    await supabaseDeleteApp(id);
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Apps"
        description="Register apps, track status and environment, and connect them to planning and monitoring."
      >
        <Link href="/planning" className={buttonClasses({ variant: "outline" })}>
          <KanbanSquare className="size-4" />
          Planning
        </Link>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Add app
        </Button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total apps"
          value={String(appList.length)}
          hint="Across all environments"
          icon={<Boxes className="size-4" />}
          tone="violet"
        />
        <SummaryCard
          label="In production"
          value={String(productionCount)}
          hint={`${liveCount} currently healthy`}
          icon={<Rocket className="size-4" />}
          tone="emerald"
        />
        <SummaryCard
          label="Requests / month"
          value={formatCompact(totalRequests)}
          hint="+6.4% versus last month"
          icon={<Activity className="size-4" />}
          tone="sky"
        />
        <SummaryCard
          label="Avg. response"
          value="184ms"
          hint="p95 at 412ms"
          icon={<Timer className="size-4" />}
          tone="amber"
        />
      </section>

      <Card>
        <CardHeader className="pb-4">
          <div>
            <CardTitle>All applications</CardTitle>
            <CardDescription>
              Dynamic PostgreSQL table synchronized with Supabase.
            </CardDescription>
          </div>
          <Badge variant="outline" className="tabular">
            {filtered.length} of {appList.length}
          </Badge>
        </CardHeader>

        <div className="flex flex-col gap-2 px-5 pb-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search apps, frameworks…"
              className="pl-9"
              aria-label="Search apps"
            />
          </div>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="sm:w-44"
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <span className="ml-auto hidden text-[11px] text-muted-foreground sm:block">
            Sorted by last deployment
          </span>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Application</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Environment
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Requests
                </TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Updated
                </TableHead>
                <TableHead className="text-right">Version</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <AppIcon
                        name={app.icon}
                        tone={app.tone}
                        className="size-9"
                        iconClassName="size-4"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{app.name}</p>
                        <p className="max-w-[22rem] truncate text-[10px] text-muted-foreground">
                          {app.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AppStatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {app.environment}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right lg:table-cell">
                    <span className="text-xs font-medium tabular">
                      {formatCompact(app.requests)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {app.lastDeploy}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {app.version}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/planning?app=${encodeURIComponent(app.id)}`}
                        className={buttonClasses({
                          variant: "ghost",
                          size: "sm",
                          className:
                            "hidden h-7 px-2 text-xs text-violet-600 hover:text-violet-500 dark:text-violet-400 sm:inline-flex",
                        })}
                        title="View app roadmap"
                      >
                        <KanbanSquare className="size-3 mr-1" />
                        Plan
                      </Link>
                      {app.status === "paused" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(app.id, "live")}
                          title="Resume app"
                          className="h-7 px-2 text-xs text-emerald-500 hover:text-emerald-400"
                        >
                          <Play className="size-3 mr-1" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(app.id, "paused")}
                          title="Pause app"
                          className="h-7 px-2 text-xs text-amber-500 hover:text-amber-400"
                        >
                          <Pause className="size-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(app.id)}
                        title="Delete app"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtered.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Search className="size-4" />
              </div>
              <p className="mt-3 text-sm font-medium">No apps found</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Try a different search term or clear the status filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="justify-between border-t border-border py-3">
          <span className="text-[10px] text-muted-foreground">
            Showing {filtered.length} of {appList.length} applications
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        label="Add app for tracking"
      >
        <form onSubmit={handleCreateApp}>
          <DialogHeader onClose={() => setDialogOpen(false)}>
            <DialogTitle>Add app</DialogTitle>
            <DialogDescription>
              Register an application in your workspace for status, environment, and
              planning—no deployment required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="app-name">App name</Label>
              <Input
                id="app-name"
                name="name"
                placeholder="e.g. Notifications API"
                autoComplete="off"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="app-description">Description</Label>
              <Input
                id="app-description"
                name="description"
                placeholder="What is this app responsible for?"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="app-status">Status</Label>
                <Select id="app-status" name="status" defaultValue="building">
                  <option value="building">Building</option>
                  <option value="live">Live</option>
                  <option value="degraded">Degraded</option>
                  <option value="paused">Paused</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-environment">Environment</Label>
                <Select
                  id="app-environment"
                  name="environment"
                  defaultValue="Staging"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Preview">Preview</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-version">Target version</Label>
                <Input
                  id="app-version"
                  name="version"
                  placeholder="v0.1.0"
                  autoComplete="off"
                  defaultValue="v0.1.0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-framework">Stack (optional)</Label>
                <Input
                  id="app-framework"
                  name="framework"
                  placeholder="Next.js, Go, internal service…"
                  autoComplete="off"
                />
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              The entry is saved to Supabase so status stays in sync across Apps,
              Planning, and the overview.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Plus />
              {saving ? "Adding…" : "Add app"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
