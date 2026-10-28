import type { Metadata } from "next";
import { AppsView } from "@/components/apps/apps-view";

export const metadata: Metadata = {
  title: "Apps",
};

export default function AppsPage() {
  return <AppsView />;
}
