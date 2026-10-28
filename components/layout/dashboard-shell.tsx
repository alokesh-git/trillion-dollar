"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <div className="flex min-h-screen flex-col">
        <Topbar onOpenCommand={() => setCommandOpen(true)} />

        <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 pb-6 text-[10px] text-muted-foreground sm:px-6 lg:px-8">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
          <span>trillion Dollar · SaaS Console</span>
        </footer>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
