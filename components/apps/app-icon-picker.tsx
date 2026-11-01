"use client";

import type { IconName } from "@/components/icon";
import { AppIcon } from "@/components/app-icon";
import type { Tone } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Input, Label } from "@/components/ui/input";

export const appIconOptions: { value: IconName; label: string }[] = [
  { value: "app-window", label: "App" },
  { value: "layout-dashboard", label: "Dashboard" },
  { value: "rocket", label: "Rocket" },
  { value: "credit-card", label: "Billing" },
  { value: "book-open", label: "Docs" },
  { value: "webhook", label: "Webhook" },
  { value: "shield", label: "Security" },
  { value: "database", label: "Database" },
  { value: "boxes", label: "Service" },
  { value: "workflow", label: "Workflow" },
  { value: "mail", label: "Email" },
  { value: "sparkles", label: "AI" },
];

export const appToneOptions: { value: Tone; label: string; swatch: string }[] = [
  { value: "violet", label: "Violet", swatch: "bg-violet-500" },
  { value: "sky", label: "Sky", swatch: "bg-sky-500" },
  { value: "emerald", label: "Emerald", swatch: "bg-emerald-500" },
  { value: "amber", label: "Amber", swatch: "bg-amber-500" },
  { value: "rose", label: "Rose", swatch: "bg-rose-500" },
  { value: "fuchsia", label: "Fuchsia", swatch: "bg-fuchsia-500" },
  { value: "indigo", label: "Indigo", swatch: "bg-indigo-500" },
  { value: "cyan", label: "Cyan", swatch: "bg-cyan-500" },
];

export function isIconName(value: string): value is IconName {
  return appIconOptions.some((option) => option.value === value);
}

export function isTone(value: string): value is Tone {
  return appToneOptions.some((option) => option.value === value);
}

export function AppIconPicker({
  icon,
  tone,
  iconUrl,
  onIconChange,
  onToneChange,
  onIconUrlChange,
}: {
  icon: IconName;
  tone: Tone;
  iconUrl: string;
  onIconChange: (icon: IconName) => void;
  onToneChange: (tone: Tone) => void;
  onIconUrlChange: (url: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-muted/15 p-4">
      <div className="flex items-start gap-3">
        <AppIcon
          name={icon}
          tone={tone}
          imageUrl={iconUrl}
          className="size-12 shrink-0"
          iconClassName="size-6"
        />
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-foreground">App icon</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Pick a glyph and accent, or paste a favicon / logo URL to override the
            preview everywhere this app appears.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Glyph</Label>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-6">
          {appIconOptions.map((option) => {
            const selected = option.value === icon;
            return (
              <button
                key={option.value}
                type="button"
                title={option.label}
                aria-label={option.label}
                aria-pressed={selected}
                onClick={() => onIconChange(option.value)}
                className={cn(
                  "flex items-center justify-center rounded-lg border p-2 transition-colors",
                  selected
                    ? "border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/30"
                    : "border-transparent bg-muted/40 hover:border-border hover:bg-muted/60",
                )}
              >
                <AppIcon
                  name={option.value}
                  tone={tone}
                  className="size-8"
                  iconClassName="size-3.5"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Accent</Label>
        <div className="flex flex-wrap gap-2">
          {appToneOptions.map((option) => {
            const selected = option.value === tone;
            return (
              <button
                key={option.value}
                type="button"
                title={option.label}
                aria-label={option.label}
                aria-pressed={selected}
                onClick={() => onToneChange(option.value)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-shadow",
                  option.swatch,
                  selected ? "ring-foreground/40" : "ring-transparent opacity-80 hover:opacity-100",
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="app-icon-url">Custom favicon URL (optional)</Label>
        <Input
          id="app-icon-url"
          name="iconUrl"
          value={iconUrl}
          onChange={(event) => onIconUrlChange(event.target.value)}
          placeholder="https://…/favicon.ico or logo PNG"
          autoComplete="off"
          inputMode="url"
        />
      </div>

      <input type="hidden" name="icon" value={icon} />
      <input type="hidden" name="tone" value={tone} />
    </div>
  );
}
