import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { HarvestForm } from "@/components/harvest/HarvestForm";
import { harvestErrorMessage } from "@/components/harvest/HarvestForm";
import { HarvestList } from "@/components/harvest/HarvestList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteHarvest,
  useFarmers,
  useHarvests,
  usePrices,
  useUpdateHarvest,
} from "@/hooks/useQueries";
import { useSession } from "@/hooks/useSession";
import { errorMessage } from "@/lib/sinhala";
import type { Harvest, HarvestInput } from "@/types";
import { Link } from "@tanstack/react-router";
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";

/** Harvest records ledger with admin edit / delete and officer add-only access. */
export function HarvestPage() {
  const { isAdmin } = useSession();
  const [editing, setEditing] = useState<Harvest | null>(null);
  const [deleting, setDeleting] = useState<Harvest | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const harvestsQuery = useHarvests();
  const farmersQuery = useFarmers();
  const pricesQuery = usePrices();
  const updateHarvest = useUpdateHarvest();
  const deleteHarvest = useDeleteHarvest();

  const harvests = harvestsQuery.data ?? [];
  const farmers = farmersQuery.data ?? [];
  const prices = pricesQuery.data ?? [];

  function handleUpdate(input: HarvestInput) {
    if (!editing) return;
    setFormError(null);
    updateHarvest.mutate(
      { id: editing.id, input },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setFormError(harvestErrorMessage(result.err));
            return;
          }
          setEditing(null);
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  }

  function handleDelete() {
    if (!deleting) return;
    setDeleteError(null);
    deleteHarvest.mutate(deleting.id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setDeleteError(harvestErrorMessage(result.err));
          return;
        }
        setDeleting(null);
      },
      onError: (error) => setDeleteError(errorMessage(error)),
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="අස්වැන්න වාර්තා"
        subtitle="සියලු අස්වැන්න ඇතුළත් කිරීම්"
        action={
          <Button asChild type="button" className="text-base">
            <Link to="/harvest/new" data-ocid="harvest.add_button">
              <Plus className="size-5" aria-hidden="true" />
              නව එකතුවක්
            </Link>
          </Button>
        }
      />

      {harvestsQuery.isLoading ? (
        <LoadingState rows={5} />
      ) : harvestsQuery.isError ? (
        <ErrorState
          message={errorMessage(harvestsQuery.error)}
          onRetry={() => void harvestsQuery.refetch()}
        />
      ) : harvests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-7" aria-hidden="true" />}
          title="තවම අස්වැන්න වාර්තා නොමැත"
          description="පළමු අස්වැන්න ඇතුළත් කිරීමෙන් ලේඛනය ආරම්භ කරන්න."
          action={
            <Button asChild type="button" className="text-base">
              <Link to="/harvest/new" data-ocid="harvest.empty_add_button">
                <Plus className="size-5" aria-hidden="true" />
                අස්වැන්න ඇතුළත් කරන්න
              </Link>
            </Button>
          }
        />
      ) : (
        <HarvestList
          harvests={harvests}
          canManage={isAdmin}
          onEdit={(harvest) => {
            setFormError(null);
            setEditing(harvest);
          }}
          onDelete={(harvest) => {
            setDeleteError(null);
            setDeleting(harvest);
          }}
        />
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent
          data-ocid="harvest.edit_dialog"
          className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>අස්වැන්න සංස්කරණය</DialogTitle>
            <DialogDescription>
              මිල වෙනස් කිරීම මෙම වාර්තාවට පමණක් බලපායි.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <HarvestForm
              farmers={farmers}
              prices={prices}
              harvest={editing}
              onSubmit={handleUpdate}
              isPending={updateHarvest.isPending}
              error={formError}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent
          data-ocid="harvest.delete_dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>අස්වැන්න මකන්නද?</DialogTitle>
            <DialogDescription>
              මෙම ක්‍රියාව අහෝසි කළ නොහැක. වාර්තාව ස්ථිරවම ඉවත් වේ.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p
              role="alert"
              data-ocid="harvest.delete_error"
              className="text-sm text-destructive"
            >
              {deleteError}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteHarvest.isPending}
              data-ocid="harvest.confirm_delete_button"
              className="w-full text-base sm:flex-1"
            >
              {deleteHarvest.isPending ? "මකමින්…" : "ඔව්, මකන්න"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={deleteHarvest.isPending}
              data-ocid="harvest.cancel_delete_button"
              className="w-full text-base sm:flex-1"
            >
              අවලංගු කරන්න
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
