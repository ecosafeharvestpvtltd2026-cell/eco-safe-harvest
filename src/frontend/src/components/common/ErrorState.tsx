import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/** Error panel with a clear Sinhala message and a retry action. */
export function ErrorState({
  title = "දෝෂයක් සිදුවිය",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      data-ocid="error_state"
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-8 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          data-ocid="error_state.retry_button"
          className="mt-1"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          නැවත උත්සාහ කරන්න
        </Button>
      ) : null}
    </div>
  );
}
