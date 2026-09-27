import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";
import { Check, KeyRound, Loader2, Pencil, X } from "lucide-react";
import { useState } from "react";

interface OfficerListProps {
  officers: Session[];
  recordCounts: Record<string, number>;
  isUpdating: boolean;
  updatingId: bigint | null;
  onRename: (id: bigint, displayName: string) => void;
  onResetPassword: (id: bigint, password: string) => void;
}

interface OfficerRowProps {
  officer: Session;
  recordCount: number;
  isUpdating: boolean;
  updatingId: bigint | null;
  onRename: (id: bigint, displayName: string) => void;
  onResetPassword: (id: bigint, password: string) => void;
}

/** One officer row with inline rename and password-reset controls. */
function OfficerRow({
  officer,
  recordCount,
  isUpdating,
  updatingId,
  onRename,
  onResetPassword,
}: OfficerRowProps) {
  const [mode, setMode] = useState<"idle" | "rename" | "password">("idle");
  const [draft, setDraft] = useState("");

  const isRowUpdating = isUpdating && updatingId === officer.id;
  const isValid =
    mode === "rename" ? draft.trim().length > 0 : draft.length >= 4;

  function start(nextMode: "rename" | "password") {
    setDraft(nextMode === "rename" ? officer.displayName : "");
    setMode(nextMode);
  }

  function cancel() {
    setMode("idle");
    setDraft("");
  }

  function confirm() {
    if (!isValid) return;
    if (mode === "rename") {
      onRename(officer.id, draft.trim());
    } else if (mode === "password") {
      onResetPassword(officer.id, draft);
    }
    setMode("idle");
    setDraft("");
  }

  return (
    <li
      data-ocid="officers.item"
      className={cn(
        "space-y-3 border-b border-border px-4 py-3.5 last:border-b-0",
        mode !== "idle" && "bg-secondary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-foreground">
            {officer.displayName}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
            @{officer.username}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
          වාර්තා {formatCount(recordCount)}
        </span>
      </div>

      {mode === "idle" ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => start("rename")}
            disabled={isUpdating}
            data-ocid="officers.edit_button"
            className="flex-1"
          >
            <Pencil className="size-4" aria-hidden="true" />
            නම වෙනස් කරන්න
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => start("password")}
            disabled={isUpdating}
            data-ocid="officers.reset_password_button"
            className="flex-1"
          >
            <KeyRound className="size-4" aria-hidden="true" />
            මුරපදය යළි සකසන්න
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type={mode === "password" ? "password" : "text"}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={mode === "rename" ? "නව නම" : "නව මුරපදය"}
            placeholder={mode === "rename" ? "නව නම" : "නව මුරපදය"}
            autoComplete="off"
            data-ocid="officers.edit_input"
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            onClick={confirm}
            disabled={!isValid || isRowUpdating}
            aria-label="සුරකින්න"
            data-ocid="officers.save_button"
          >
            {isRowUpdating ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-5" aria-hidden="true" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={cancel}
            disabled={isRowUpdating}
            aria-label="අවලංගු කරන්න"
            data-ocid="officers.cancel_button"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>
      )}
    </li>
  );
}

/** Officer account list with per-officer record counts and edit actions. */
export function OfficerList({
  officers,
  recordCounts,
  isUpdating,
  updatingId,
  onRename,
  onResetPassword,
}: OfficerListProps) {
  return (
    <ul
      data-ocid="officers.list"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
    >
      {officers.map((officer) => (
        <OfficerRow
          key={String(officer.id)}
          officer={officer}
          recordCount={recordCounts[String(officer.id)] ?? 0}
          isUpdating={isUpdating}
          updatingId={updatingId}
          onRename={onRename}
          onResetPassword={onResetPassword}
        />
      ))}
    </ul>
  );
}
