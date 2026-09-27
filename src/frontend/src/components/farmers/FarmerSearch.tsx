import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface FarmerSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

/** Live search field across farmer code, name, phone and village. */
export function FarmerSearch({
  value,
  onChange,
  resultCount,
}: FarmerSearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          inputMode="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="කේතය, නම, දුරකථනය හෝ ගම අනුව සොයන්න"
          aria-label="ගොවීන් සොයන්න"
          data-ocid="farmers.search_input"
          className="pl-11 pr-12"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="සෙවුම හිස් කරන්න"
            data-ocid="farmers.clear_search_button"
            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {value && typeof resultCount === "number" ? (
        <p
          data-ocid="farmers.search_result_count"
          className="px-1 text-sm text-muted-foreground"
        >
          ප්‍රතිඵල {resultCount}ක් හමු විය
        </p>
      ) : null}
    </div>
  );
}
