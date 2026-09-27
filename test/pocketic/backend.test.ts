import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const ADMIN = { admin: null } as const;
const OFFICER = { officer: null } as const;
const BANANA = { banana: null } as const;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  // Every read requires a signed-in session, so sign in before reading.
  await actor.login("admin", "admin123", ADMIN);
  await expect(actor.listFarmers()).resolves.toEqual([]);
  await expect(actor.listHarvests()).resolves.toEqual([]);
  await expect(actor.listPrices()).resolves.toHaveLength(7);
  await expect(actor.getSession()).resolves.toHaveLength(1);
});

it("signs in the seeded admin and round-trips the session", async () => {
  const result = await actor.login("admin", "admin123", ADMIN);
  expect(result).toMatchObject({ ok: { username: "admin", role: ADMIN } });

  const session = await actor.getSession();
  expect(session).toHaveLength(1);
  expect(session[0]).toMatchObject({ username: "admin", role: ADMIN });

  await expect(actor.logout()).resolves.toBeNull();
  await expect(actor.getSession()).resolves.toEqual([]);
});

it("rejects a wrong password and a mismatched role", async () => {
  await expect(actor.login("admin", "wrong", ADMIN)).resolves.toMatchObject({
    err: { invalidCredentials: null },
  });
  // The seeded admin cannot sign in through the officer role selector.
  await expect(actor.login("admin", "admin123", OFFICER)).resolves.toMatchObject({
    err: { invalidCredentials: null },
  });
});

it("adds a farmer and rejects a duplicate code", async () => {
  await actor.login("admin", "admin123", ADMIN);

  const created = await actor.addFarmer(
    "G-001",
    "සුනිල් පෙරේරා",
    "0771234567",
    "කුරුණෑගල",
    "පාරේ 12",
    "",
  );
  expect(created).toMatchObject({ ok: { code: "G-001", name: "සුනිල් පෙරේරා" } });

  const duplicate = await actor.addFarmer(
    "G-001",
    "වෙනත් නමක්",
    "",
    "",
    "",
    "",
  );
  expect(duplicate).toMatchObject({ err: { duplicateCode: "G-001" } });

  const farmers = await actor.listFarmers();
  expect(farmers).toHaveLength(1);
});

it("freezes the price into a saved harvest when the price list later changes", async () => {
  await actor.login("admin", "admin123", ADMIN);
  const farmers = await actor.listFarmers();
  const farmerId = farmers[0].id;

  const saved = await actor.addHarvest({
    date: "2026-09-25",
    farmerId,
    product: BANANA,
    kg: 10n,
    pricePerKg: 100n,
  });
  expect(saved).toMatchObject({ ok: { total: 1000n, pricePerKg: 100n } });

  // Change the current banana price; the saved record must not move.
  await actor.setPrice(BANANA, 175n);

  const harvests = await actor.listHarvests();
  expect(harvests).toHaveLength(1);
  expect(harvests[0]).toMatchObject({ total: 1000n, pricePerKg: 100n });
});

it("renders all six report kinds with totals", async () => {
  await actor.login("admin", "admin123", ADMIN);
  const kinds = [
    { daily: null },
    { weekly: null },
    { monthly: null },
    { byFarmer: null },
    { byProduct: null },
    { byOfficer: null },
  ] as const;

  for (const kind of kinds) {
    const report = await actor.getReport(kind, "0000-01-01", "9999-12-31");
    expect(report).toMatchObject({ ok: { kind } });
    if ("ok" in report) {
      expect(report.ok.totalKg).toBe(10n);
      expect(report.ok.totalValue).toBe(1000n);
    }
  }
});

it("returns today's dashboard totals", async () => {
  await actor.login("admin", "admin123", ADMIN);
  const dashboard = await actor.getDashboard("2026-09-25");
  expect(dashboard.stats).toMatchObject({
    totalKg: 10n,
    totalValue: 1000n,
    farmerCount: 1n,
  });
});

it("lets each of the six seeded officers sign in and save a harvest", async () => {
  const farmers = await actor.listFarmers();
  const farmerId = farmers[0].id;

  for (let index = 1; index <= 6; index += 1) {
    const username = `officer${index}`;
    const result = await actor.login(username, "officer123", OFFICER);
    expect(result).toMatchObject({ ok: { username, role: OFFICER } });

    const saved = await actor.addHarvest({
      date: "2026-09-25",
      farmerId,
      product: BANANA,
      kg: 1n,
      pricePerKg: 100n,
    });
    expect(saved).toMatchObject({ ok: { total: 100n } });
  }
});

it("lists the six seeded officer accounts for an admin", async () => {
  await actor.login("admin", "admin123", ADMIN);
  const officers = await actor.listOfficers();
  expect(officers).toHaveLength(6);
  expect(officers.map((officer) => officer.username)).toEqual([
    "officer1",
    "officer2",
    "officer3",
    "officer4",
    "officer5",
    "officer6",
  ]);
});

it("exposes the seeded admin and six officer credentials publicly", async () => {
  // The pre-login panel reads this without a session, so it must answer for an
  // anonymous caller and return exactly the migration-seeded rows (ids 0-6).
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  const credentials = await guest.getSeededCredentials();

  expect(credentials).toHaveLength(7);
  expect(credentials[0]).toMatchObject({
    username: "admin",
    password: "admin123",
    role: ADMIN,
  });
  expect(credentials.slice(1).map((row) => row.username)).toEqual([
    "officer1",
    "officer2",
    "officer3",
    "officer4",
    "officer5",
    "officer6",
  ]);
  for (const row of credentials.slice(1)) {
    expect(row).toMatchObject({ password: "officer123", role: OFFICER });
  }
});

it("signs in with every credential the panel displays", async () => {
  // The panel's promise is that each displayed pair actually works with the
  // matching role selector. Read the pairs from the backend, then use them.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  const credentials = await guest.getSeededCredentials();

  for (const row of credentials) {
    const result = await actor.login(row.username, row.password, row.role);
    expect(result).toMatchObject({
      ok: { username: row.username, role: row.role },
    });
  }
});

it("rejects an officer from admin-only methods", async () => {
  await actor.login("officer1", "officer123", OFFICER);
  await expect(actor.listOfficers()).rejects.toThrow();
  await expect(actor.setPrice(BANANA, 999n)).rejects.toThrow();
});

it("rejects an anonymous caller from admin-only methods", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.listOfficers()).rejects.toThrow();
});
