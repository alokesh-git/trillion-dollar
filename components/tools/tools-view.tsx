"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Link2,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Unplug,
  Wrench,
} from "lucide-react";
import {
  type ToolCategory,
  type ToolItem,
  type ToolStatus,
} from "@/lib/data";
import {
  fetchTools,
  toggleToolStatus as supabaseToggleTool,
  createTool as supabaseCreateTool,
} from "@/lib/supabase/data-service";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const categories: ("All" | ToolCategory)[] = [
  "All",
  "Infrastructure",
  "Developer",
  "Revenue",
  "Growth",
  "Observability",
];

const statusConfig: Record<
  ToolStatus,
  { label: string; variant: "success" | "outline" | "violet" }
> = {
  connected: { label: "Connected", variant: "success" },
  available: { label: "Available", variant: "outline" },
  beta: { label: "Beta", variant: "violet" },
};

export function ToolsView() {
  const [toolList, setToolList] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"All" | ToolCategory>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    const data = await fetchTools();
    setToolList(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const selected = toolList.find((tool) => tool.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return toolList.filter((tool) => {
      const matchesCategory =
        category === "All" || tool.category === category;
      const matchesQuery =
        !normalized ||
        `${tool.name} ${tool.description} ${tool.category}`
          .toLowerCase()
          .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [toolList, category, query]);

  const connectedCount = toolList.filter(
    (tool) => tool.status === "connected",
  ).length;
  const availableCount = toolList.filter(
    (tool) => tool.status !== "connected",
  ).length;

  async function toggleConnection(tool: ToolItem) {
    const nextStatus: ToolStatus =
      tool.status === "connected" ? "available" : "connected";

    setToolList((current) =>
      current.map((item) =>
        item.id === tool.id
          ? {
              ...item,
              status: nextStatus,
              meta:
                nextStatus === "connected" ? "Live mode" : "Not connected",
            }
          : item,
      ),
    );

    setSelectedId(null);
    await supabaseToggleTool(tool.id, nextStatus);
  }

  async function handleAddCustomTool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const newTool: ToolItem = {
      id: `tool_${Date.now()}`,
      name,
      description:
        String(formData.get("description") ?? "").trim() ||
        "Custom service integration",
      category: (formData.get("category") as ToolCategory) || "Developer",
      status: "connected",
      icon: "wrench",
      tone: "violet",
      meta: "Live mode",
    };

    setToolList((current) => [newTool, ...current]);
    setAddDialogOpen(false);
    await supabaseCreateTool(newTool);
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Tools & Integrations"
        description="Connect third-party infrastructure, billing providers, auth and monitoring with live Supabase state."
      >
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus />
          Add integration
        </Button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total integrations"
          value={String(toolList.length)}
          hint="Supported across all apps"
          icon={<Plug className="size-4" />}
          tone="violet"
        />
        <SummaryCard
          label="Connected"
          value={String(connectedCount)}
          hint="Active API credentials"
          icon={<Check className="size-4" />}
          tone="emerald"
        />
        <SummaryCard
          label="Available"
          value={String(availableCount)}
          hint="Ready to connect"
          icon={<Link2 className="size-4" />}
          tone="sky"
        />
        <SummaryCard
          label="Categories"
          value={String(categories.length - 1)}
          hint="Across infrastructure & data"
          icon={<Wrench className="size-4" />}
          tone="amber"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
          {categories.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools, providers…"
            className="pl-9"
            aria-label="Search tools"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => {
          const config = statusConfig[tool.status];
          const isConnected = tool.status === "connected";

          return (
            <Card
              key={tool.id}
              className="flex flex-col justify-between p-5 transition-colors hover:border-border/80"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AppIcon
                      name={tool.icon}
                      tone={tool.tone}
                      className="size-10"
                      iconClassName="size-4"
                    />
                    <div>
                      <h3 className="text-sm font-medium">{tool.name}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {tool.category}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.variant} className="text-[10px]">
                    {config.label}
                  </Badge>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {tool.meta}
                </span>

                <Button
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  onClick={() => setSelectedId(tool.id)}
                  className="h-8 gap-1.5 text-xs"
                >
                  {isConnected ? (
                    <>
                      <Unplug className="size-3.5" />
                      Manage
                    </>
                  ) : (
                    <>
                      <Plug className="size-3.5" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        label="Manage tool integration"
      >
        {selected ? (
          <div>
            <DialogHeader onClose={() => setSelectedId(null)}>
              <DialogTitle className="flex items-center gap-2">
                <AppIcon
                  name={selected.icon}
                  tone={selected.tone}
                  className="size-7"
                  iconClassName="size-3.5"
                />
                {selected.name}
              </DialogTitle>
              <DialogDescription>{selected.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-5 py-4">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-medium">Current Status</p>
                <p className="text-muted-foreground">
                  {selected.status === "connected"
                    ? "Currently connected and synchronized with Supabase."
                    : "Not connected. Click below to establish a live integration."}
                </p>
              </div>
            </div>

            <DialogFooter className="justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </Button>
              <Button
                variant={selected.status === "connected" ? "destructive" : "default"}
                onClick={() => toggleConnection(selected)}
              >
                {selected.status === "connected" ? (
                  <>
                    <Unplug className="size-4" />
                    Disconnect {selected.name}
                  </>
                ) : (
                  <>
                    <Plug className="size-4" />
                    Connect {selected.name}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        label="Add Integration"
      >
        <form onSubmit={handleAddCustomTool}>
          <DialogHeader onClose={() => setAddDialogOpen(false)}>
            <DialogTitle>Add custom integration</DialogTitle>
            <DialogDescription>
              Register an internal service or third-party provider.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="tool-name">Provider name</Label>
              <Input
                id="tool-name"
                name="name"
                placeholder="e.g. Datadog, Twilio, Redis"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tool-description">Description</Label>
              <Input
                id="tool-description"
                name="description"
                placeholder="What is this service used for?"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tool-category">Category</Label>
              <Select id="tool-category" name="category" defaultValue="Developer">
                <option value="Infrastructure">Infrastructure</option>
                <option value="Developer">Developer</option>
                <option value="Revenue">Revenue</option>
                <option value="Growth">Growth</option>
                <option value="Observability">Observability</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus />
              Add Integration
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
