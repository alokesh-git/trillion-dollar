import {
  AppWindow,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Bug,
  Calendar,
  Cloud,
  CreditCard,
  Database,
  FileSpreadsheet,
  GitBranch,
  KeyRound,
  KanbanSquare,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MessageSquare,
  Rocket,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Triangle,
  UserPlus,
  Users,
  Webhook,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const icons = {
  "app-window": AppWindow,
  "bar-chart": BarChart3,
  bell: Bell,
  "book-open": BookOpen,
  boxes: Boxes,
  bug: Bug,
  calendar: Calendar,
  cloud: Cloud,
  "credit-card": CreditCard,
  database: Database,
  "file-spreadsheet": FileSpreadsheet,
  github: GitBranch,
  kanban: KanbanSquare,
  "key-round": KeyRound,
  "layout-dashboard": LayoutGrid,
  "layout-grid": LayoutGrid,
  mail: Mail,
  "message-square": MessageSquare,
  rocket: Rocket,
  shield: Shield,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  "trending-down": TrendingDown,
  triangle: Triangle,
  "user-plus": UserPlus,
  users: Users,
  webhook: Webhook,
  workflow: Workflow,
  wrench: Wrench,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Component = icons[name] ?? Boxes;
  return <Component className={className} />;
}
