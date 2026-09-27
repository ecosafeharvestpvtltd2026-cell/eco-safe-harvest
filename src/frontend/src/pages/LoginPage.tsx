import { Role } from "@/backend";
import { CredentialsPanel } from "@/components/auth/CredentialsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Sprout,
  User,
} from "lucide-react";
import { useState } from "react";

const ROLE_OPTIONS: { value: Role; label: string; hint: string }[] = [
  { value: Role.admin, label: "පරිපාලක", hint: "සම්පූර්ණ ප්‍රවේශය" },
  { value: Role.officer, label: "නිලධාරී", hint: "අස්වැන්න ඇතුළත් කිරීම" },
];

/** Username / password / role sign-in screen, fully in Sinhala. */
export function LoginPage() {
  const { login, loginError, isLoggingIn } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.officer);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !isLoggingIn;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    login(username.trim(), password, role);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="gradient-primary px-5 pb-14 pt-12 text-primary-foreground">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-foreground/15">
            <Sprout className="size-8" aria-hidden="true" />
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            ඉකෝ සේෆ් අස්වැන්න
          </h1>
          <p className="text-sm text-primary-foreground/85">
            ගොවි අස්වැන්න හා මිල ලේඛන පද්ධතිය
          </p>
        </div>
      </div>

      <main className="mx-auto -mt-8 w-full max-w-md flex-1 px-4 pb-10">
        <form
          onSubmit={handleSubmit}
          data-ocid="login.form"
          className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-floating"
        >
          <div className="space-y-2">
            <Label htmlFor="login-username">පරිශීලක නාමය</Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="login-username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="ඔබේ පරිශීලක නාමය ඇතුළත් කරන්න"
                data-ocid="login.username_input"
                className="pl-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">මුරපදය</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="ඔබේ මුරපදය ඇතුළත් කරන්න"
                data-ocid="login.password_input"
                className="pl-11 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "මුරපදය සඟවන්න" : "මුරපදය පෙන්වන්න"}
                data-ocid="login.toggle_password_button"
                className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-foreground">
              භූමිකාව
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((option) => {
                const isSelected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    aria-pressed={isSelected}
                    data-ocid={`login.role_${option.value}_button`}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border-2 px-3 py-3 text-left transition-smooth active:scale-[0.98]",
                      isSelected
                        ? "border-primary bg-secondary text-secondary-foreground shadow-subtle"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    <span className="text-base font-bold">{option.label}</span>
                    <span className="text-xs">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {loginError ? (
            <div
              role="alert"
              data-ocid="login.error_state"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{loginError}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit}
            data-ocid="login.submit_button"
            className="w-full text-base"
          >
            <LogIn className="size-5" aria-hidden="true" />
            {isLoggingIn ? "පිවිසෙමින්…" : "පිවිසෙන්න"}
          </Button>
        </form>

        <CredentialsPanel />

        <p className="mt-5 text-center text-xs text-muted-foreground">
          ගිණුමක් අවශ්‍ය නම් ඔබේ පරිපාලක අමතන්න.
        </p>
      </main>

      <footer className="border-t border-border bg-muted/40 px-4 py-4 text-center text-xs text-muted-foreground">
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
    </div>
  );
}
