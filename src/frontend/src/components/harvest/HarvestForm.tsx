import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, todayDateText } from "@/lib/format";
import { PRODUCT_LABELS, PRODUCT_ORDER } from "@/lib/products";
import { HARVEST_ERROR_MESSAGES } from "@/lib/sinhala";
import type {
  Farmer,
  Harvest,
  HarvestInput,
  PriceEntry,
  Product,
} from "@/types";
import { AlertCircle, Calculator, Loader2, Save } from "lucide-react";
import { useMemo, useState } from "react";

interface HarvestFormProps {
  farmers: Farmer[];
  prices: PriceEntry[];
  /** Existing record when editing; omitted when adding. */
  harvest?: Harvest;
  onSubmit: (input: HarvestInput) => void;
  isPending: boolean;
  error: string | null;
  onCancel?: () => void;
}

function priceFor(prices: PriceEntry[], product: Product): bigint {
  return prices.find((entry) => entry.product === product)?.pricePerKg ?? 0n;
}

/** Harvest entry form with auto-filled farmer name, price and live total. */
export function HarvestForm({
  farmers,
  prices,
  harvest,
  onSubmit,
  isPending,
  error,
  onCancel,
}: HarvestFormProps) {
  const [date, setDate] = useState(harvest?.date ?? todayDateText());
  const [farmerId, setFarmerId] = useState<string>(
    harvest ? harvest.farmerId.toString() : "",
  );
  const [product, setProduct] = useState<Product | "">(
    harvest ? harvest.product : "",
  );
  const [kg, setKg] = useState(harvest ? harvest.kg.toString() : "");
  const [price, setPrice] = useState(
    harvest ? harvest.pricePerKg.toString() : "",
  );
  const [touched, setTouched] = useState(false);

  const selectedFarmer = useMemo(
    () => farmers.find((farmer) => farmer.id.toString() === farmerId) ?? null,
    [farmers, farmerId],
  );

  const kgValue = Number.parseFloat(kg);
  const priceValue = Number.parseFloat(price);
  const total =
    Number.isFinite(kgValue) && Number.isFinite(priceValue)
      ? Math.round(kgValue * priceValue)
      : 0;

  const dateMissing = date.trim().length === 0;
  const farmerMissing = farmerId.length === 0;
  const productMissing = product === "";
  const kgMissing = !Number.isFinite(kgValue) || kgValue <= 0;
  const priceMissing = !Number.isFinite(priceValue) || priceValue < 0;
  const canSubmit =
    !dateMissing &&
    !farmerMissing &&
    !productMissing &&
    !kgMissing &&
    !priceMissing &&
    !isPending;

  function handleFarmerChange(value: string) {
    setFarmerId(value);
  }

  function handleProductChange(value: string) {
    const next = value as Product;
    setProduct(next);
    setPrice(priceFor(prices, next).toString());
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({
      date: date.trim(),
      farmerId: BigInt(farmerId),
      product,
      kg: BigInt(Math.round(kgValue)),
      pricePerKg: BigInt(Math.round(priceValue)),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="harvest.form"
      className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-subtle"
    >
      <div className="space-y-2">
        <Label htmlFor="harvest-date">
          දිනය <span className="text-destructive">*</span>
        </Label>
        <Input
          id="harvest-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && dateMissing}
          data-ocid="harvest.date_input"
        />
        {touched && dateMissing ? (
          <p
            role="alert"
            data-ocid="harvest.date_error"
            className="text-sm text-destructive"
          >
            දිනය අවශ්‍යයි.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="harvest-farmer">
          ගොවි කේතය <span className="text-destructive">*</span>
        </Label>
        <Select value={farmerId} onValueChange={handleFarmerChange}>
          <SelectTrigger
            id="harvest-farmer"
            data-ocid="harvest.farmer_select"
            className="h-11 w-full"
            aria-invalid={touched && farmerMissing}
          >
            <SelectValue placeholder="ගොවියෙක් තෝරන්න" />
          </SelectTrigger>
          <SelectContent>
            {farmers.map((farmer) => (
              <SelectItem
                key={farmer.id.toString()}
                value={farmer.id.toString()}
              >
                {farmer.code} — {farmer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched && farmerMissing ? (
          <p
            role="alert"
            data-ocid="harvest.farmer_error"
            className="text-sm text-destructive"
          >
            ගොවියෙක් තෝරන්න.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="harvest-farmer-name">ගොවි නම</Label>
        <Input
          id="harvest-farmer-name"
          value={selectedFarmer?.name ?? ""}
          readOnly
          placeholder="ගොවි කේතය තේරීමෙන් ස්වයංක්‍රීයව පිරවේ"
          data-ocid="harvest.farmer_name_input"
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="harvest-product">
          අස්වැන්න වර්ගය <span className="text-destructive">*</span>
        </Label>
        <Select value={product} onValueChange={handleProductChange}>
          <SelectTrigger
            id="harvest-product"
            data-ocid="harvest.product_select"
            className="h-11 w-full"
            aria-invalid={touched && productMissing}
          >
            <SelectValue placeholder="අස්වැන්න වර්ගය තෝරන්න" />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_ORDER.map((item) => (
              <SelectItem key={item} value={item}>
                {PRODUCT_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched && productMissing ? (
          <p
            role="alert"
            data-ocid="harvest.product_error"
            className="text-sm text-destructive"
          >
            අස්වැන්න වර්ගය තෝරන්න.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="harvest-kg">
            කිලෝ ගණන <span className="text-destructive">*</span>
          </Label>
          <Input
            id="harvest-kg"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={kg}
            onChange={(event) => setKg(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="0"
            aria-invalid={touched && kgMissing}
            data-ocid="harvest.kg_input"
          />
          {touched && kgMissing ? (
            <p
              role="alert"
              data-ocid="harvest.kg_error"
              className="text-sm text-destructive"
            >
              වලංගු කිලෝ ගණනක් ඇතුළත් කරන්න.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="harvest-price">
            කිලෝවක මිල (රු.) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="harvest-price"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="0"
            aria-invalid={touched && priceMissing}
            data-ocid="harvest.price_input"
          />
          {touched && priceMissing ? (
            <p
              role="alert"
              data-ocid="harvest.price_error"
              className="text-sm text-destructive"
            >
              වලංගු මිලක් ඇතුළත් කරන්න.
            </p>
          ) : null}
        </div>
      </div>

      <div
        data-ocid="harvest.total_panel"
        className="flex items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3.5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calculator
            className="size-5 text-accent-foreground"
            aria-hidden="true"
          />
          මුළු මුදල
        </span>
        <span
          data-ocid="harvest.total_value"
          className="font-mono text-xl font-bold text-foreground"
        >
          {formatCurrency(total)}
        </span>
      </div>

      {error ? (
        <div
          role="alert"
          data-ocid="harvest.error_state"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="submit"
          disabled={!canSubmit}
          data-ocid="harvest.submit_button"
          className="w-full text-base sm:flex-1"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-5" aria-hidden="true" />
          )}
          {isPending ? "සුරකිමින්…" : "සුරකින්න"}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-ocid="harvest.cancel_button"
            className="w-full text-base sm:flex-1"
          >
            අවලංගු කරන්න
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** Map a backend harvest error variant to its Sinhala message. */
export function harvestErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "__kind__" in error) {
    const kind = (error as { __kind__: keyof typeof HARVEST_ERROR_MESSAGES })
      .__kind__;
    return HARVEST_ERROR_MESSAGES[kind] ?? "අස්වැන්න සුරැකීමට නොහැකි විය.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "අස්වැන්න සුරැකීමට නොහැකි විය.";
}
