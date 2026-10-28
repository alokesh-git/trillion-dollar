"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Trash2,
  Workflow,
  Zap,
} from "lucide-react";
import {
  type AutomationItem,
  type AutomationRun,
} from "@/lib/data";
import {
  fetchAutomations,
  fetchAutomationRuns,
  createAutomation as supabaseCreateAutomation,
  toggleAutomationStatus as supabaseToggleAutomation,
  triggerAutomationRun as supabaseTriggerRun,
} from "@/lib/supabase/data-service";
import { cn, formatNumber } from "@/lib/utils";
import { AppIcon } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const runStatus: Record<
  string,
  { label: string; variant: "success" | "destructive" | "info" | "secondary" }
> = {
  success: { label: "Success", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  running: { label: "Running", variant: "info" },
  skipped: { label: "Skipped", variant: "secondary" },
};

export function AutomationView() {
  const [workflowList, setWorkflowList] = useState<AutomationItem[]>([]);
  const [runsList, setRunsList] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [autos, runs] = await Promise.all([
      fetchAutomations(),
      fetchAutomationRuns(),
    ]);
    setWorkflowList(autos);
    setRunsList(runs);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = workflowList.filter(
    (workflow) => workflow.status === "active",
  ).length;

  const totalRuns = useMemo(
    () => workflowList.reduce((sum, workflow) => sum + workflow.runs, 0),
    [workflowList],
  );

  async function toggleWorkflow(id: string, active: boolean) {
    const nextStatus = active ? "active" : "paused";
    setWorkflowList((current) =>
      current.map((workflow) =>
        workflow.id === id ? { ...workflow, status: nextStatus } : workflow,
      ),
    );
    await supabaseToggleAutomation(id, nextStatus);
  }

  async function handleRunWorkflow(id: string) {
    setRunningId(id);
    const newRun = await supabaseTriggerRun(id);

    setWorkflowList((current) =>
      current.map((workflow) =>
        workflow.id === id
          ? {
              ...workflow,
              runs: workflow.runs + 1,
              lastRun: "just now",
            }
          : workflow,
      ),
    );

    setRunsList((current) => [newRun, ...current]);
    setRunningId(null);
  }

  async function createWorkflow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const tones = ["violet", "sky", "emerald", "amber", "fuchsia", "rose"] as const;
    const randomTone = tones[Math.floor(Math.random() * tones.length)];

    const newWorkflow: AutomationItem = {
      id: `auto_${Date.now()}`,
      name,
      description:
        String(formData.get("description") ?? "").trim() ||
        "Newly created automated workflow",
      trigger: String(formData.get("trigger") ?? "user.created"),
      action: String(formData.get("action") ?? "Send email"),
      status: "active",
      runs: 0,
      successRate: 100,
      lastRun: "Never",
      icon: "workflow",
      tone: randomTone,
    };

    setWorkflowList((current) => [newWorkflow, ...current]);
    setDialogOpen(false);
    await supabaseCreateAutomation(newWorkflow);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Event-driven workflows, background jobs and transactional hooks powered by Supabase."
      >
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          New automation
        </Button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total automations"
          value={String(workflowList.length)}
          hint={`${activeCount} currently active`}
          icon={<Workflow className="size-4" />}
          tone="violet"
        />
        <SummaryCard
          label="Runs this month"
          value={formatNumber(totalRuns)}
          hint="+18.9% versus last month"
          icon={<Repeat className="size-4" />}
          tone="fuchsia"
        />
        <SummaryCard
          label="Avg. duration"
          value="1.4s"
          hint="p95 at 3.8s"
          icon={<Clock className="size-4" />}
          tone="sky"
        />
        <SummaryCard
          label="Success rate"
          value="99.2%"
          hint="2 failed in last 24h"
          icon={<ShieldCheck className="size-4" />}
          tone="emerald"
        />
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Configured workflows</CardTitle>
            <CardDescription>
              Triggers, actions and execution metrics stored dynamically in PostgreSQL.
            </CardDescription>
          </div>
          <Badge variant="outline" className="tabular">
            {activeCount} active · {workflowList.length - activeCount} paused
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Workflow</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Runs</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Success
                </TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Last run
                </TableHead>
                <TableHead className="pr-5 text-right">Enabled / Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflowList.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <AppIcon
                        name={workflow.icon}
                        tone={workflow.tone}
                        className="size-9"
                        iconClassName="size-4"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {workflow.name}
                        </p>
                        <p className="max-w-[18rem] truncate text-[10px] text-muted-foreground">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {workflow.trigger}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {workflow.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-medium tabular">
                      {formatNumber(workflow.runs)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right md:table-cell">
                    <span className="text-xs text-muted-foreground tabular">
                      {workflow.successRate}%
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {workflow.lastRun}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={runningId === workflow.id}
                        onClick={() => handleRunWorkflow(workflow.id)}
                        className="h-7 px-2 text-xs"
                      >
                        <Play className={`size-3 mr-1 ${runningId === workflow.id ? "animate-spin" : ""}`} />
                        Run
                      </Button>
                      <Switch
                        checked={workflow.status === "active"}
                        onCheckedChange={(checked) =>
                          toggleWorkflow(workflow.id, checked)
                        }
                        aria-label={`Toggle ${workflow.name}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between border-t border-border py-3">
          <span className="text-[10px] text-muted-foreground">
            {workflowList.length} total automations configured
          </span>
          <span className="text-[10px] text-muted-foreground">
            Changes persist directly to Supabase
          </span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent workflow runs</CardTitle>
            <CardDescription>
              Real-time audit log of executed jobs.
            </CardDescription>
          </div>
          <Badge variant="outline" className="tabular">
            {runsList.length} logged
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead className="hidden md:table-cell">Reference</TableHead>
                <TableHead className="pr-5 text-right">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runsList.slice(0, 10).map((run) => {
                const config = runStatus[run.status] ?? runStatus.success;

                return (
                  <TableRow key={run.id}>
                    <TableCell className="pl-5 font-medium text-xs">
                      {run.workflow}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1.5 text-[10px]">
                        <StatusDot />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                      {run.duration}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                      {run.reference}
                    </TableCell>
                    <TableCell className="pr-5 text-right text-xs text-muted-foreground">
                      {run.started}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        label="Create automation"
      >
        <form onSubmit={createWorkflow}>
          <DialogHeader onClose={() => setDialogOpen(false)}>
            <DialogTitle>New automated workflow</DialogTitle>
            <DialogDescription>
              Trigger tasks automatically when events occur across your SaaS.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="workflow-name">Workflow name</Label>
              <Input
                id="workflow-name"
                name="name"
                placeholder="e.g. Welcome drip series"
                autoComplete="off"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="workflow-desc">Description</Label>
              <Input
                id="workflow-desc"
                name="description"
                placeholder="What does this automation do?"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="workflow-trigger">Trigger</Label>
                <Select
                  id="workflow-trigger"
                  name="trigger"
                  defaultValue="user.created"
                >
                  <option value="user.created">user.created</option>
                  <option value="invoice.paid">invoice.paid</option>
                  <option value="invoice.payment_failed">invoice.payment_failed</option>
                  <option value="trial.ending">trial.ending</option>
                  <option value="app.deploy_failed">app.deploy_failed</option>
                  <option value="cron.schedule">Daily Cron</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workflow-action">Action</Label>
                <Select
                  id="workflow-action"
                  name="action"
                  defaultValue="Send email"
                >
                  <option value="Send email">Send email</option>
                  <option value="Slack notification">Slack notification</option>
                  <option value="Webhook post">Webhook POST</option>
                  <option value="Retry payment">Retry payment</option>
                  <option value="Sync database row">Sync database row</option>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus />
              Create workflow
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
