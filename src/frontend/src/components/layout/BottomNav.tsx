import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Sprout,
  Tags,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavTab {
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
}

const TABS: NavTab[] = [
  {
    to: "/dashboard",
    label: "මුල් පිටුව",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  { to: "/farmers", label: "ගොවීන්", icon: Sprout, adminOnly: false },
  { to: "/harvest", label: "අස්වැන්න", icon: ClipboardList, adminOnly: false },
  { to: "/reports", label: "වාර්තා", icon: FileBarChart, adminOnly: false },
  { to: "/prices", label: "මිල ලැයිස්තුව", icon: Tags, adminOnly: true },
  { to: "/officers", label: "නිලධාරීන්", icon: Users, adminOnly: true },
];

/** Bottom tab bar with large tap targets, filtered by the signed-in role. */
export function BottomNav() {
  const { isAdmin } = useSession();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const visibleTabs = TABS.filter((tab) => isAdmin || !tab.adminOnly);

  return (
    <nav
      data-ocid="nav.bottom"
      aria-label="ප්‍රධාන මෙනුව"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-floating"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {visibleTabs.map((tab) => {
          const isActive =
            pathname === tab.to || pathname.startsWith(`${tab.to}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                data-ocid={`nav.${tab.to.replace("/", "")}.link`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.7rem] font-semibold transition-smooth",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="leading-tight">{tab.label}</span>
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 top-0 h-[3px] rounded-full bg-accent"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
