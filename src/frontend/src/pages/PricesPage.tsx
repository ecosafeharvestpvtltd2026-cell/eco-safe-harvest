import { createActor } from "@/backend";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { PriceTable } from "@/components/prices/PriceTable";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { PRICE_ERROR_MESSAGES, errorMessage } from "@/lib/sinhala";
import type { PriceEntry, Product } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Tags } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Admin-only price list: edit the current rate per kilogram for each product. */
export function PricesPage() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [savingProduct, setSavingProduct] = useState<Product | null>(null);

  const pricesQuery = useQuery({
    queryKey: ["prices"],
    queryFn: async (): Promise<PriceEntry[]> => {
      if (!actor) return [];
      return api.listPrices(actor);
    },
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: { product: Product; pricePerKg: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await api.setPrice(actor, input.product, input.pricePerKg);
      if (result.__kind__ === "err") {
        throw new Error(PRICE_ERROR_MESSAGES[result.err]);
      }
      return result.ok;
    },
    onSuccess: () => {
      toast.success("මිල යාවත්කාලීන කරන ලදී");
      void queryClient.invalidateQueries({ queryKey: ["prices"] });
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error));
    },
    onSettled: () => {
      setSavingProduct(null);
    },
  });

  function handleSave(product: Product, pricePerKg: bigint) {
    setSavingProduct(product);
    saveMutation.mutate({ product, pricePerKg });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="මිල ලැයිස්තුව" subtitle="නිෂ්පාදනයකට කිලෝග්‍රෑමයක වර්තමාන මිල" />

      <div
        data-ocid="prices.notice"
        className="flex items-start gap-2.5 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-3 text-sm text-foreground"
      >
        <Info
          className="mt-0.5 size-4 shrink-0 text-accent-foreground"
          aria-hidden="true"
        />
        <p>
          නව මිලක් සුරැකීමෙන් ලැබෙන්නේ වර්තමාන මිල පමණි. දැනට සටහන් කර ඇති අස්වැන්න වාර්තාවල මිල
          නොවෙනස්ව පවතී.
        </p>
      </div>

      {pricesQuery.isLoading ? (
        <LoadingState rows={5} />
      ) : pricesQuery.isError ? (
        <ErrorState
          message={errorMessage(pricesQuery.error)}
          onRetry={() => void pricesQuery.refetch()}
        />
      ) : (
        <PriceTable
          prices={pricesQuery.data ?? []}
          isSaving={saveMutation.isPending}
          savingProduct={savingProduct}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Tags className="size-4" aria-hidden="true" />
        <span>මිල වෙනස් කිරීම පරිපාලකයාට පමණි</span>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => void pricesQuery.refetch()}
        disabled={pricesQuery.isFetching}
        data-ocid="prices.refresh_button"
        className="w-full"
      >
        නැවත පූරණය කරන්න
      </Button>
    </div>
  );
}
