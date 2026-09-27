import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ClipboardList, FileBarChart, Sprout, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickAction {
  to: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  adminOnly: boolean;
  primary: boolean;
}

const ACTIONS: QuickAction[] = [
  {
    to: "/farmers",
    label: "ගොවීන්",
    hint: "ගොවි ලේඛනය",
    icon: Sprout,
    adminOnly: false,
    primary: true,
  },
  {
    to: "/harvest",
    label: "අස්වැන්න",
    hint: "අස්වැන්න ඇතුළත් කරන්න",
    icon: ClipboardList,
    adminOnly: false,
    primary: false,
  },
  {
    to: "/prices",
    label: "මිල ලැයිස්තුව",
    hint: "නිෂ්පාදන මිල",
    icon: Tags,
    adminOnly: true,
    primary: false,
  },
  {
    to: "/reports",
    label: "වාර්තා",
    hint: "දෛනික හා මාසික",
    icon: FileBarChart,
    adminOnly: false,
    primary: false,
  },
];

/** 2x2 grid of large, field-friendly navigation actions filtered by role. */
export function QuickActions() {
  const { isAdmin } = useSession();
  const visible = ACTIONS.filter((action) => isAdmin || !action.adminOnly);

  return (
    <section data-ocid="dashboard.quick_actions" className="space-y-3">
      <h2 className="font-display text-base font-bold text-foreground">
        ඉක්මන් ක්‍රියා
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              data-ocid={`dashboard.quick_action.${action.to.replace("/", "")}`}
              className={cn(
                "flex min-h-[5.5rem] flex-col justify-between gap-2 rounded-lg border p-4 transition-smooth active:scale-[0.98]",
                action.primary
                  ? "gradient-primary border-transparent text-primary-foreground shadow-harvest hover:brightness-105"
                  : "border-border bg-card text-foreground shadow-subtle hover:border-primary/40 hover:bg-secondary/50",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  action.primary
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "bg-secondary text-primary",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-base font-bold leading-tight">
                  {action.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-xs",
                    action.primary
                      ? "text-primary-foreground/85"
                      : "text-muted-foreground",
                  )}
                >
                  {action.hint}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
