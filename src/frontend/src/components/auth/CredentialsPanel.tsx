import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CredentialRow } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  Copy,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** One credential row with a copy-to-clipboard action and inline confirmation. */
function CredentialItem({
  credential,
  index,
}: {
  credential: CredentialRow;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const isAdmin = credential.role === "admin";

  async function handleCopy() {
    const text = `${credential.username} / ${credential.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("පිවිසුම් තොරතුරු පිටපත් කරන ලදී");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("පිටපත් කිරීම අසාර්ථක විය. අතින් තෝරන්න.");
    }
  }

  return (
    <li
      data-ocid={`login.credential_item.${index}`}
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-3.5 py-3 last:border-b-0",
        isAdmin && "bg-accent/15",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {isAdmin ? (
            <ShieldCheck
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
          ) : (
            <UserRound
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <span className="truncate text-sm font-bold text-foreground">
            {credential.displayName}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-xs text-muted-foreground">
          <span className="truncate">{credential.username}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate font-bold text-foreground">
            {credential.password}
          </span>
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        aria-label={`${credential.displayName} පිවිසුම් තොරතුරු පිටපත් කරන්න`}
        data-ocid={`login.copy_button.${index}`}
        className="shrink-0"
      >
        {copied ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {copied ? "පිටපත් විය" : "පිටපත්"}
      </Button>
    </li>
  );
}

/**
 * Collapsible pre-login credentials panel.
 *
 * Renders only on the sign-in screen and reads the seeded admin + officer
 * credentials from the public backend query. It is never mounted inside the
 * signed-in shell, so officer passwords stay hidden from signed-in officers.
 */
export function CredentialsPanel() {
  const { actor, isFetching } = useActor(createActor);
  const [isOpen, setIsOpen] = useState(true);

  const credentialsQuery = useQuery({
    queryKey: ["seededCredentials"],
    queryFn: async (): Promise<CredentialRow[]> => {
      if (!actor) return [];
      return api.getSeededCredentials(actor);
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const credentials = credentialsQuery.data ?? [];
  const admin = credentials.find((row) => row.role === "admin");
  const officers = credentials.filter((row) => row.role === "officer");

  return (
    <section
      data-ocid="login.credentials_panel"
      className="mt-5 overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="login-credentials-body"
        data-ocid="login.credentials_toggle"
        className="flex w-full items-center justify-between gap-3 bg-secondary/60 px-4 py-3.5 text-left transition-smooth hover:bg-secondary"
      >
        <span className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold text-foreground">පිවිසුම් තොරතුරු</span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-smooth",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div id="login-credentials-body" className="border-t border-border">
          {credentialsQuery.isLoading ? (
            <div
              data-ocid="login.credentials_loading_state"
              className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              පූරණය වෙමින්…
            </div>
          ) : credentialsQuery.isError ? (
            <div
              role="alert"
              data-ocid="login.credentials_error_state"
              className="px-4 py-5 text-center text-sm text-destructive"
            >
              පිවිසුම් තොරතුරු පූරණය කළ නොහැක. නැවත උත්සාහ කරන්න.
            </div>
          ) : credentials.length === 0 ? (
            <p
              data-ocid="login.credentials_empty_state"
              className="px-4 py-5 text-center text-sm text-muted-foreground"
            >
              පිවිසුම් තොරතුරු නොමැත.
            </p>
          ) : (
            <>
              {admin ? (
                <div className="border-b border-border bg-accent/10 px-4 py-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent-foreground">
                    පරිපාලක පිවිසුම
                  </p>
                </div>
              ) : null}
              <ul data-ocid="login.credentials_list" className="list-none">
                {admin ? <CredentialItem credential={admin} index={0} /> : null}
                {officers.length > 0 ? (
                  <li className="border-b border-border bg-muted/40 px-4 py-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      නිලධාරී පිවිසුම්
                    </p>
                  </li>
                ) : null}
                {officers.map((officer, index) => (
                  <CredentialItem
                    key={officer.username}
                    credential={officer}
                    index={index + 1}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
