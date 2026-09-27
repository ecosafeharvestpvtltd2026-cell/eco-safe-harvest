import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface CredentialRow {
    username: string;
    displayName: string;
    password: string;
    role: Role;
}
export interface Dashboard {
    stats: DashboardStats;
    recent: Array<HarvestSummary>;
}
export interface DashboardStats {
    totalValue: Money;
    date: DateText;
    totalKg: Kg;
    farmerCount: bigint;
    recordCount: bigint;
}
export type DateText = string;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Farmer {
    id: FarmerId;
    code: string;
    name: string;
    createdAt: bigint;
    address: string;
    village: string;
    notes: string;
    phone: string;
}
export interface FarmerDetail {
    harvests: Array<HarvestSummary>;
    farmer: Farmer;
}
export type FarmerError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "notFound";
    notFound: FarmerId;
} | {
    __kind__: "duplicateCode";
    duplicateCode: string;
};
export type FarmerId = bigint;
export interface Harvest {
    id: HarvestId;
    kg: Kg;
    officerId: OfficerId;
    total: Money;
    farmerId: FarmerId;
    date: DateText;
    createdAt: bigint;
    officerName: string;
    pricePerKg: Money;
    farmerCode: string;
    farmerName: string;
    product: Product;
}
export type HarvestError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "farmerNotFound";
    farmerNotFound: FarmerId;
} | {
    __kind__: "notFound";
    notFound: HarvestId;
};
export type HarvestId = bigint;
export interface HarvestInput {
    kg: Kg;
    farmerId: FarmerId;
    date: DateText;
    pricePerKg: Money;
    product: Product;
}
export interface HarvestSummary {
    id: HarvestId;
    kg: Kg;
    officerId: OfficerId;
    total: Money;
    date: DateText;
    officerName: string;
    pricePerKg: Money;
    product: Product;
}
export type Kg = bigint;
export type Money = bigint;
export type OfficerId = bigint;
export interface PriceEntry {
    pricePerKg: Money;
    updatedAt: bigint;
    product: Product;
}
export interface Report {
    to: DateText;
    totalValue: Money;
    from: DateText;
    totalKg: Kg;
    kind: ReportKind;
    rows: Array<ReportRow>;
    recordCount: bigint;
}
export interface ReportRow {
    kg: Kg;
    key: string;
    title: string;
    value: Money;
    count: bigint;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Session {
    id: OfficerId;
    username: string;
    displayName: string;
    role: Role;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum AuthError {
    notAuthorized = "notAuthorized",
    lastAdmin = "lastAdmin",
    notFound = "notFound",
    invalidCredentials = "invalidCredentials",
    usernameTaken = "usernameTaken"
}
export enum PriceError {
    notAuthorized = "notAuthorized"
}
export enum Product {
    mustard = "mustard",
    other = "other",
    pear = "pear",
    banana = "banana",
    passion = "passion",
    woodApple = "woodApple",
    guava = "guava"
}
export enum ReportError {
    notAuthorized = "notAuthorized",
    invalidRange = "invalidRange"
}
export enum ReportKind {
    byOfficer = "byOfficer",
    byProduct = "byProduct",
    byFarmer = "byFarmer",
    monthly = "monthly",
    daily = "daily",
    weekly = "weekly"
}
export enum Role {
    admin = "admin",
    officer = "officer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add a farmer (admin only).
     */
    addFarmer(code: string, name: string, phone: string, village: string, address: string, notes: string): Promise<{
        __kind__: "ok";
        ok: Farmer;
    } | {
        __kind__: "err";
        err: FarmerError;
    }>;
    /**
     * / Enter a harvest record. The price used is frozen into the record.
     */
    addHarvest(input: HarvestInput): Promise<{
        __kind__: "ok";
        ok: Harvest;
    } | {
        __kind__: "err";
        err: HarvestError;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create an officer account (admin only).
     */
    createOfficer(username: string, password: string, displayName: string): Promise<{
        __kind__: "ok";
        ok: Session;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    /**
     * / Delete a harvest record (admin only).
     */
    deleteHarvest(id: HarvestId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: HarvestError;
    }>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown documentation of the backend's public API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Today's totals plus the latest harvest entries.
     * / Officers are scoped to their own records; admin sees company-wide totals.
     */
    getDashboard(today: DateText): Promise<Dashboard>;
    /**
     * / Fetch one farmer with that farmer's harvest history.
     */
    getFarmer(id: FarmerId): Promise<FarmerDetail | null>;
    /**
     * / Harvest history for one farmer.
     */
    getFarmerHarvests(farmerId: FarmerId): Promise<Array<HarvestSummary>>;
    /**
     * / Fetch one harvest record.
     */
    getHarvest(id: HarvestId): Promise<Harvest | null>;
    /**
     * / Build a report of the requested kind over a date range.
     * / Officers are scoped to their own records; admin sees all.
     */
    getReport(kind: ReportKind, from: DateText, to: DateText): Promise<{
        __kind__: "ok";
        ok: Report;
    } | {
        __kind__: "err";
        err: ReportError;
    }>;
    /**
     * / The seeded sign-in credentials (admin + six officers) shown on the
     * / pre-login credentials panel. Intentionally public: it returns only the
     * / accounts created by the migration seed (ids 0-6) and no other account data.
     */
    getSeededCredentials(): Promise<Array<CredentialRow>>;
    /**
     * / The signed-in user's session, or `null` when not signed in.
     */
    getSession(): Promise<Session | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List every farmer.
     */
    listFarmers(): Promise<Array<Farmer>>;
    /**
     * / List harvest records. Officers see only their own; admin sees all.
     */
    listHarvests(): Promise<Array<Harvest>>;
    /**
     * / List all officer accounts (admin only).
     */
    listOfficers(): Promise<Array<Session>>;
    /**
     * / The current price list for all seven products.
     */
    listPrices(): Promise<Array<PriceEntry>>;
    /**
     * / Sign in with username, password and the selected role.
     */
    login(username: string, password: string, role: Role): Promise<{
        __kind__: "ok";
        ok: Session;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    /**
     * / Clear the current session.
     */
    logout(): Promise<void>;
    /**
     * / Reset an officer's password (admin only).
     */
    resetOfficerPassword(id: OfficerId, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    schema(): Promise<string>;
    /**
     * / Search farmers across code, name, phone and village.
     */
    searchFarmers(term: string): Promise<Array<Farmer>>;
    /**
     * / Update the current price per kg for one product (admin only).
     */
    setPrice(product: Product, pricePerKg: Money): Promise<{
        __kind__: "ok";
        ok: PriceEntry;
    } | {
        __kind__: "err";
        err: PriceError;
    }>;
    /**
     * / Edit a farmer's details (admin only).
     */
    updateFarmer(id: FarmerId, code: string, name: string, phone: string, village: string, address: string, notes: string): Promise<{
        __kind__: "ok";
        ok: Farmer;
    } | {
        __kind__: "err";
        err: FarmerError;
    }>;
    /**
     * / Edit a harvest record (admin only).
     */
    updateHarvest(id: HarvestId, input: HarvestInput): Promise<{
        __kind__: "ok";
        ok: Harvest;
    } | {
        __kind__: "err";
        err: HarvestError;
    }>;
    /**
     * / Update an officer's display name (admin only).
     */
    updateOfficer(id: OfficerId, displayName: string): Promise<{
        __kind__: "ok";
        ok: Session;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
}
