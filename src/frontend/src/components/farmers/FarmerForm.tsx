import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FARMER_ERROR_MESSAGES } from "@/lib/sinhala";
import type { Farmer } from "@/types";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useState } from "react";

export interface FarmerFormValues {
  code: string;
  name: string;
  phone: string;
  village: string;
  address: string;
  notes: string;
}

interface FarmerFormProps {
  /** Existing farmer when editing; omitted when adding. */
  farmer?: Farmer;
  onSubmit: (values: FarmerFormValues) => void;
  isPending: boolean;
  error: string | null;
  onCancel?: () => void;
}

const EMPTY: FarmerFormValues = {
  code: "",
  name: "",
  phone: "",
  village: "",
  address: "",
  notes: "",
};

function initialValues(farmer?: Farmer): FarmerFormValues {
  if (!farmer) return EMPTY;
  return {
    code: farmer.code,
    name: farmer.name,
    phone: farmer.phone,
    village: farmer.village,
    address: farmer.address,
    notes: farmer.notes,
  };
}

/** Add / edit farmer form with Sinhala labels and duplicate-code validation. */
export function FarmerForm({
  farmer,
  onSubmit,
  isPending,
  error,
  onCancel,
}: FarmerFormProps) {
  const [values, setValues] = useState<FarmerFormValues>(() =>
    initialValues(farmer),
  );
  const [touched, setTouched] = useState(false);

  const codeMissing = values.code.trim().length === 0;
  const nameMissing = values.name.trim().length === 0;
  const canSubmit = !codeMissing && !nameMissing && !isPending;

  function update<K extends keyof FarmerFormValues>(
    key: K,
    value: FarmerFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({
      code: values.code.trim(),
      name: values.name.trim(),
      phone: values.phone.trim(),
      village: values.village.trim(),
      address: values.address.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="farmer.form"
      className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-subtle"
    >
      <div className="space-y-2">
        <Label htmlFor="farmer-code">
          ගොවි කේතය <span className="text-destructive">*</span>
        </Label>
        <Input
          id="farmer-code"
          value={values.code}
          onChange={(event) => update("code", event.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="උදා: G-001"
          autoComplete="off"
          aria-invalid={touched && codeMissing}
          data-ocid="farmer.code_input"
        />
        {touched && codeMissing ? (
          <p
            role="alert"
            data-ocid="farmer.code_error"
            className="text-sm text-destructive"
          >
            ගොවි කේතය අවශ්‍යයි.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="farmer-name">
          ගොවි නම <span className="text-destructive">*</span>
        </Label>
        <Input
          id="farmer-name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="ගොවියාගේ සම්පූර්ණ නම"
          autoComplete="off"
          aria-invalid={touched && nameMissing}
          data-ocid="farmer.name_input"
        />
        {touched && nameMissing ? (
          <p
            role="alert"
            data-ocid="farmer.name_error"
            className="text-sm text-destructive"
          >
            ගොවි නම අවශ්‍යයි.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="farmer-phone">දුරකථන අංකය</Label>
        <Input
          id="farmer-phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={(event) => update("phone", event.target.value)}
          placeholder="උදා: 077 123 4567"
          autoComplete="tel"
          data-ocid="farmer.phone_input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="farmer-village">ගම</Label>
        <Input
          id="farmer-village"
          value={values.village}
          onChange={(event) => update("village", event.target.value)}
          placeholder="ගමේ නම"
          autoComplete="off"
          data-ocid="farmer.village_input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="farmer-address">ලිපිනය</Label>
        <Textarea
          id="farmer-address"
          value={values.address}
          onChange={(event) => update("address", event.target.value)}
          placeholder="සම්පූර්ණ ලිපිනය"
          rows={2}
          data-ocid="farmer.address_input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="farmer-notes">සටහන්</Label>
        <Textarea
          id="farmer-notes"
          value={values.notes}
          onChange={(event) => update("notes", event.target.value)}
          placeholder="අමතර සටහන් (අවශ්‍ය නම්)"
          rows={2}
          data-ocid="farmer.notes_input"
        />
      </div>

      {error ? (
        <div
          role="alert"
          data-ocid="farmer.error_state"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="submit"
          disabled={!canSubmit}
          data-ocid="farmer.submit_button"
          className="w-full text-base sm:flex-1"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-5" aria-hidden="true" />
          )}
          {isPending ? "සුරකිමින්…" : "සුරකින්න"}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-ocid="farmer.cancel_button"
            className="w-full text-base sm:flex-1"
          >
            අවලංගු කරන්න
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** Map a backend farmer error variant to its Sinhala message. */
export function farmerErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "__kind__" in error) {
    const kind = (error as { __kind__: keyof typeof FARMER_ERROR_MESSAGES })
      .__kind__;
    return FARMER_ERROR_MESSAGES[kind] ?? "ගොවි තොරතුරු සුරැකීමට නොහැකි විය.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "ගොවි තොරතුරු සුරැකීමට නොහැකි විය.";
}
