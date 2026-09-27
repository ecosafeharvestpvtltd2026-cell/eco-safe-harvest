import type {
  CredentialRow,
  Dashboard,
  Farmer,
  FarmerDetail,
  Harvest,
  HarvestInput,
  HarvestSummary,
  PriceEntry,
  Report,
  ReportKind,
  Role,
  Session,
} from "@/backend";
import type { backendInterface } from "@/backend";

/** The generated actor surface, as returned by `useActor(createActor)`. */
export type BackendActor = backendInterface;

/** Result of a backend call that can fail with a typed error. */
export type ApiResult<T, E> =
  | { __kind__: "ok"; ok: T }
  | { __kind__: "err"; err: E };

/** Unwrap a backend result, throwing a readable error on failure. */
export function unwrap<T, E>(result: ApiResult<T, E>): T {
  if (result.__kind__ === "ok") return result.ok;
  throw new Error(String(result.err));
}

export const api = {
  // Session
  login: (
    actor: BackendActor,
    username: string,
    password: string,
    role: Role,
  ) => actor.login(username, password, role),
  logout: (actor: BackendActor) => actor.logout(),
  getSession: (actor: BackendActor): Promise<Session | null> =>
    actor.getSession(),
  /** Public seeded credentials shown on the pre-login panel. */
  getSeededCredentials: (actor: BackendActor): Promise<CredentialRow[]> =>
    actor.getSeededCredentials(),

  // Farmers
  listFarmers: (actor: BackendActor): Promise<Farmer[]> => actor.listFarmers(),
  searchFarmers: (actor: BackendActor, term: string): Promise<Farmer[]> =>
    actor.searchFarmers(term),
  getFarmer: (actor: BackendActor, id: bigint): Promise<FarmerDetail | null> =>
    actor.getFarmer(id),
  addFarmer: (
    actor: BackendActor,
    code: string,
    name: string,
    phone: string,
    village: string,
    address: string,
    notes: string,
  ) => actor.addFarmer(code, name, phone, village, address, notes),
  updateFarmer: (
    actor: BackendActor,
    id: bigint,
    code: string,
    name: string,
    phone: string,
    village: string,
    address: string,
    notes: string,
  ) => actor.updateFarmer(id, code, name, phone, village, address, notes),

  // Harvests
  listHarvests: (actor: BackendActor): Promise<Harvest[]> =>
    actor.listHarvests(),
  getHarvest: (actor: BackendActor, id: bigint): Promise<Harvest | null> =>
    actor.getHarvest(id),
  getFarmerHarvests: (
    actor: BackendActor,
    farmerId: bigint,
  ): Promise<HarvestSummary[]> => actor.getFarmerHarvests(farmerId),
  addHarvest: (actor: BackendActor, input: HarvestInput) =>
    actor.addHarvest(input),
  updateHarvest: (actor: BackendActor, id: bigint, input: HarvestInput) =>
    actor.updateHarvest(id, input),
  deleteHarvest: (actor: BackendActor, id: bigint) => actor.deleteHarvest(id),

  // Prices
  listPrices: (actor: BackendActor): Promise<PriceEntry[]> =>
    actor.listPrices(),
  setPrice: (
    actor: BackendActor,
    product: PriceEntry["product"],
    pricePerKg: bigint,
  ) => actor.setPrice(product, pricePerKg),

  // Officers
  listOfficers: (actor: BackendActor): Promise<Session[]> =>
    actor.listOfficers(),
  createOfficer: (
    actor: BackendActor,
    username: string,
    password: string,
    displayName: string,
  ) => actor.createOfficer(username, password, displayName),
  updateOfficer: (actor: BackendActor, id: bigint, displayName: string) =>
    actor.updateOfficer(id, displayName),
  resetOfficerPassword: (actor: BackendActor, id: bigint, password: string) =>
    actor.resetOfficerPassword(id, password),

  // Reports and dashboard
  getReport: (
    actor: BackendActor,
    kind: ReportKind,
    from: string,
    to: string,
  ): Promise<Report> => actor.getReport(kind, from, to).then(unwrap),
  getDashboard: (actor: BackendActor, today: string): Promise<Dashboard> =>
    actor.getDashboard(today),
};
