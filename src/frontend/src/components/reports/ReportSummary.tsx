import { formatCount, formatCurrency, formatKg } from "@/lib/format";
import type { Report } from "@/types";
import { FileBarChart } from "lucide-react";

interface ReportSummaryProps {
  report: Report;
}

/** Totals strip for a report: kilograms, value and record count. */
export function ReportSummary({ report }: ReportSummaryProps) {
  const stats = [
    { label: "මුළු බර", value: `${formatKg(report.totalKg)} kg` },
    { label: "මුළු වටිනාකම", value: formatCurrency(report.totalValue) },
    { label: "වාර්තා ගණන", value: formatCount(report.recordCount) },
  ];

  return (
    <section
      data-ocid="reports.summary"
      aria-label="වාර්තා සාරාංශය"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
    >
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2.5">
        <FileBarChart className="size-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-bold text-secondary-foreground">
          වාර්තා සාරාංශය
        </h2>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-border">
        {stats.map((stat) => (
          <div key={stat.label} className="px-3 py-3.5 text-center">
            <dt className="text-[0.7rem] font-medium text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="mt-1 font-mono text-base font-bold text-foreground sm:text-lg">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
