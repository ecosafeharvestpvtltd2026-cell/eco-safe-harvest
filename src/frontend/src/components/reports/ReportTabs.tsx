import { cn } from "@/lib/utils";
import { ReportKind } from "@/types";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Package,
  Sprout,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ReportTab {
  kind: ReportKind;
  label: string;
  icon: LucideIcon;
}

/** The six report kinds, in the order they appear as tabs. */
export const REPORT_TABS: ReportTab[] = [
  { kind: ReportKind.daily, label: "දෛනික වාර්තාව", icon: CalendarDays },
  { kind: ReportKind.weekly, label: "සතිපතා වාර්තාව", icon: CalendarRange },
  { kind: ReportKind.monthly, label: "මාසික වාර්තාව", icon: CalendarClock },
  { kind: ReportKind.byFarmer, label: "ගොවියා අනුව", icon: Sprout },
  { kind: ReportKind.byProduct, label: "අස්වැන්න වර්ගය අනුව", icon: Package },
  { kind: ReportKind.byOfficer, label: "නිලධාරියා අනුව", icon: UserCheck },
];

interface ReportTabsProps {
  active: ReportKind;
  onChange: (kind: ReportKind) => void;
}

/** Horizontally scrollable Sinhala report-kind selector. */
export function ReportTabs({ active, onChange }: ReportTabsProps) {
  return (
    <div
      data-ocid="reports.tabs"
      role="tablist"
      aria-label="වාර්තා වර්ග"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {REPORT_TABS.map((tab) => {
        const isActive = tab.kind === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.kind}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.kind)}
            data-ocid={`reports.tab.${tab.kind}`}
            className={cn(
              "flex min-h-[2.75rem] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-smooth active:scale-[0.98]",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
