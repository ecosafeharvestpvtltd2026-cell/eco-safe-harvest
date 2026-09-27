mixin () {
  /// Static Markdown documentation of the backend's public API.
  public query func getApiDoc() : async Text {
    "# Eco Safe Harvest — Backend API\n\n" #
    "## Purpose\n\n" #
    "Eco Safe Harvest is a harvest-collection backend for a company that buys fruits and\n" #
    "vegetables from farmers. It stores farmer records, harvest entries, the current\n" #
    "price list, officer accounts and sessions, and it answers dashboard and report\n" #
    "queries. All weights are whole kilograms, all money is whole Sri Lankan Rupees\n" #
    "(LKR), and all dates are ISO `YYYY-MM-DD` text in the local business calendar.\n\n" #
    "## Authentication\n\n" #
    "Sign-in is application-level: call `login(username, password, role)` with the\n" #
    "role the user selected (`#admin` or `#officer`). The role must match the stored\n" #
    "account role or the call returns `#err(#invalidCredentials)`. On success the\n" #
    "backend records a session keyed by the caller's principal and returns a\n" #
    "`Session` (`id`, `username`, `displayName`, `role`). `getSession()` returns the\n" #
    "current session or `null`; `logout()` clears it. Sessions live in stable state,\n" #
    "so a page refresh keeps the user signed in.\n\n" #
    "### Seeded credentials (public, pre-login)\n\n" #
    "`getSeededCredentials()` is a public `query` call that requires no session and\n" #
    "no registration. It returns the seeded sign-in credentials the app displays on\n" #
    "its pre-login credentials panel: the single admin account and the six officer\n" #
    "accounts created by the migration seed. Each row is a `CredentialRow`\n" #
    "(`username`, `password`, `role`, `displayName`). The seeded admin username is\n" #
    "`admin` with password `admin123`; the six officers are `officer1` through\n" #
    "`officer6`, each with temporary password `officer123`. These are the\n" #
    "authoritative credentials used by `login`, so the displayed values always work.\n" #
    "The endpoint returns only the seeded accounts (ids 0-6) and never any account\n" #
    "created later through `createOfficer`, and it exposes no other account data.\n" #
    "This is the only endpoint that returns passwords; it exists solely to power the\n" #
    "pre-login credentials panel the app owner requested.\n\n" #
    "The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "`/.well-known/ii-derivation-origin` when available. An agent that already holds\n" #
    "the user's Internet Identity authorization derives the correct per-app principal\n" #
    "against that origin (for example `icp identity link web <name> --app <host>`).\n" #
    "Such a delegation acts with the user's full authority in this app until it\n" #
    "expires.\n\n" #
    "### Registration prerequisite\n\n" #
    "The authorization component gates access on registration. A direct API caller\n" #
    "must call `_initialize_access_control()` once as a signed-in (non-anonymous)\n" #
    "caller before any role-guarded call, including guarded queries. The first\n" #
    "principal to initialize becomes `#admin`; every later principal becomes `#user`.\n" #
    "An unregistered caller receives the trap `User is not registered` from\n" #
    "`getCallerUserRole` / `isCallerAdmin`, and an anonymous caller receives `#guest`.\n" #
    "Registration happens only when a caller signs in through the app's own\n" #
    "frontend, so a principal that never did so is unregistered even when it belongs\n" #
    "to the app's owner, and a signed-in caller derived against a different origin is\n" #
    "a different principal than the one the frontend registered.\n\n" #
    "## Authorization\n\n" #
    "Every domain endpoint requires an application session. `login` and\n" #
    "`getSeededCredentials` are the only unguarded domain calls. Admin-only\n" #
    "endpoints are `addFarmer`, `updateFarmer`, `setPrice`, `listOfficers`,\n" #
    "`createOfficer`, `updateOfficer`, `resetOfficerPassword`, `updateHarvest` and\n" #
    "`deleteHarvest`; an officer calling one of these receives a trap with message\n" #
    "`notAuthorized`. Officer account management (`listOfficers`, `createOfficer`,\n" #
    "`updateOfficer`, `resetOfficerPassword`) is therefore reachable only by a\n" #
    "signed-in admin, and `listOfficers` returns `Session` rows that never include a\n" #
    "password. Officers may read\n" #
    "farmers, prices, harvests, reports and the dashboard, and may add harvest\n" #
    "records. `listHarvests`, `getHarvest`, `getReport` and `getDashboard` are scoped:\n" #
    "an officer sees only records they entered, while an admin sees all records.\n\n" #
    "## Units and encodings\n\n" #
    "- `Kg` and `Money` are `Nat` (whole numbers). `total = kg * pricePerKg`.\n" #
    "- `DateText` is `YYYY-MM-DD`; `createdAt` / `updatedAt` are `Int` nanoseconds.\n" #
    "- `Product` is one of `#passion`, `#pear`, `#guava`, `#banana`, `#woodApple`,\n" #
    "  `#mustard`, `#other`.\n" #
    "- `Role` is `#admin` or `#officer`.\n" #
    "- Optional values cross the boundary as Candid `opt`; `null` means absent.\n\n" #
    "## Lifecycle and polling\n\n" #
    "All read endpoints (`listFarmers`, `searchFarmers`, `getFarmer`, `listHarvests`,\n" #
    "`getHarvest`, `getFarmerHarvests`, `listPrices`, `getReport`, `getDashboard`,\n" #
    "`getSession`, `getSeededCredentials`, `listOfficers`, `getApiDoc`) are `query`\n" #
    "calls and return the\n" #
    "current committed state immediately; there is no job to poll. Mutations take\n" #
    "effect atomically within the call, so a successful response already reflects the\n" #
    "new state. `getDashboard(today)` takes the caller's business date explicitly;\n" #
    "pass the local `YYYY-MM-DD`.\n\n" #
    "## Mutation retry safety\n\n" #
    "`addFarmer` rejects a duplicate `code` with `#err(#duplicateCode(code))`, so a\n" #
    "retried add cannot create a second farmer with the same code. `addHarvest` is\n" #
    "not idempotent: each successful call appends a new record with a fresh id, so a\n" #
    "retried call creates a duplicate entry — confirm the result before retrying.\n" #
    "`updateFarmer`, `updateHarvest`, `setPrice`, `updateOfficer` and\n" #
    "`resetOfficerPassword` are idempotent (same input, same end state).\n" #
    "`deleteHarvest` is destructive and returns `#err(#notFound(id))` on a second\n" #
    "call. `login` replaces the caller's session; `logout` is safe to repeat.\n\n" #
    "## Errors and gotchas\n\n" #
    "- `login` returns `#err(#invalidCredentials)` for a wrong password, an inactive\n" #
    "  account, or a role that does not match the account.\n" #
    "- `addFarmer` / `updateFarmer` return `#err(#duplicateCode(code))` or\n" #
    "  `#err(#notFound(id))`.\n" #
    "- `addHarvest` / `updateHarvest` return `#err(#farmerNotFound(id))` when the\n" #
    "  farmer does not exist, and `#err(#notFound(id))` when editing a missing record.\n" #
    "- `getReport` returns `#err(#invalidRange)` when `from > to`.\n" #
    "- `createOfficer` returns `#err(#usernameTaken)` for a duplicate username.\n" #
    "- Each harvest record permanently stores the `pricePerKg` and `total` used at\n" #
    "  entry time; later `setPrice` calls never change past records.\n" #
    "- `getFarmer` returns `null` for an unknown id; `getHarvest` returns `null` for\n" #
    "  an unknown id or a record the caller may not see.\n" #
    "- `getReport` breakdown rows carry `key` (stable machine key), `title` (Sinhala\n" #
    "  display label), `kg`, `value` and `count`.\n\n" #
    "## Data intelligence (OQL)\n\n" #
    "The backend exposes its persisted collections to the Caffeine Data\n" #
    "Intelligence agent through the Object Query Layer. `schema()` returns the\n" #
    "queryable entity definitions and `execute(json)` runs a JSON query against\n" #
    "them. Both are `query` calls.\n\n" #
    "Every entity is `#controllerOnly`: the agent, which calls as the platform\n" #
    "controller, can read all rows, while ordinary signed-in users cannot read\n" #
    "these tables directly — they read the same data through the session-guarded\n" #
    "endpoints above. The exposed entities are:\n\n" #
    "- `farmer` (primary key `id`) — farmer records.\n" #
    "- `harvest` (primary key `id`) — harvest records; `farmerId` is an edge to\n" #
    "  `farmer`, so queries can traverse `farmerId.name`.\n" #
    "- `price` (primary key `product`) — the current price list, one row per\n" #
    "  product.\n" #
    "- `officer` (primary key `id`) — officer and admin accounts; the `password`\n" #
    "  column is hidden from the schema and the default projection.\n" #
    "- `harvestSummary` (primary key `id`) — the compact per-record summary\n" #
    "  (`date`, `product`, `kg`, `pricePerKg`, `total`, `officerId`,\n" #
    "  `officerName`) used by farmer detail and dashboard views.\n\n" #
    "Variant columns are encoded as their stable machine keys: `product` is one\n" #
    "of `passion`, `pear`, `guava`, `banana`, `woodApple`, `mustard`, `other`,\n" #
    "and `role` is `admin` or `officer`. Schema fields are listed in\n" #
    "lexicographic order.\n";
  };
};
