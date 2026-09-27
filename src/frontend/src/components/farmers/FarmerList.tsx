import type { Farmer } from "@/types";
import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, Phone, Sprout } from "lucide-react";

interface FarmerListProps {
  farmers: Farmer[];
}

/** Tappable ledger rows: code, name, phone and village. */
export function FarmerList({ farmers }: FarmerListProps) {
  return (
    <ul data-ocid="farmers.list" className="space-y-2.5">
      {farmers.map((farmer, index) => (
        <li key={farmer.id.toString()}>
          <Link
            to="/farmers/$farmerId"
            params={{ farmerId: farmer.id.toString() }}
            data-ocid={`farmers.item.${index + 1}`}
            className="flex min-h-[4.5rem] items-center gap-3 rounded-lg border border-border bg-card p-3.5 shadow-subtle transition-smooth hover:border-primary/40 hover:shadow-harvest active:scale-[0.99]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Sprout className="size-5" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-foreground">
                  {farmer.code}
                </span>
              </div>
              <p className="mt-1 truncate text-base font-bold text-foreground">
                {farmer.name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {farmer.phone || "—"}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{farmer.village || "—"}</span>
                </span>
              </div>
            </div>

            <ChevronRight
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
