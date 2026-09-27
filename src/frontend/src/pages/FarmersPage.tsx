import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { FarmerForm } from "@/components/farmers/FarmerForm";
import type { FarmerFormValues } from "@/components/farmers/FarmerForm";
import { farmerErrorMessage } from "@/components/farmers/FarmerForm";
import { FarmerList } from "@/components/farmers/FarmerList";
import { FarmerSearch } from "@/components/farmers/FarmerSearch";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddFarmer, useFarmerSearch, useFarmers } from "@/hooks/useQueries";
import { useSession } from "@/hooks/useSession";
import { errorMessage } from "@/lib/sinhala";
import { Plus, Sprout } from "lucide-react";
import { useState } from "react";

/** Farmer ledger: live search, list, and admin add-farmer dialog. */
export function FarmersPage() {
  const { isAdmin } = useSession();
  const [term, setTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const allFarmers = useFarmers();
  const searchResults = useFarmerSearch(term);
  const addFarmer = useAddFarmer();

  const isSearching = term.trim().length > 0;
  const activeQuery = isSearching ? searchResults : allFarmers;
  const farmers = activeQuery.data ?? [];

  function handleAdd(values: FarmerFormValues) {
    setFormError(null);
    addFarmer.mutate(values, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setFormError(farmerErrorMessage(result.err));
          return;
        }
        setIsAddOpen(false);
      },
      onError: (error) => setFormError(errorMessage(error)),
    });
  }

  function openAdd() {
    setFormError(null);
    setIsAddOpen(true);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="ගොවීන්"
        subtitle="ගොවි ලේඛනය හා සෙවුම"
        action={
          isAdmin ? (
            <Button
              type="button"
              onClick={openAdd}
              data-ocid="farmers.add_button"
              className="text-base"
            >
              <Plus className="size-5" aria-hidden="true" />
              නව ගොවියෙක්
            </Button>
          ) : null
        }
      />

      <FarmerSearch
        value={term}
        onChange={setTerm}
        resultCount={isSearching ? farmers.length : undefined}
      />

      {activeQuery.isLoading ? (
        <LoadingState rows={5} />
      ) : activeQuery.isError ? (
        <ErrorState
          message={errorMessage(activeQuery.error)}
          onRetry={() => void activeQuery.refetch()}
        />
      ) : farmers.length === 0 ? (
        <EmptyState
          icon={<Sprout className="size-7" aria-hidden="true" />}
          title={isSearching ? "ගොවීන් හමු නොවීය" : "තවම ගොවීන් නොමැත"}
          description={
            isSearching
              ? "වෙනත් කේතයක්, නමක්, දුරකථන අංකයක් හෝ ගමක් උත්සාහ කරන්න."
              : "පළමු ගොවියා එක් කිරීමෙන් ලේඛනය ආරම්භ කරන්න."
          }
          action={
            !isSearching && isAdmin ? (
              <Button
                type="button"
                onClick={openAdd}
                data-ocid="farmers.empty_add_button"
                className="text-base"
              >
                <Plus className="size-5" aria-hidden="true" />
                නව ගොවියෙක්
              </Button>
            ) : null
          }
        />
      ) : (
        <FarmerList farmers={farmers} />
      )}

      {isAdmin ? (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent
            data-ocid="farmers.add_dialog"
            className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
          >
            <DialogHeader>
              <DialogTitle>නව ගොවියෙක් එක් කරන්න</DialogTitle>
              <DialogDescription>
                ගොවි කේතය අනන්‍ය විය යුතුය. තරු ලකුණු කළ ක්ෂේත්‍ර අවශ්‍යයි.
              </DialogDescription>
            </DialogHeader>
            <FarmerForm
              onSubmit={handleAdd}
              isPending={addFarmer.isPending}
              error={formError}
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
