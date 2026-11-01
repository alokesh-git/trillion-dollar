"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Copy,
  CreditCard,
  KeyRound,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import {
  type ApiKey,
  type Invoice,
  type TeamMember,
  type Tone,
  type UsageMeter,
} from "@/lib/data";
import {
  fetchWorkspaceSettings,
  updateWorkspaceSettings,
  fetchTeamMembers,
  inviteTeamMember,
  deleteTeamMember,
  fetchApiKeys,
  createApiKey,
  revokeApiKey,
  type WorkspaceSettings,
} from "@/lib/supabase/data-service";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/app-icon";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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
import { Input, Label, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

const planUsage: UsageMeter[] = [
  { label: "Seats", percent: 67, display: "8 of 12" },
  { label: "API calls", percent: 68, display: "6.8M of 10M" },
  { label: "Storage", percent: 57, display: "142 of 250 GB" },
  { label: "Bandwidth", percent: 60, display: "1.2 of 2 TB" },
];

const billingInvoices: Invoice[] = [
  { id: "INV-2026-010", date: "Oct 1, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-2026-009", date: "Sep 1, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: "$199.00", status: "Paid" },
];

const tabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "api-keys", label: "API keys", icon: KeyRound },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SettingsView() {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6">

      <PageHeader
        title="Settings"
        description="Manage your profile, workspace, team, billing and developer access with live Supabase sync."
      >
        <Badge variant="violet" className="h-9 px-3 text-xs">
          <ShieldCheck className="size-3.5" />
          Pro workspace
        </Badge>
      </PageHeader>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="shrink-0 lg:w-48">
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      active
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-muted-foreground",
                    )}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <div hidden={tab !== "profile"}>
            <ProfilePanel />
          </div>
          <div hidden={tab !== "workspace"}>
            <WorkspacePanel />
          </div>
          <div hidden={tab !== "team"}>
            <TeamPanel />
          </div>
          <div hidden={tab !== "notifications"}>
            <NotificationsPanel />
          </div>
          <div hidden={tab !== "billing"}>
            <BillingPanel />
          </div>
          <div hidden={tab !== "api-keys"}>
            <ApiKeysPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function useSavedFlag() {
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return { saved, save };
}

