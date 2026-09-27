import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

const SKELETON_IDS = Array.from(
  { length: 6 },
  (_, index) => `loading-row-${index}`,
);

/** Layout-matched skeleton list shown while backend data loads. */
export function LoadingState({ rows = 4, className }: LoadingStateProps) {
  return (
    <div
      data-ocid="loading_state"
      aria-busy="true"
      aria-live="polite"
      className={cn("space-y-3", className)}
    >
      <span className="sr-only">පූරණය වෙමින්…</span>
      {SKELETON_IDS.slice(0, rows).map((id) => (
        <div
          key={id}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-subtle"
        >
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
