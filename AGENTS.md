# Project Guidance

## User Preferences

- Entire user interface must be in Sinhala language
- Mobile-first responsive design for Android and iPhone phones
- Professional agricultural theme using green, yellow and white
- Large tap targets (at least 44px) and clear Sinhala text for field use
- Role-based access: officers enter harvest data only, admin has full access
- Seed six officer accounts and default product prices
- Admin and Officer login credentials must be clearly displayed on the sign-in screen
- Officer passwords must never be visible to a signed-in Officer; only Admin manages officer accounts

## Verified Commands

- **typecheck**: `pnpm -r --if-present run typecheck`
- **fix**: `pnpm -r --if-present run fix`
- **build**: `pnpm -r --if-present run build`

## Learnings

- Motoko Text comparison is lexicographic, so an empty-string range bound makes `date <= ""` false and silently empties every filtered result; group-by reports need a wide bound like 0000-01-01..9999-12-31.
- Motoko mixin parameters are passed by value, so mutable collections must be wrapped in a record with a `var` field ({ var items : [T] }) declared once in main.mo and passed to every mixin that reads or writes it.
- Each mixin included into one actor shares a single top-level scope, so private helper names must be unique across all mixins or the compiler reports M0051 duplicate definition.
- When main.mo declares shared mutable state as wrapper records, the migration's NewActor must use the same wrapper shape and return { var items = ... }; plain arrays fail both the upgrade compatibility check and fresh-install replay.
- With check-limit=1 and an empty-actor baseline, every file in the migration chain counts as pending, so the init migration must be folded into the single pending migration.
- `label` is a reserved Motoko keyword and cannot be a record field name.
- sonner toasts render nothing unless a <Toaster /> is mounted in the tree; defining the component is not enough.
- TanStack Router beforeLoad runs before the root route component mounts, so guards cannot rely on query cache populated by a provider rendered inside that component; resolve the session from the backend directly.
- Backend HarvestSummary omits farmerName, so a dashboard recent list needing farmer names should derive from full Harvest records instead.
- The generated app needs a root `test` script; without one the tester gate fails with generated_app_tests_failed until the tester adds Vitest frontend tests plus a PocketIC backend lane.
- A new backend query only reaches the frontend after `mops build` regenerates src/backend/dist/backend.did and `pnpm bindgen` rewrites backend.d.ts/backend.ts; editing the .mo alone leaves the actor interface stale.
- The typed ActorMock in src/frontend/src/__tests__/test-utils.tsx maps every backendInterface method, so any new backend method must be added there or `pnpm typecheck` fails.
- A public query that returns seeded credentials can filter by the seeded id range (ids 0-6) to guarantee it never returns accounts created later via createOfficer.
- Rendering a credentials panel inside LoginPage (mounted only when session is null) guarantees officer passwords never appear in the signed-in shell without extra route logic.
