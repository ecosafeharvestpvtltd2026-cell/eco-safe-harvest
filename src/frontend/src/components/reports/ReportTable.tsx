import { EmptyState } from "@/components/common/EmptyState";
import { formatCount, formatCurrency, formatKg } from "@/lib/format";
import type { Report, ReportKind } from "@/types";
import { FileBarChart } from "lucide-react";

interface ReportTableProps {
  report: Report;
}

const COLUMN_TITLES: Record<ReportKind, string> = {
  daily: "දිනය",
  weekly: "සතිය",
  monthly: "මාසය",
  byFarmer: "ගොවියා",
  byProduct: "අස්වැන්න වර්ගය",
  byOfficer: "නිලධාරියා",
};

/** Breakdown table for a report, with right-aligned numeric columns. */
export function ReportTable({ report }: ReportTableProps) {
  if (report.rows.length === 0) {
    return (
      <EmptyState
        icon={<FileBarChart className="size-6" aria-hidden="true" />}
        title="දත්ත නොමැත"
        description="තෝරාගත් කාල පරාසය තුළ අස්වැන්න වාර්තා නොමැත."
      />
    );
  }

  return (
    <div
      data-ocid="reports.table"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {COLUMN_TITLES[report.kind]} අනුව අස්වැන්න බෙදීම
          </caption>
          <thead className="sticky top-0 bg-secondary/60">
            <tr className="border-b border-border">
              <th
                scope="col"
                className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-secondary-foreground"
              >
                {COLUMN_TITLES[report.kind]}
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-secondary-foreground"
              >
                බර (kg)
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-secondary-foreground"
              >
                වටිනාකම
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-secondary-foreground"
              >
                ගණන
              </th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr
                key={row.key}
                data-ocid="reports.row"
                className="border-b border-border last:border-b-0 hover:bg-muted/50"
              >
                <th
                  scope="row"
                  className="max-w-[10rem] truncate px-3 py-3 text-left font-semibold text-foreground"
                >
                  {row.title}
                </th>
                <td className="px-3 py-3 text-right font-mono text-foreground">
                  {formatKg(row.kg)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-semibold text-primary">
                  {formatCurrency(row.value)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                  {formatCount(row.count)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-border bg-muted/60">
            <tr>
              <th
                scope="row"
                className="px-3 py-3 text-left text-sm font-bold text-foreground"
              >
                එකතුව
              </th>
              <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                {formatKg(report.totalKg)}
              </td>
              <td className="px-3 py-3 text-right font-mono font-bold text-primary">
                {formatCurrency(report.totalValue)}
              </td>
              <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                {formatCount(report.recordCount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
