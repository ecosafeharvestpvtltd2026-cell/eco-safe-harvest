import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Friendly empty state with a headline, guidance and a primary next step. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-ocid="empty_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center shadow-subtle",
        className,
      )}
    >
      {icon ? (
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