function ProfilePanel() {
  const { saved, save } = useSavedFlag();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is how you appear across the workspace.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name="Maya Chen" tone="violet" className="size-16 text-lg" />
            <div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Upload new photo
                </Button>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                JPG, PNG or GIF. 1MB max.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="profile-name" label="Full name" defaultValue="Maya Chen" />
            <Field
              id="profile-email"
              label="Email address"
              type="email"
              defaultValue="maya@trilliondollar.com"
            />
            <Field
              id="profile-title"
              label="Job title"
              defaultValue="Co-founder & CEO"
            />
            <div className="space-y-1.5">
              <Label htmlFor="profile-timezone">Timezone</Label>
              <Select id="profile-timezone" defaultValue="America/Los_Angeles">
                <option value="America/Los_Angeles">Pacific Time (US)</option>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Berlin">Berlin (CET)</option>
                <option value="Asia/Kolkata">India Standard Time</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              defaultValue="Building the financial backbone for modern SaaS teams."
              maxLength={240}
            />
            <p className="text-[10px] text-muted-foreground">
              Displayed on your public profile and in team invitations.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t border-border py-3">
          <span className="text-[10px] text-muted-foreground">
            Last updated 2 days ago
          </span>
          <Button size="sm" onClick={save}>
            {saved ? (
              <>
                <Check />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              Devices currently signed into your account.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <SessionRow
            device="MacBook Pro · Chrome"
            location="San Francisco, CA"
            current
          />
          <SessionRow device="iPhone 16 · Safari" location="San Francisco, CA" />
        </CardContent>
      </Card>
    </div>
  );
}

function SessionRow({
  device,
  location,
  current,
}: {
  device: string;
  location: string;
  current?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
      <div>
        <p className="text-xs font-medium">{device}</p>
        <p className="text-[10px] text-muted-foreground">{location}</p>
      </div>
      {current ? (
        <Badge variant="success">
          <span className="size-1.5 rounded-full bg-current" />
          This device
        </Badge>
      ) : (
        <Button variant="ghost" size="sm">
          Revoke
        </Button>
      )}
    </div>
  );
}

function WorkspacePanel() {
  const { saved, save } = useSavedFlag();
  const [ws, setWs] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    fetchWorkspaceSettings().then(setWs);
  }, []);

  async function handleSave() {
    if (!ws) return;
    await updateWorkspaceSettings(ws);
    save();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>
              General details for your trillion Dollar workspace. Synchronized with Supabase.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                value={ws?.name ?? "trillion Dollar"}
                onChange={(e) => setWs((prev) => prev ? { ...prev, name: e.target.value } : prev)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workspace-slug">Workspace URL</Label>
              <div className="flex items-center rounded-lg border border-input shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <span className="border-r border-border px-2.5 py-2 text-xs text-muted-foreground">
                  app.trilliondollar.com/
                </span>
                <input
                  id="workspace-slug"
                  value={ws?.slug ?? "trillion-dollar"}
                  onChange={(e) => setWs((prev) => prev ? { ...prev, slug: e.target.value } : prev)}
                  className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workspace-region">Primary region</Label>
              <Select id="workspace-region" defaultValue="us-east-1">
                <option value="us-east-1">US East (Virginia)</option>
                <option value="us-west-1">US West (Oregon)</option>
                <option value="eu-central-1">EU Central (Frankfurt)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workspace-env">Default environment</Label>
              <Select id="workspace-env" defaultValue="Production">
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Preview">Preview</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-domain">Custom domain</Label>
            <Input
              id="workspace-domain"
              value={ws?.domain ?? "console.trilliondollar.com"}
              onChange={(e) => setWs((prev) => prev ? { ...prev, domain: e.target.value } : prev)}
            />
            <p className="text-[10px] text-muted-foreground">
              Domain is verified. SSL is provisioned automatically.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t border-border py-3">
          <span className="text-[10px] text-muted-foreground">
            Workspace ID: ws_md_8f21c
          </span>
          <Button size="sm" onClick={handleSave}>
            {saved ? (
              <>
                <Check />
                Saved
              </>
            ) : (
              "Save workspace"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <div>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your entire workspace.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium">Transfer ownership</p>
              <p className="text-[11px] text-muted-foreground">
                Move this workspace to another owner.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Transfer
            </Button>
          </div>
          <div className="h-px bg-border" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium">Delete workspace</p>
              <p className="text-[11px] text-muted-foreground">
                Permanently delete all apps, tools and automation history.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const roleVariant: Record<
  TeamMember["role"],
  "violet" | "info" | "secondary" | "warning"
> = {
  Owner: "violet",
  Admin: "info",
  Developer: "secondary",
  Billing: "warning",
  Member: "secondary",
  Viewer: "info",
};

function TeamPanel() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    fetchTeamMembers().then(setMembers);
  }, []);

  async function inviteMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;

    const role = String(formData.get("role") ?? "Developer") as TeamMember["role"];
    const localPart = email.split("@")[0].replace(/[._-]/g, " ");
    const name = localPart.replace(/\b\w/g, (char) => char.toUpperCase());

    const tones: Tone[] = ["violet", "sky", "emerald", "amber", "fuchsia"];

    const newMbr = await inviteTeamMember({
      name,
      email,
      role,
      status: "Invited",
      lastActive: "—",
      tone: tones[members.length % tones.length],
    });

    setMembers((current) => [...current, newMbr]);
    setInviteOpen(false);
  }

  async function handleDelete(id: string) {
    setMembers((current) => current.filter((m) => m.id !== id));
    await deleteTeamMember(id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Team members</CardTitle>
            <CardDescription>
              {members.length} people have access to this workspace. Stored in Supabase.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus />
            Invite member
          </Button>
        </CardHeader>

        <CardContent className="px-0 pt-4 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Last active
                </TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} tone={member.tone} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[member.role]}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.status === "Active" ? (
                      <Badge variant="success">
                        <span className="size-1.5 rounded-full bg-current" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Invited</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {member.lastActive}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="border-t border-border py-3">
          <p className="text-[10px] text-muted-foreground">
            Members can be managed by owners and admins.
          </p>
        </CardFooter>
      </Card>

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        label="Invite a team member"
      >
        <form onSubmit={inviteMember}>
          <DialogHeader onClose={() => setInviteOpen(false)}>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              They&apos;ll receive an email with a link to join the workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="teammate@company.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select id="invite-role" name="role" defaultValue="Developer">
                <option value="Admin">Admin</option>
                <option value="Developer">Developer</option>
                <option value="Billing">Billing</option>
              </Select>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Developers can deploy apps and manage automations. Admins can
              also manage members and billing.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus />
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

const notificationGroups = [
  {
    title: "Deployments",
    items: [
      {
        id: "deploy_success",
        label: "Successful deployments",
        description: "When a production deploy finishes successfully.",
        value: true,
      },
      {
        id: "deploy_failed",
        label: "Failed deployments",
        description: "When a build or deploy fails in any environment.",
        value: true,
      },
      {
        id: "app_degraded",
        label: "App health alerts",
        description: "When error rate or latency crosses a threshold.",
        value: true,
      },
    ],
  },
  {
    title: "Automation",
    items: [
      {
        id: "automation_failed",
        label: "Workflow failures",
        description: "When a workflow run fails and retries are exhausted.",
        value: true,
      },
      {
        id: "automation_digest",
        label: "Weekly automation digest",
        description: "A Monday summary of runs, failures and time saved.",
        value: false,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        id: "billing",
        label: "Billing receipts",
        description: "Invoices, payment confirmations and plan changes.",
        value: true,
      },
      {
        id: "product",
        label: "Product updates",
        description: "New features and improvements to trillion Dollar.",
        value: false,
      },
    ],
  },
];

function NotificationsPanel() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      notificationGroups.flatMap((group) =>
        group.items.map((item) => [item.id, item.value]),
      ),
    ),
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose what lands in your inbox and what stays quiet.
            </CardDescription>
          </div>
          <Badge variant="outline">Auto-saved</Badge>
        </CardHeader>

        <CardContent className="pt-2">
          {notificationGroups.map((group, groupIndex) => (
            <div
              key={group.title}
              className={cn(groupIndex > 0 && "mt-6 border-t border-border pt-5")}
            >
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {group.title}
              </p>
              <div className="mt-2 divide-y divide-border">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-6 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(preferences[item.id])}
                      onCheckedChange={(checked) =>
                        setPreferences((current) => ({
                          ...current,
                          [item.id]: checked,
                        }))
                      }
                      aria-label={item.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>

        <CardFooter className="border-t border-border py-3">
          <p className="text-[10px] text-muted-foreground">
            Critical billing and security notices are always delivered.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500/12 via-fuchsia-500/8 to-transparent px-5 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Pro plan</CardTitle>
                <Badge variant="violet">Current plan</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Renews on Nov 1, 2026 · billed monthly
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-tight tabular">
                $249
                <span className="text-xs font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
            </div>
          </div>
        </div>
        <CardContent className="space-y-4 pt-5">
          {planUsage.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium tabular">{item.display}</span>
              </div>
              <Progress value={item.percent} className="mt-2 h-1.5" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-2 border-t border-border py-3">
          <Button variant="outline" size="sm">
            Manage subscription
          </Button>
          <Button size="sm">Upgrade to Scale</Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Payment method</CardTitle>
              <CardDescription>Used for all future invoices.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                <CreditCard className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-xs font-medium">Visa ending in 4242</p>
                <p className="text-[10px] text-muted-foreground">
                  Expires 08/28
                </p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Billing email</CardTitle>
              <CardDescription>Where invoices are sent.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Input defaultValue="billing@trilliondollar.com" type="email" />
            <Button variant="outline" size="sm">
              Update email
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Download past invoices for your records.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0 pt-4 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="pr-5 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="pl-5">
                    <span className="font-mono text-[11px]">{invoice.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {invoice.date}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-medium tabular">
                      {invoice.amount}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Badge variant={invoice.status === "Paid" ? "success" : "warning"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys().then(setKeys);
  }, []);

  function copyKey(key: ApiKey) {
    navigator.clipboard?.writeText(key.prefix).catch(() => undefined);
    setCopied(key.id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const newKey = await createApiKey(name);
    setKeys((current) => [newKey, ...current]);
    setCreateOpen(false);
  }

  async function handleRevoke(id: string) {
    setKeys((current) =>
      current.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)),
    );
    await revokeApiKey(id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>API keys</CardTitle>
            <CardDescription>
              Authenticate requests to the trillion Dollar API. Synchronized with Supabase.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus />
            Create key
          </Button>
        </CardHeader>

        <CardContent className="px-0 pt-4 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Last used
                </TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">{key.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Created {key.created}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {key.prefix}
                    </code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={key.status === "active" ? "success" : "secondary"}>
                      {key.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {key.lastUsed}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyKey(key)}
                        aria-label={`Copy ${key.name} key`}
                      >
                        {copied === key.id ? (
                          <Check className="text-emerald-500" />
                        ) : (
                          <Copy />
                        )}
                      </Button>
                      {key.status !== "revoked" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(key.id)}
                          className="h-7 px-2 text-[10px] text-rose-500 hover:text-rose-400"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="border-t border-border py-3">
          <p className="text-[10px] text-muted-foreground">
            Never share keys in public repositories or client-side code.
          </p>
        </CardFooter>
      </Card>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        label="Create an API key"
      >
        <form onSubmit={createKey}>
          <DialogHeader onClose={() => setCreateOpen(false)}>
            <DialogTitle>Create an API key</DialogTitle>
            <DialogDescription>
              Name the key so you can revoke it later without guesswork.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                name="name"
                placeholder="e.g. Analytics worker"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="key-scope">Scope</Label>
              <Select id="key-scope" name="scope" defaultValue="Read & write">
                <option value="Full access">Full access</option>
                <option value="Read & write">Read & write</option>
                <option value="Read only">Read only</option>
                <option value="Deploy only">Deploy only</option>
              </Select>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              The full secret is stored securely and synced with Supabase.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus />
              Create key
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.ComponentProps<"input">) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
