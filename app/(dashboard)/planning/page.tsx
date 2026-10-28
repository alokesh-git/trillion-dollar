import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanningView } from "@/components/planning/planning-view";

export const metadata: Metadata = {
  title: "Planning",
};

function PlanningFallback() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function PlanningPage() {
  return (
    <Suspense fallback={<PlanningFallback />}>
      <PlanningView />
    </Suspense>
  );
}
