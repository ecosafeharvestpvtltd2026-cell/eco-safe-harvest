import { createActor } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { OfficerForm } from "@/components/officers/OfficerForm";
import { OfficerList } from "@/components/officers/OfficerList";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatKg } from "@/lib/format";
import { productLabel } from "@/lib/products";
import { AUTH_ERROR_MESSAGES, errorMessage } from "@/lib/sinhala";
import type { Harvest, Session } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Admin-only officer management plus a view of every harvest record. */
export function OfficersPage() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<bigint | null>(null);

  const officersQuery = useQuery({
    queryKey: ["officers"],
    queryFn: async (): Promise<Session[]> => {
      if (!actor) return [];
      return api.listOfficers(actor);
    },
    enabled: !!actor && !isFetching,
  });

  const harvestsQuery = useQuery({
    queryKey: ["harvests"],
    queryFn: async (): Promise<Harvest[]> => {
      if (!actor) return [];
      return api.listHarvests(actor);
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      username: string;
      password: string;
      displayName: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await api.createOfficer(
        actor,
        input.username,
        input.password,
        input.displayName,
      );
      if (result.__kind__ === "err") {
        throw new Error(AUTH_ERROR_MESSAGES[result.err]);
      }
      return result.ok;
    },
    onSuccess: () => {
      toast.success("නව නිලධාරී ගිණුම සාර්ථකව සාදන ලදී");
      void queryClient.invalidateQueries({ queryKey: ["officers"] });
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { id: bigint; displayName: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await api.updateOfficer(
        actor,
        input.id,
        input.displayName,
      );
      if (result.__kind__ === "err") {
        throw new Error(AUTH_ERROR_MESSAGES[result.err]);
      }
      return result.ok;
    },
    onSuccess: () => {
      toast.success("නිලධාරී නම යාවත්කාලීන කරන ලදී");
      void queryClient.invalidateQueries({ queryKey: ["officers"] });
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error));
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (input: { id: bigint; password: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await api.resetOfficerPassword(
        actor,
        input.id,
        input.password,
      );
      if (result.__kind__ === "err") {
        throw new Error(AUTH_ERROR_MESSAGES[result.err]);
      }
      return result.ok;
    },
    onSuccess: () => {
      toast.success("මුරපදය යළි සකසන ලදී");
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error));
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const officers = officersQuery.data ?? [];
  const harvests = harvestsQuery.data ?? [];

  const recordCounts: Record<string, number> = {};
  for (const harvest of harvests) {
    const key = String(harvest.officerId);
    recordCounts[key] = (recordCounts[key] ?? 0) + 1;
  }

  const isUpdating = updateMutation.isPending || passwordMutation.isPending;

  function handleRename(id: bigint, displayName: string) {
    setUpdatingId(id);
    updateMutation.mutate({ id, displayName });
  }

  function handleResetPassword(id: bigint, password: string) {
    setUpdatingId(id);
    passwordMutation.mutate({ id, password });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="නිලධාරීන්" subtitle="නිලධාරී ගිණුම් හා ඔවුන්ගේ වාර්තා" />

      <OfficerForm
        isSubmitting={createMutation.isPending}
        onSubmit={(input) => createMutation.mutate(input)}
      />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Users className="size-5 text-primary" aria-hidden="true" />
          නිලධාරී ලැයිස්තුව
        </h2>
        {officersQuery.isLoading ? (
          <LoadingState rows={3} />
        ) : officersQuery.isError ? (
          <ErrorState
            message={errorMessage(officersQuery.error)}
            onRetry={() => void officersQuery.refetch()}
          />
        ) : officers.length === 0 ? (
          <EmptyState
            icon={<Users className="size-6" aria-hidden="true" />}
            title="නිලධාරීන් නොමැත"
            description="ඉහත පෝරමය භාවිතයෙන් පළමු නිලධාරී ගිණුම සාදන්න."
          />
        ) : (
          <OfficerList
            officers={officers}
            recordCounts={recordCounts}
            isUpdating={isUpdating}
            updatingId={updatingId}
            onRename={handleRename}
            onResetPassword={handleResetPassword}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <ClipboardList className="size-5 text-primary" aria-hidden="true" />
          සියලු අස්වැන්න වාර්තා
        </h2>
        {harvestsQuery.isLoading ? (
          <LoadingState rows={4} />
        ) : harvestsQuery.isError ? (
          <ErrorState
            message={errorMessage(harvestsQuery.error)}
            onRetry={() => void harvestsQuery.refetch()}
          />
        ) : harvests.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-6" aria-hidden="true" />}
            title="වාර්තා නොමැත"
            description="තවම කිසිදු අස්වැන්න වාර්තාවක් ඇතුළත් කර නොමැත."
          />
        ) : (
          <ul
            data-ocid="officers.harvest_list"
            className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
          >
            {harvests.map((harvest) => (
              <li
                key={String(harvest.id)}
                data-ocid="officers.harvest_item"
                className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {harvest.farmerName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {productLabel(harvest.product)} · {formatDate(harvest.date)}{" "}
                    · {harvest.officerName}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-bold text-primary">
                    {formatCurrency(harvest.total)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatKg(harvest.kg)} kg
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void officersQuery.refetch();
          void harvestsQuery.refetch();
        }}
        disabled={officersQuery.isFetching || harvestsQuery.isFetching}
        data-ocid="officers.refresh_button"
        className="w-full"
      >
        නැවත පූරණය කරන්න
      </Button>
    </div>
  );
}
