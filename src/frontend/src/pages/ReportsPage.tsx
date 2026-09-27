import { ReportError, createActor } from "@/backend";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { ReportTable } from "@/components/reports/ReportTable";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatDate, todayDateText } from "@/lib/format";
import { REPORT_ERROR_MESSAGES, errorMessage } from "@/lib/sinhala";
import type { Report } from "@/types";
import { ReportKind } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useState } from "react";

/** First day of the month containing `dateText`, as `YYYY-MM-DD`. */
function monthStart(dateText: string): string {
  const [year, month] = dateText.split("-");
  return `${year}-${month}-01`;
}

/** Last day of the month containing `dateText`, as `YYYY-MM-DD`. */
function monthEnd(dateText: string): string {
  const [year, month] = dateText.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

/** Seven days ending on `dateText`, as `YYYY-MM-DD`. */
function weekStart(dateText: string): string {
  const [year, month, day] = dateText.split("-").map(Number);
  const start = new Date(year, month - 1, day - 6);
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  return `${start.getFullYear()}-${m}-${d}`;
}

/** Earliest possible date bound, so a group-by report spans all records. */
const RANGE_MIN = "0000-01-01";

/** Latest possible date bound, so a group-by report spans all records. */
const RANGE_MAX = "9999-12-31";

/** Resolve the inclusive date range for a report kind and reference date. */
function resolveRange(
  kind: ReportKind,
  reference: string,
): { from: string; to: string } {
  switch (kind) {
    case ReportKind.daily:
      return { from: reference, to: reference };
    case ReportKind.weekly:
      return { from: weekStart(reference), to: reference };
    case ReportKind.monthly:
      return { from: monthStart(reference), to: monthEnd(reference) };
    default:
      // Group-by reports (farmer, product, officer) are not date-scoped, so
      // span every record instead of an empty range that matches nothing.
      return { from: RANGE_MIN, to: RANGE_MAX };
  }
}

const RANGE_KINDS: ReportKind[] = [
  ReportKind.daily,
  ReportKind.weekly,
  ReportKind.monthly,
];

const REFERENCE_LABELS: Record<string, string> = {
  [ReportKind.daily]: "දිනය තෝරන්න",
  [ReportKind.weekly]: "අවසන් දිනය තෝරන්න",
  [ReportKind.monthly]: "මාසය තෝරන්න",
};

/** Map a report failure to its Sinhala message, including unwrapped tokens. */
function reportErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw === String(ReportError.invalidRange)) {
    return REPORT_ERROR_MESSAGES[ReportError.invalidRange];
  }
  if (raw === String(ReportError.notAuthorized)) {
    return REPORT_ERROR_MESSAGES[ReportError.notAuthorized];
  }
  return errorMessage(error);
}

/** Reports screen: six Sinhala report kinds with totals, breakdown and print. */
export function ReportsPage() {
  const { actor, isFetching } = useActor(createActor);
  const [kind, setKind] = useState<ReportKind>(ReportKind.daily);
  const [reference, setReference] = useState<string>(todayDateText());

  const isRangeKind = RANGE_KINDS.includes(kind);
  const range = resolveRange(kind, reference);

  const reportQuery = useQuery({
    queryKey: ["report", kind, range.from, range.to],
    queryFn: async (): Promise<Report> => {
      if (!actor) throw new Error("Backend is not ready");
      return api.getReport(actor, kind, range.from, range.to);
    },
    enabled: !!actor && !isFetching,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="වාර්තා"
        subtitle="අස්වැන්න සාරාංශ හා බෙදීම්"
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            disabled={!reportQuery.data}
            data-ocid="reports.print_button"
          >
            <Printer className="size-4" aria-hidden="true" />
            මුද්‍රණය
          </Button>
        }
      />

      <ReportTabs active={kind} onChange={setKind} />

      {isRangeKind ? (
        <div className="rounded-lg border border-border bg-card p-4 shadow-subtle">
          <Label htmlFor="report-reference" className="text-sm font-semibold">
            {REFERENCE_LABELS[kind] ?? "දිනය තෝරන්න"}
          </Label>
          <Input
            id="report-reference"
            type="date"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            data-ocid="reports.date_input"
            className="mt-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            කාල පරාසය: {formatDate(range.from)} — {formatDate(range.to)}
          </p>
        </div>
      ) : null}

      {reportQuery.isLoading ? (
        <LoadingState rows={4} />
      ) : reportQuery.isError ? (
        <ErrorState
          message={reportErrorMessage(reportQuery.error)}
          onRetry={() => void reportQuery.refetch()}
        />
      ) : reportQuery.data ? (
        <div className="space-y-4">
          <ReportSummary report={reportQuery.data} />
          <ReportTable report={reportQuery.data} />
        </div>
      ) : null}

      <p className="text-center text-xs text-muted-foreground">
        මුද්‍රණය හෝ PDF ලෙස සුරැකීම සඳහා බ්‍රව්සරයේ මුද්‍රණ කවුළුව භාවිත කරන්න.
      </p>
    </div>
  );
}
