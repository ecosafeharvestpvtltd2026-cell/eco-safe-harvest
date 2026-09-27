import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success";
  className?: string;
}

const TONE_CLASSES: Record<
  NonNullable<KpiCardProps["tone"]>,
  { icon: string; rule: string }
> = {
  primary: { icon: "bg-secondary text-primary", rule: "bg-primary" },
  accent: { icon: "bg-accent/20 text-accent-foreground", rule: "bg-accent" },
  success: { icon: "bg-success/15 text-success", rule: "bg-success" },
};

/** Headline KPI tile: circular icon, Sinhala label and a large numeric value. */
export function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = "primary",
  className,
}: KpiCardProps) {
  const styles = TONE_CLASSES[tone];

  return (
    <div
      data-ocid="dashboard.kpi_card"
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-subtle",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1", styles.rule)}
      />
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-sm font-semibold leading-snug text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            styles.icon,
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        {unit ? (
          <span className="text-sm font-semibold text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </p>
    </div>
  );
}
