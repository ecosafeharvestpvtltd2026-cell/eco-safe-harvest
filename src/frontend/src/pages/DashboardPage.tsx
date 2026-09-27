import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentHarvests } from "@/components/dashboard/RecentHarvests";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDashboard, useHarvests } from "@/hooks/useQueries";
import { useSession } from "@/hooks/useSession";
import {
  formatCount,
  formatCurrency,
  formatDate,
  formatKg,
} from "@/lib/format";
import { errorMessage } from "@/lib/sinhala";
import { Coins, Scale, Users } from "lucide-react";

/** Main dashboard: today's KPI totals, quick actions and recent harvest entries. */
export function DashboardPage() {
  const { session, isAdmin } = useSession();
  const dashboardQuery = useDashboard();
  const harvestsQuery = useHarvests();

  const stats = dashboardQuery.data?.stats;
  // Full harvest records carry the farmer name, which the compact dashboard
  // summary omits; show the latest five newest-first.
  const recent = [...(harvestsQuery.data ?? [])]
    .sort((a, b) => (a.id > b.id ? -1 : a.id < b.id ? 1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="මුල් පිටුව"
        subtitle={
          stats
            ? `${formatDate(stats.date)} · ${isAdmin ? "සමාගම් මුළු එකතුව" : "ඔබේ අද වාර්තා"}`
            : "අද දිනයේ සාරාංශය"
        }
      />

      {session ? (
        <p className="text-sm text-muted-foreground">
          ආයුබෝවන්,{" "}
          <span className="font-semibold text-foreground">
            {session.displayName}
          </span>
        </p>
      ) : null}

      {dashboardQuery.isLoading || harvestsQuery.isLoading ? (
        <LoadingState rows={3} />
      ) : dashboardQuery.isError || harvestsQuery.isError ? (
        <ErrorState
          message={errorMessage(dashboardQuery.error ?? harvestsQuery.error)}
          onRetry={() => {
            void dashboardQuery.refetch();
            void harvestsQuery.refetch();
          }}
        />
      ) : (
        <>
          <section
            data-ocid="dashboard.kpi_section"
            aria-label="අද දිනයේ සාරාංශය"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <KpiCard
              label="අද මුළු අස්වැන්න"
              value={formatKg(stats?.totalKg ?? 0)}
              unit="kg"
              icon={Scale}
              tone="primary"
            />
            <KpiCard
              label="අද ගොවීන් ගණන"
              value={formatCount(stats?.farmerCount ?? 0)}
              icon={Users}
              tone="success"
            />
            <KpiCard
              label="අද මුළු වටිනාකම"
              value={formatCurrency(stats?.totalValue ?? 0)}
              icon={Coins}
              tone="accent"
            />
          </section>

          <QuickActions />

          <RecentHarvests harvests={recent} />
        </>
      )}
    </div>
  );
}
