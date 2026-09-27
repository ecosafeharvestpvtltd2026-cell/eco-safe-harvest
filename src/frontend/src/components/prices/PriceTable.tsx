import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatTimestamp } from "@/lib/format";
import { PRODUCT_ORDER, productLabel } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { PriceEntry, Product } from "@/types";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useState } from "react";

interface PriceTableProps {
  prices: PriceEntry[];
  isSaving: boolean;
  savingProduct: Product | null;
  onSave: (product: Product, pricePerKg: bigint) => void;
}

interface PriceRowProps {
  entry: PriceEntry;
  isSaving: boolean;
  savingProduct: Product | null;
  onSave: (product: Product, pricePerKg: bigint) => void;
}

/** One editable price row: tap the pencil, type a new rate, confirm. */
function PriceRow({ entry, isSaving, savingProduct, onSave }: PriceRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const isRowSaving = isSaving && savingProduct === entry.product;
  const parsed = Number(draft);
  const isValid =
    draft.trim().length > 0 && Number.isFinite(parsed) && parsed > 0;

  function startEditing() {
    setDraft(String(entry.pricePerKg));
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setDraft("");
  }

  function confirm() {
    if (!isValid) return;
    const next = BigInt(Math.round(parsed));
    onSave(entry.product, next);
    setIsEditing(false);
    setDraft("");
  }

  return (
    <li
      data-ocid="prices.item"
      className={cn(
        "flex flex-col gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        isEditing && "bg-secondary/40",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-foreground">
          {productLabel(entry.product)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          යාවත්කාලීනය: {formatTimestamp(entry.updatedAt)}
        </p>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-40 sm:flex-none">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
              රු.
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label={`${productLabel(entry.product)} නව මිල`}
              data-ocid="prices.input"
              className="pl-11 text-right font-mono text-base"
            />
          </div>
          <Button
            type="button"
            size="icon"
            onClick={confirm}
            disabled={!isValid || isRowSaving}
            aria-label="මිල සුරකින්න"
            data-ocid="prices.save_button"
          >
            {isRowSaving ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-5" aria-hidden="true" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={cancelEditing}
            disabled={isRowSaving}
            aria-label="අවලංගු කරන්න"
            data-ocid="prices.cancel_button"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="font-mono text-lg font-bold text-primary">
            {formatCurrency(entry.pricePerKg)}
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              කිලෝවකට
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={startEditing}
            disabled={isSaving}
            data-ocid="prices.edit_button"
            className="shrink-0"
          >
            <Pencil className="size-4" aria-hidden="true" />
            වෙනස් කරන්න
          </Button>
        </div>
      )}
    </li>
  );
}

/** Editable per-kilogram price list for every harvest product. */
export function PriceTable({
  prices,
  isSaving,
  savingProduct,
  onSave,
}: PriceTableProps) {
  const ordered = PRODUCT_ORDER.map((product) =>
    prices.find((entry) => entry.product === product),
  ).filter((entry): entry is PriceEntry => Boolean(entry));

  return (
    <ul
      data-ocid="prices.list"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
    >
      {ordered.map((entry) => (
        <PriceRow
          key={entry.product}
          entry={entry}
          isSaving={isSaving}
          savingProduct={savingProduct}
          onSave={onSave}
        />
      ))}
    </ul>
  );
}
