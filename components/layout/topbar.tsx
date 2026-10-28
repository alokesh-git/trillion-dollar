"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  Check,
  ChevronDown,
  DollarSign,
  Plus,
  Search,
} from "lucide-react";
import { allNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { fetchApps, fetchAutomations } from "@/lib/supabase/data-service";
import { createAvatar } from '@bible-strong/avatar-react'
import '@bible-strong/avatar-react/styles.css'
import definition from '../../public/avatar.json'

const Avatar = createAvatar(definition)

const notifications = [
  {
    id: "n1",
    title: "Deployment succeeded",
    body: "Billing API v2.8.1 is live in production.",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Growth Engine is degraded",
    body: "Error rate crossed 2% over the last 10 minutes.",
    time: "46m ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Invite accepted",
    body: "Lucas Meyer joined the workspace.",
    time: "2h ago",
    unread: false,
  },
];



export function Topbar({
  onOpenCommand,
}: {
  onOpenCommand: () => void;
}) {
  const pathname = usePathname();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [appsCount, setAppsCount] = useState<number | null>(null);
  const [autoCount, setAutoCount] = useState<number | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApps().then((data) => setAppsCount(data.length));
    fetchAutomations().then((data) => setAutoCount(data.length));
  }, [pathname]);

  // Close popovers on click outside
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 w-full max-w-full overflow-x-clip border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-[1440px] items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Inline Nav Links */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6 md:flex-initial lg:gap-8">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-2.5 md:flex-initial md:max-w-none"
          >
            <span className="flex shrink-0 items-center">
              <Avatar defaultAnimation="sleeping" size={32} />
            </span>
            <span className="min-w-0 truncate text-xs font-bold tracking-tight text-foreground sm:text-sm">
              Trillion Dollar
            </span>
          </Link>

          {/* Inline Navigation Links (One Row) */}
          <nav className="hidden items-center gap-5 md:flex">
            {allNav.map((item) => {
              const active = isActive(item.href);
              const badgeCount =
                item.label === "Apps"
                  ? appsCount !== null
                    ? String(appsCount)
                    : item.badge
                  : item.label === "Automation"
                    ? autoCount !== null
                      ? String(autoCount)
                      : item.badge
                    : item.badge;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{item.label}</span>
                  {badgeCount && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-medium leading-none",
                        active
                          ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Supabase, Theme, + New, Profile */}
        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2.5 md:ml-auto">
          <button
            type="button"
            onClick={onOpenCommand}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-muted-foreground shadow-xs transition-colors hover:border-border hover:bg-muted/70 sm:hidden"
            aria-label="Search console"
          >
            <Search className="size-3.5" />
          </button>
          {/* Pill Search Box */}
          <button
            type="button"
            onClick={onOpenCommand}
            className="hidden h-8 min-w-0 max-w-[14rem] flex-1 items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 text-left shadow-xs transition-colors hover:border-border hover:bg-muted/70 sm:flex md:max-w-none md:flex-none md:w-56"
          >
            <Search className="size-3 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              Search console…
            </span>
            <kbd className="ml-auto hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground md:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Supabase Indicator */}
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 lg:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>

          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setNotificationOpen((value) => !value)}
              aria-label="Notifications"
            >
              <Bell className="size-3.5" />
              {unread ? (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-violet-500 ring-2 ring-background" />
              ) : null}
            </Button>

            {notificationOpen && (
              <div className="absolute top-full right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold">Notifications</p>
                    <p className="text-[10px] text-muted-foreground">
                      {unread ? "2 unread updates" : "You're all caught up"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnread(false)}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
                  >
                    <Check className="size-3" />
                    Mark all read
                  </button>
                </div>
                <ul className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="flex gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                    >
                      <span
                        className={
                          notification.unread && unread
                            ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500"
                            : "mt-1.5 size-1.5 shrink-0 rounded-full bg-transparent"
                        }
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{notification.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/70">
                          {notification.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* '+ New' Pill Button matching the user reference */}
          <Link
            href="/apps"
            className="inline-flex size-8 shrink-0 items-center justify-center gap-1 rounded-full bg-foreground text-background shadow-xs transition-opacity hover:opacity-90 active:scale-95 sm:h-7 sm:w-auto sm:px-3"
            aria-label="Add app for tracking"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            <span className="hidden text-xs font-semibold sm:inline">Add app</span>
          </Link>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative hidden sm:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg p-0.5 transition-colors hover:bg-accent"
              aria-label="User menu"
            >
              {/* <UserAvatar name="Maya Chen" tone="violet" className="size-7 ring-1 ring-border" /> */}
              <ChevronDown className="hidden size-3 text-muted-foreground sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-2xl shadow-black/40">
                <div className="px-2.5 py-2 border-b border-border/60">
                  <p className="text-xs font-semibold text-foreground">Maya Chen</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    maya@trilliondollar.com
                  </p>
                </div>
                <div className="pt-1.5 space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Boxes className="size-3.5" />
                    trillion Dollar (Pro)
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Sub-Row (Only visible on small devices) */}
      <div className="flex max-w-full md:hidden gap-4 overflow-x-auto border-t border-border/40 px-3 py-2 text-xs font-medium overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {allNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap transition-colors",
                active ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
