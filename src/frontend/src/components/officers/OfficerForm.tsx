import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

interface OfficerFormProps {
  isSubmitting: boolean;
  onSubmit: (input: {
    username: string;
    password: string;
    displayName: string;
  }) => void;
}

/** Create-officer form: username, password and display name. */
export function OfficerForm({ isSubmitting, onSubmit }: OfficerFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    username.trim().length > 0 &&
    password.length >= 4 &&
    displayName.trim().length > 0 &&
    !isSubmitting;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const input = {
      username: username.trim(),
      password,
      displayName: displayName.trim(),
    };
    setUsername("");
    setPassword("");
    setDisplayName("");
    onSubmit(input);
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="officers.form"
      className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-subtle"
    >
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <UserPlus className="size-5 text-primary" aria-hidden="true" />
        නව නිලධාරී ගිණුමක්
      </h2>

      <div className="space-y-2">
        <Label htmlFor="officer-display-name">නම</Label>
        <Input
          id="officer-display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="නිලධාරියාගේ නම"
          autoComplete="off"
          data-ocid="officers.display_name_input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="officer-username">පරිශීලක නාමය</Label>
        <Input
          id="officer-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="පිවිසුම් නාමය"
          autoComplete="off"
          data-ocid="officers.username_input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="officer-password">මුරපදය</Label>
        <div className="relative">
          <Input
            id="officer-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="අවම අක්ෂර 4"
            autoComplete="new-password"
            data-ocid="officers.password_input"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "මුරපදය සඟවන්න" : "මුරපදය පෙන්වන්න"}
            data-ocid="officers.toggle_password_button"
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

      <Button
        type="submit"
        disabled={!canSubmit}
        data-ocid="officers.submit_button"
        className={cn("w-full text-base")}
      >
        {isSubmitting ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="size-5" aria-hidden="true" />
        )}
        {isSubmitting ? "සුරකිමින්…" : "නිලධාරියා එක් කරන්න"}
      </Button>
    </form>
  );
}
