import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { roleLabel } from "@/lib/format";
import { LogOut, Sprout } from "lucide-react";
import type { ReactNode } from "react";

/** Mobile-first app shell: green header, scrollable content, bottom navigation. */
export function AppLayout({ children }: { children: ReactNode }) {
  const { session, logout } = useSession();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header
        data-ocid="app.header"
        className="sticky top-0 z-30 gradient-primary text-primary-foreground shadow-elevated"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <Sprout className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold leading-tight">
                ඉකෝ සේෆ් අස්වැන්න
              </p>
              {session ? (
                <p className="truncate text-xs text-primary-foreground/85">
                  {session.displayName}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {session ? (
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                {roleLabel(session.role)}
              </span>
            ) : null}
            {session ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="ඉවත් වන්න"
                data-ocid="app.logout_button"
                className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <LogOut className="size-5" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/40 px-4 py-4 pb-24 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}
