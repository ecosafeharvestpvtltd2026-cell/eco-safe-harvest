import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { HarvestForm } from "@/components/harvest/HarvestForm";
import { harvestErrorMessage } from "@/components/harvest/HarvestForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAddHarvest, useFarmers, usePrices } from "@/hooks/useQueries";
import { errorMessage } from "@/lib/sinhala";
import type { HarvestInput } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, Plus, Sprout } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Dedicated harvest entry screen with auto-fill and live total. */
export function HarvestEntryPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const farmersQuery = useFarmers();
  const pricesQuery = usePrices();
  const addHarvest = useAddHarvest();
  const navigate = useNavigate();

  const farmers = farmersQuery.data ?? [];
  const prices = pricesQuery.data ?? [];
  const isLoading = farmersQuery.isLoading || pricesQuery.isLoading;
  const isError = farmersQuery.isError || pricesQuery.isError;

  function handleSubmit(input: HarvestInput) {
    setFormError(null);
    addHarvest.mutate(input, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setFormError(harvestErrorMessage(result.err));
          return;
        }
        toast.success("අස්වැන්න වාර්තාව සාර්ථකව සුරකින ලදී");
        // Remount the form so every field resets and a second tap cannot
        // resubmit the same record.
        setFormKey((key) => key + 1);
        void navigate({ to: "/harvest" });
      },
      onError: (error) => setFormError(errorMessage(error)),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button
          asChild
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          <Link to="/harvest" data-ocid="harvest_entry.back_button">
            <ArrowLeft className="size-4" aria-hidden="true" />
            අස්වැන්න වාර්තා
          </Link>
        </Button>
      </div>

      <PageHeader title="අස්වැන්න ඇතුළත් කිරීම" subtitle="නව අස්වැන්න වාර්තාවක්" />

      {isLoading ? (
        <LoadingState rows={4} />
      ) : isError ? (
        <ErrorState
          message={errorMessage(farmersQuery.error ?? pricesQuery.error)}
          onRetry={() => {
            void farmersQuery.refetch();
            void pricesQuery.refetch();
          }}
        />
      ) : farmers.length === 0 ? (
        <EmptyState
          icon={<Sprout className="size-7" aria-hidden="true" />}
          title="ගොවීන් නොමැත"
          description="අස්වැන්නක් ඇතුළත් කිරීමට පෙර අවම වශයෙන් එක් ගොවියෙක් ලියාපදිංචි කරන්න."
          action={
            <Button asChild type="button" className="text-base">
              <Link to="/farmers" data-ocid="harvest_entry.add_farmer_button">
                <Plus className="size-5" aria-hidden="true" />
                ගොවියෙක් එක් කරන්න
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div
            data-ocid="harvest_entry.hint"
            className="flex items-start gap-2 rounded-lg border border-border bg-secondary/60 px-3.5 py-3 text-sm text-secondary-foreground"
          >
            <ClipboardList
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              ගොවි කේතය තේරීමෙන් නම ස්වයංක්‍රීයව පිරවේ. අස්වැන්න වර්ගය තේරීමෙන් වර්තමාන මිල පිරවේ
              — එය අවශ්‍ය නම් වෙනස් කළ හැක.
            </p>
          </div>
          <HarvestForm
            key={formKey}
            farmers={farmers}
            prices={prices}
            onSubmit={handleSubmit}
            isPending={addHarvest.isPending}
            error={formError}
          />
        </>
      )}
    </div>
  );
}
