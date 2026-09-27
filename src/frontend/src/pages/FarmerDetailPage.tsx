import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { FarmerForm } from "@/components/farmers/FarmerForm";
import type { FarmerFormValues } from "@/components/farmers/FarmerForm";
import { farmerErrorMessage } from "@/components/farmers/FarmerForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useFarmer, useUpdateFarmer } from "@/hooks/useQueries";
import { useSession } from "@/hooks/useSession";
import { formatCurrency, formatDate, formatKg } from "@/lib/format";
import { productLabel } from "@/lib/products";
import { errorMessage } from "@/lib/sinhala";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  NotebookPen,
  Pencil,
  Phone,
  Sprout,
  X,
} from "lucide-react";
import { useState } from "react";

function parseFarmerId(raw: string): bigint | null {
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

/** Full farmer details plus that farmer's harvest history. */
export function FarmerDetailPage() {
  const { farmerId } = useParams({ from: "/farmers/$farmerId" });
  const { isAdmin } = useSession();
  const id = parseFarmerId(farmerId);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const farmerQuery = useFarmer(id);
  const updateFarmer = useUpdateFarmer();

  if (id === null) {
    return (
      <div className="space-y-5">
        <PageHeader title="ගොවි විස්තර" />
        <ErrorState message="ගොවි හැඳුනුම වැරදිය." />
      </div>
    );
  }

  if (farmerQuery.isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="ගොවි විස්තර" />
        <LoadingState rows={4} />
      </div>
    );
  }

  if (farmerQuery.isError) {
    return (
      <div className="space-y-5">
        <PageHeader title="ගොවි විස්තර" />
        <ErrorState
          message={errorMessage(farmerQuery.error)}
          onRetry={() => void farmerQuery.refetch()}
        />
      </div>
    );
  }

  const detail = farmerQuery.data;
  if (!detail) {
    return (
      <div className="space-y-5">
        <PageHeader title="ගොවි විස්තර" />
        <EmptyState
          icon={<Sprout className="size-7" aria-hidden="true" />}
          title="ගොවියා හමු නොවීය"
          description="මෙම ගොවි වාර්තාව ඉවත් කර තිබිය හැක."
          action={
            <Button asChild type="button" variant="outline">
              <Link to="/farmers" data-ocid="farmer.back_button">
                ගොවි ලේඛනයට
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { farmer, harvests } = detail;

  function handleUpdate(values: FarmerFormValues) {
    setFormError(null);
    updateFarmer.mutate(
      { id: farmer.id, ...values },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setFormError(farmerErrorMessage(result.err));
            return;
          }
          setIsEditing(false);
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
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
          <Link to="/farmers" data-ocid="farmer.back_button">
            <ArrowLeft className="size-4" aria-hidden="true" />
            ගොවීන්
          </Link>
        </Button>
      </div>

      <PageHeader
        title={farmer.name}
        subtitle={`ගොවි කේතය ${farmer.code}`}
        action={
          isAdmin && !isEditing ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormError(null);
                setIsEditing(true);
              }}
              data-ocid="farmer.edit_button"
            >
              <Pencil className="size-4" aria-hidden="true" />
              සංස්කරණය
            </Button>
          ) : null
        }
      />

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              ගොවි තොරතුරු සංස්කරණය
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              data-ocid="farmer.close_edit_button"
            >
              <X className="size-4" aria-hidden="true" />
              වසන්න
            </Button>
          </div>
          <FarmerForm
            farmer={farmer}
            onSubmit={handleUpdate}
            isPending={updateFarmer.isPending}
            error={formError}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <section
          data-ocid="farmer.detail_card"
          className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-subtle"
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                දුරකථන අංකය
              </dt>
              <dd className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Phone className="size-4 text-primary" aria-hidden="true" />
                {farmer.phone || "—"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ගම
              </dt>
              <dd className="flex items-center gap-2 text-base font-semibold text-foreground">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                {farmer.village || "—"}
              </dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ලිපිනය
              </dt>
              <dd className="text-base text-foreground">
                {farmer.address || "—"}
              </dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                සටහන්
              </dt>
              <dd className="flex items-start gap-2 text-base text-foreground">
                <NotebookPen
                  className="mt-1 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{farmer.notes || "—"}</span>
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ClipboardList className="size-5 text-primary" aria-hidden="true" />
            අස්වැන්න ඉතිහාසය
          </h2>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
            {harvests.length}
          </span>
        </div>

        {harvests.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-7" aria-hidden="true" />}
            title="තවම අස්වැන්න වාර්තා නොමැත"
            description="මෙම ගොවියා සඳහා පළමු අස්වැන්න ඇතුළත් කරන්න."
            action={
              <Button asChild type="button" className="text-base">
                <Link to="/harvest/new" data-ocid="farmer.add_harvest_button">
                  අස්වැන්න ඇතුළත් කරන්න
                </Link>
              </Button>
            }
          />
        ) : (
          <ul data-ocid="farmer.harvest_list" className="space-y-2.5">
            {harvests.map((harvest, index) => (
              <li
                key={harvest.id.toString()}
                data-ocid={`farmer.harvest_item.${index + 1}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5 shadow-subtle"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(harvest.date)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {productLabel(harvest.product)} · {formatKg(harvest.kg)} kg
                    · {formatCurrency(harvest.pricePerKg)}/kg
                  </p>
                </div>
                <span className="shrink-0 font-mono text-base font-bold text-primary">
                  {formatCurrency(harvest.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
