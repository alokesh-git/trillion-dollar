"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  Play,
  Plus,
  Search,
  SunMoon,
} from "lucide-react";
import { allNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { Dialog } from "@/components/ui/dialog";

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  group: "Pages" | "Actions";
  icon: ReactNode;
  href?: string;
  action?: "theme";
}

const pages: PaletteItem[] = allNav.map((item) => ({
  id: item.href,
  label: item.label,
  hint: item.description,
  group: "Pages",
  icon: <Icon name={item.icon} className="size-3.5" />,
  href: item.href,
}));

const actions: PaletteItem[] = [
  {
    id: "new-app",
    label: "Add an app",
    hint: "Register an app for status and planning tracking",
    group: "Actions",
    icon: <Plus className="size-3.5" />,
    href: "/apps",
  },
  {
    id: "runs",
    label: "View automation runs",
    hint: "Inspect recent workflow executions",
    group: "Actions",
    icon: <Play className="size-3.5" />,
    href: "/automation",
  },
  {
    id: "toggle-theme",
    label: "Toggle appearance",
    hint: "Switch between dark and light mode",
    group: "Actions",
    icon: <SunMoon className="size-3.5" />,
    action: "theme",
  },
];

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.toggle("dark");
  root.style.colorScheme = isDark ? "dark" : "light";

  try {
    localStorage.setItem("trillion-dollar-theme", isDark ? "dark" : "light");
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => {
    const all = [...pages, ...actions];
    const normalized = query.trim().toLowerCase();

    if (!normalized) return all;

    return all.filter((item) =>
      `${item.label} ${item.hint}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function closePalette() {
    setQuery("");
    setActive(0);
    onOpenChange(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        if (open) {
          setQuery("");
          setActive(0);
          onOpenChange(false);
        } else {
          onOpenChange(true);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function select(item: PaletteItem | undefined) {
    if (!item) return;

    closePalette();

    if (item.action === "theme") {
      toggleTheme();
      return;
    }

    if (item.href) router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (items.length ? (index + 1) % items.length : 0));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) =>
        items.length ? (index - 1 + items.length) % items.length : 0,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      select(items[active]);
    }
  }

  let index = -1;

  return (
    <Dialog
      open={open}
      onClose={closePalette}
      label="Command palette"
      className="max-w-xl"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search pages and actions…"
          aria-label="Search pages and actions"
          className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
        <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ESC
        </kbd>
      </div>

      <div className="max-h-[22rem] overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-sm font-medium">No results found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try searching for “apps”, “settings” or “theme”.
            </p>
          </div>
        ) : (
          (["Pages", "Actions"] as const).map((group) => {
            const groupItems = items.filter((item) => item.group === group);
            if (!groupItems.length) return null;

            return (
              <div key={group} className="mb-1">
                <p className="px-2.5 pt-2 pb-1.5 text-[9px] font-semibold tracking-[0.16em] text-muted-foreground/70 uppercase">
                  {group}
                </p>
                <ul>
                  {groupItems.map((item) => {
                    index += 1;
                    const itemIndex = index;
                    const isActive = itemIndex === active;

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => select(item)}
                          onMouseEnter={() => setActive(itemIndex)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                            isActive ? "bg-accent" : "hover:bg-accent/50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card",
                              isActive
                                ? "text-violet-600 dark:text-violet-300"
                                : "text-muted-foreground",
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium">
                              {item.label}
                            </span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {item.hint}
                            </span>
                          </span>
                          {isActive ? (
                            <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <kbd className="flex items-center gap-0.5 rounded border border-border bg-muted/50 px-1 py-0.5">
            <ArrowUp className="size-2.5" />
            <ArrowDown className="size-2.5" />
          </kbd>
          navigate
          <kbd className="ml-2 flex items-center rounded border border-border bg-muted/50 px-1 py-0.5">
            <CornerDownLeft className="size-2.5" />
          </kbd>
          open
        </span>
        <span>
          {items.length} result{items.length === 1 ? "" : "s"}
        </span>
      </div>
    </Dialog>
  );
}
