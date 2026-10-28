"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronsUpDown,
  DollarSign,
  MoreHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { platformNav, workspaceNav } from "@/lib/nav";
import { Icon } from "@/components/icon";
import { Avatar } from "@/components/app-icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fetchApps, fetchAutomations } from "@/lib/supabase/data-service";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [appsCount, setAppsCount] = useState<number | null>(null);
  const [autoCount, setAutoCount] = useState<number | null>(null);

  useEffect(() => {
    fetchApps().then((data) => setAppsCount(data.length));
    fetchAutomations().then((data) => setAutoCount(data.length));
  }, []);

  // Keyboard shortcut: Escape closes the drawer
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Navigation Drawer */}
      <aside
        aria-label="Navigation drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 sm:w-80 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer Header */}
        <div className="flex h-18 shrink-0 items-center justify-between border-b border-sidebar-border/80 px-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            onClick={onClose}
          >
            <span className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 shadow-[0_0_24px_rgba(139,92,246,0.35)] ring-1 ring-white/20">
              <DollarSign className="size-5 text-white" strokeWidth={2.75} />
            </span>
            <div className="min-w-0">
              <span className="block truncate text-base font-bold tracking-tight text-sidebar-foreground">
                trillion Dollar
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.2em] text-muted-foreground/80 uppercase">
                SaaS Console
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 pt-4">
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-left transition-all hover:bg-white/[0.06] hover:border-white/15"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 shadow-xs">
              <Boxes className="size-4 text-violet-400" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-sidebar-foreground">
                trillion Dollar
              </span>
              <span className="block text-[10px] text-muted-foreground">
                Pro workspace
              </span>
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground transition-colors group-hover:text-sidebar-foreground" />
          </button>
        </div>

        {/* Navigation Lists */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <NavGroup
            label="Platform"
            items={platformNav}
            isActive={isActive}
            onNavigate={onClose}
            badgeOverrides={{
              Apps: appsCount !== null ? String(appsCount) : undefined,
              Automation: autoCount !== null ? String(autoCount) : undefined,
            }}
          />
          <NavGroup
            label="Workspace"
            items={workspaceNav}
            isActive={isActive}
            onNavigate={onClose}
          />
        </nav>

        {/* Pro Plan Card */}
        <div className="px-3 pb-3">
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.12] to-violet-950/20 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sidebar-foreground">
              <Sparkles className="size-3.5 text-violet-400" />
              Pro plan
              <span className="ml-auto text-[11px] font-normal text-muted-foreground">
                68%
              </span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              6,800 of 10,000 monthly credits used
            </p>
            <Progress value={68} className="mt-2.5 h-1.5 bg-white/10" />
            <Link
              href="/settings"
              onClick={onClose}
              className="mt-2.5 inline-flex text-[11px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              Upgrade plan →
            </Link>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="shrink-0 border-t border-sidebar-border/80 p-3">
          <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-sidebar-accent/50">
            <Avatar name="Maya Chen" tone="violet" className="size-9 ring-2 ring-white/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                Maya Chen
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                maya@trilliondollar.com
              </p>
            </div>
            <button
              type="button"
              aria-label="Account options"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavGroup({
  label,
  items,
  isActive,
  onNavigate,
  badgeOverrides = {},
  className,
}: {
  label: string;
  items: typeof platformNav;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
  badgeOverrides?: Record<string, string | undefined>;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-muted-foreground/70 uppercase">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);
          const badgeText = badgeOverrides[item.label] ?? item.badge;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                  active
                    ? "bg-white/[0.08] text-white shadow-xs border border-white/[0.08]"
                    : "text-sidebar-foreground/70 hover:bg-white/[0.04] hover:text-sidebar-foreground",
                )}
              >
                {active ? (
                  <span className="absolute top-1/2 left-1 h-5 w-1 -translate-y-1/2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                ) : null}
                <Icon
                  name={item.icon}
                  className={cn(
                    "size-4.5 shrink-0 transition-colors",
                    active
                      ? "text-violet-400"
                      : "text-muted-foreground group-hover:text-sidebar-foreground",
                  )}
                />
                <span className="flex-1 font-medium">{item.label}</span>
                {badgeText ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
                      active
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-white/[0.06] border border-white/[0.08] text-muted-foreground",
                    )}
                  >
                    {badgeText}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
