import type {
  CredentialRow,
  Dashboard,
  DashboardStats,
  Farmer,
  FarmerDetail,
  Harvest,
  HarvestInput,
  HarvestSummary,
  PriceEntry,
  Report,
  ReportRow,
  Session,
} from "@/backend";
import { Product, ReportKind, Role } from "@/backend";

export type {
  CredentialRow,
  Dashboard,
  DashboardStats,
  Farmer,
  FarmerDetail,
  Harvest,
  HarvestInput,
  HarvestSummary,
  PriceEntry,
  Report,
  ReportRow,
  Session,
};

export { Product, ReportKind, Role };

/** A navigation destination available to a signed-in role. */
export interface NavItem {
  to: string;
  label: string;
  icon: "dashboard" | "farmers" | "harvest" | "reports" | "prices" | "officers";
  adminOnly: boolean;
}
