import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatKg } from "@/lib/format";
import { productLabel } from "@/lib/products";
import type { Harvest } from "@/types";
import { Pencil, Trash2, User } from "lucide-react";

interface HarvestListProps {
  harvests: Harvest[];
  /** Admin-only edit / delete affordances. */
  canManage: boolean;
  onEdit: (harvest: Harvest) => void;
  onDelete: (harvest: Harvest) => void;
}

/** Harvest ledger rows: date, farmer, product, kg and total. */
export function HarvestList({
  harvests,
  canManage,
  onEdit,
  onDelete,
}: HarvestListProps) {
  return (
    <ul data-ocid="harvest.list" className="space-y-2.5">
      {harvests.map((harvest, index) => (
        <li
          key={harvest.id.toString()}
          data-ocid={`harvest.item.${index + 1}`}
          className="rounded-lg border border-border bg-card p-3.5 shadow-subtle"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {formatDate(harvest.date)}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground">
                <User
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="truncate">
                  {harvest.farmerCode} — {harvest.farmerName}
                </span>
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
              {productLabel(harvest.product)}
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              <p>
                {formatKg(harvest.kg)} kg × {formatCurrency(harvest.pricePerKg)}
                /kg
              </p>
              <p className="mt-0.5">නිලධාරී: {harvest.officerName}</p>
            </div>
            <span className="font-mono text-lg font-bold text-primary">
              {formatCurrency(harvest.total)}
            </span>
          </div>

          {canManage ? (
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(harvest)}
                data-ocid={`harvest.edit_button.${index + 1}`}
                className="flex-1"
              >
                <Pencil className="size-4" aria-hidden="true" />
                සංස්කරණය
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDelete(harvest)}
                data-ocid={`harvest.delete_button.${index + 1}`}
                className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                මකන්න
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
