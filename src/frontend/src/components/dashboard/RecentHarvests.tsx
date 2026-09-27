import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { formatKg, formatShortDate } from "@/lib/format";
import { productLabel } from "@/lib/products";
import type { Harvest } from "@/types";
import { Link } from "@tanstack/react-router";
import { ClipboardList, Plus } from "lucide-react";

interface RecentHarvestsProps {
  harvests: Harvest[];
}

/** Latest harvest entries as a compact ledger list with a link to the full log. */
export function RecentHarvests({ harvests }: RecentHarvestsProps) {
  return (
    <section data-ocid="dashboard.recent_harvests" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold text-foreground">
          මෑත අස්වැන්න
        </h2>
        <Link
          to="/harvest"
          data-ocid="dashboard.recent_harvests.view_all_link"
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          සියල්ල බලන්න
        </Link>
      </div>

      {harvests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-6" aria-hidden="true" />}
          title="තවම අස්වැන්න වාර්තා නැත"
          description="පළමු අස්වැන්න වාර්තාව ඇතුළත් කිරීමෙන් ආරම්භ කරන්න."
          action={
            <Button
              asChild
              type="button"
              data-ocid="dashboard.recent_harvests.add_button"
            >
              <Link to="/harvest/new">
                <Plus className="size-4" aria-hidden="true" />
                අස්වැන්න ඇතුළත් කරන්න
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
          {harvests.map((harvest, index) => (
            <li
              key={String(harvest.id)}
              data-ocid={`dashboard.recent_harvests.item.${index + 1}`}
              className="flex min-h-[3.5rem] items-center gap-3 px-4 py-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                {formatShortDate(harvest.date)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {harvest.farmerName || "—"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {productLabel(harvest.product)} · {formatKg(harvest.kg)} kg
                </p>
              </div>
              <span className="shrink-0 font-display text-sm font-bold tabular-nums text-foreground">
                {formatKg(harvest.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
